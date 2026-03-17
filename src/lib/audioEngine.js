// lib/audioEngine.js — Web Audio API DJ Engine

let audioContext = null;
let masterGain = null;
let recorder = null;
let recordedChunks = [];

const decks = {
  a: { source: null, gainNode: null, eqHigh: null, eqMid: null, eqLow: null, startTime: 0, offset: 0, buffer: null, playing: false },
  b: { source: null, gainNode: null, eqHigh: null, eqMid: null, eqLow: null, startTime: 0, offset: 0, buffer: null, playing: false }
};

const crossfaderNodes = { a: null, b: null };

function buildAudioGraph() {
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(audioContext.destination);

  crossfaderNodes.a = audioContext.createGain();
  crossfaderNodes.b = audioContext.createGain();
  crossfaderNodes.a.gain.value = 1;
  crossfaderNodes.b.gain.value = 1;
  crossfaderNodes.a.connect(masterGain);
  crossfaderNodes.b.connect(masterGain);

  for (const deckId of ['a', 'b']) {
    const deck = decks[deckId];
    deck.gainNode = audioContext.createGain();
    deck.gainNode.gain.value = 0.9;

    deck.eqHigh = audioContext.createBiquadFilter();
    deck.eqHigh.type = 'highshelf';
    deck.eqHigh.frequency.value = 8000;
    deck.eqHigh.gain.value = 0;

    deck.eqMid = audioContext.createBiquadFilter();
    deck.eqMid.type = 'peaking';
    deck.eqMid.frequency.value = 1000;
    deck.eqMid.Q.value = 1;
    deck.eqMid.gain.value = 0;

    deck.eqLow = audioContext.createBiquadFilter();
    deck.eqLow.type = 'lowshelf';
    deck.eqLow.frequency.value = 250;
    deck.eqLow.gain.value = 0;

    // gainNode → eqHigh → eqMid → eqLow → crossfader → master
    deck.gainNode.connect(deck.eqHigh);
    deck.eqHigh.connect(deck.eqMid);
    deck.eqMid.connect(deck.eqLow);
    deck.eqLow.connect(crossfaderNodes[deckId]);
  }
}

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    buildAudioGraph();
  }

  // CRITICAL: resume suspended context (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

export async function loadAudioFile(deckId, file) {
  const ctx = initAudio();
  const arrayBuffer = await file.arrayBuffer();

  // decodeAudioData needs resumed context
  if (ctx.state === 'suspended') await ctx.resume();

  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  decks[deckId].buffer = audioBuffer;
  decks[deckId].offset = 0;

  const bpm = await estimateBPM(audioBuffer);

  return {
    buffer: audioBuffer,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
    bpm
  };
}

export async function playDeck(deckId) {
  const ctx = initAudio();

  // Always resume before playing
  if (ctx.state === 'suspended') await ctx.resume();

  const deck = decks[deckId];
  if (!deck.buffer) return false;
  if (deck.playing) stopDeck(deckId);

  // Rebuild gainNode if graph was lost
  if (!deck.gainNode) buildAudioGraph();

  deck.source = ctx.createBufferSource();
  deck.source.buffer = deck.buffer;
  deck.source.connect(deck.gainNode);

  const startOffset = Math.max(0, Math.min(deck.offset, deck.buffer.duration - 0.01));
  deck.source.start(0, startOffset);
  deck.startTime = ctx.currentTime - startOffset;
  deck.playing = true;

  deck.source.onended = () => {
    deck.playing = false;
    deck.offset = 0;
  };

  return true;
}

export function stopDeck(deckId) {
  const deck = decks[deckId];
  if (deck.source && deck.playing) {
    try {
      deck.offset = Math.max(0, audioContext.currentTime - deck.startTime);
      deck.source.onended = null;
      deck.source.stop();
    } catch (e) {
      // ignore if already stopped
    }
    deck.source = null;
    deck.playing = false;
  }
}

export function cueDeck(deckId) {
  stopDeck(deckId);
  decks[deckId].offset = 0;
}

export function getDeckPosition(deckId) {
  const deck = decks[deckId];
  if (!deck.buffer || deck.buffer.duration === 0) return 0;
  if (!deck.playing) return deck.offset / deck.buffer.duration;
  const elapsed = audioContext.currentTime - deck.startTime;
  return Math.min(1, elapsed / deck.buffer.duration);
}

export function setDeckVolume(deckId, value) {
  // value: 0–100
  const deck = decks[deckId];
  if (deck.gainNode) {
    deck.gainNode.gain.setTargetAtTime(value / 100, audioContext?.currentTime || 0, 0.01);
  }
}

export function setMasterVolume(value) {
  if (masterGain && audioContext) {
    masterGain.gain.setTargetAtTime(value / 100, audioContext.currentTime, 0.01);
  }
}

export function setCrossfader(value) {
  // value: 0 = full A, 50 = equal, 100 = full B
  if (!crossfaderNodes.a || !crossfaderNodes.b || !audioContext) return;
  const pos = value / 100;
  // Equal-power crossfade curve
  crossfaderNodes.a.gain.setTargetAtTime(Math.cos(pos * Math.PI / 2), audioContext.currentTime, 0.01);
  crossfaderNodes.b.gain.setTargetAtTime(Math.cos((1 - pos) * Math.PI / 2), audioContext.currentTime, 0.01);
}

export function setEQ(deckId, band, value) {
  const deck = decks[deckId];
  const db = parseFloat(value);
  if (!audioContext) return;
  const t = audioContext.currentTime;
  if (band === 'high' && deck.eqHigh) deck.eqHigh.gain.setTargetAtTime(db, t, 0.01);
  if (band === 'mid'  && deck.eqMid)  deck.eqMid.gain.setTargetAtTime(db, t, 0.01);
  if (band === 'low'  && deck.eqLow)  deck.eqLow.gain.setTargetAtTime(db, t, 0.01);
}

export function setDeckBPM(deckId, originalBpm, targetBpm) {
  const deck = decks[deckId];
  if (deck.source && originalBpm > 0) {
    deck.source.playbackRate.value = targetBpm / originalBpm;
  }
}

export function seekDeck(deckId, position) {
  const deck = decks[deckId];
  if (!deck.buffer) return;
  const wasPlaying = deck.playing;
  if (wasPlaying) stopDeck(deckId);
  deck.offset = position * deck.buffer.duration;
  if (wasPlaying) playDeck(deckId);
}

// ─── Recording ───────────────────────────────────────────────────────────────

export function startRecording() {
  const ctx = initAudio();
  const dest = ctx.createMediaStreamDestination();
  masterGain.connect(dest);
  recordedChunks = [];

  // Pick best supported mimeType
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : MediaRecorder.isTypeSupported('audio/webm')
    ? 'audio/webm'
    : 'audio/ogg';

  recorder = new MediaRecorder(dest.stream, { mimeType });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
  recorder.start(100);
  return true;
}

export function stopRecording() {
  return new Promise((resolve) => {
    if (!recorder) return resolve(null);
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: recorder.mimeType || 'audio/webm' });
      resolve(blob);
    };
    recorder.stop();
  });
}

// ─── BPM Detection ───────────────────────────────────────────────────────────

async function estimateBPM(audioBuffer) {
  try {
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = Math.min(audioBuffer.duration, 20);
    const samples = Math.floor(duration * sampleRate);
    const step = Math.floor(sampleRate / 4000);
    const downsampled = [];
    for (let i = 0; i < samples; i += step) downsampled.push(Math.abs(data[i]));

    const effectiveSR = 4000;
    const minLag = Math.floor(60 / 200 * effectiveSR);
    const maxLag = Math.floor(60 / 70  * effectiveSR);
    let bestCorr = -1, bestLag = minLag;

    for (let lag = minLag; lag <= Math.min(maxLag, downsampled.length / 2); lag++) {
      let corr = 0;
      for (let i = 0; i < downsampled.length - lag; i++) corr += downsampled[i] * downsampled[i + lag];
      if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
    }

    const bpm = Math.round(60 / (bestLag / effectiveSR));
    return Math.max(70, Math.min(200, bpm));
  } catch {
    return 128;
  }
}

// ─── Waveform ────────────────────────────────────────────────────────────────

export function extractWaveformData(audioBuffer, points = 150) {
  if (!audioBuffer?.getChannelData) {
    return Array.from({ length: points }, () => Math.random() * 0.8 + 0.1);
  }
  const data = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(data.length / points);
  const waveform = [];
  for (let i = 0; i < points; i++) {
    let max = 0;
    const start = i * blockSize;
    for (let j = 0; j < blockSize; j++) {
      const abs = Math.abs(data[start + j] || 0);
      if (abs > max) max = abs;
    }
    waveform.push(max);
  }
  return waveform;
}
