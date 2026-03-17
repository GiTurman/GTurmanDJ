// lib/audioEngine.js
// Web Audio API engine for real-time DJ mixing

let audioContext = null;
let masterGain = null;
let recorder = null;
let recordedChunks = [];

const decks = {
  a: { source: null, gainNode: null, eqHigh: null, eqMid: null, eqLow: null, startTime: 0, offset: 0, buffer: null, playing: false },
  b: { source: null, gainNode: null, eqHigh: null, eqMid: null, eqLow: null, startTime: 0, offset: 0, buffer: null, playing: false }
};

const crossfaderNodes = { a: null, b: null };

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(audioContext.destination);

    // Setup crossfader nodes
    crossfaderNodes.a = audioContext.createGain();
    crossfaderNodes.b = audioContext.createGain();
    crossfaderNodes.a.gain.value = 1;
    crossfaderNodes.b.gain.value = 1;
    crossfaderNodes.a.connect(masterGain);
    crossfaderNodes.b.connect(masterGain);

    // Setup EQ chains for each deck
    for (const deckId of ['a', 'b']) {
      const deck = decks[deckId];
      deck.gainNode = audioContext.createGain();
      deck.gainNode.gain.value = 0.8;
      deck.eqHigh = audioContext.createBiquadFilter();
      deck.eqHigh.type = 'highshelf';
      deck.eqHigh.frequency.value = 8000;
      deck.eqMid = audioContext.createBiquadFilter();
      deck.eqMid.type = 'peaking';
      deck.eqMid.frequency.value = 1000;
      deck.eqMid.Q.value = 1;
      deck.eqLow = audioContext.createBiquadFilter();
      deck.eqLow.type = 'lowshelf';
      deck.eqLow.frequency.value = 250;

      // Chain: gainNode → eqHigh → eqMid → eqLow → crossfader
      deck.gainNode.connect(deck.eqHigh);
      deck.eqHigh.connect(deck.eqMid);
      deck.eqMid.connect(deck.eqLow);
      deck.eqLow.connect(crossfaderNodes[deckId]);
    }
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

export async function loadAudioFile(deckId, file) {
  const ctx = initAudio();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  decks[deckId].buffer = audioBuffer;
  decks[deckId].offset = 0;
  return {
    buffer: audioBuffer,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
    bpm: await estimateBPM(audioBuffer)
  };
}

export function playDeck(deckId) {
  const ctx = initAudio();
  const deck = decks[deckId];
  console.log(`Attempting to play deck ${deckId}, buffer exists: ${!!deck.buffer}`);
  if (!deck.buffer) return false;
  if (deck.playing) stopDeck(deckId);

  deck.source = ctx.createBufferSource();
  deck.source.buffer = deck.buffer;
  deck.source.connect(deck.gainNode);
  deck.source.start(0, deck.offset);
  deck.startTime = ctx.currentTime - deck.offset;
  deck.playing = true;
  deck.source.onended = () => { deck.playing = false; };
  console.log(`Deck ${deckId} started playing`);
  return true;
}

export function stopDeck(deckId) {
  const deck = decks[deckId];
  if (deck.source && deck.playing) {
    deck.offset = audioContext.currentTime - deck.startTime;
    deck.source.stop();
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
  if (!deck.buffer) return 0;
  if (!deck.playing) return deck.offset / deck.buffer.duration;
  const elapsed = audioContext.currentTime - deck.startTime;
  return (elapsed % deck.buffer.duration) / deck.buffer.duration;
}

export function setDeckVolume(deckId, value) {
  // value 0-100
  if (decks[deckId].gainNode) {
    decks[deckId].gainNode.gain.value = value / 100;
  }
}

export function setMasterVolume(value) {
  if (masterGain) masterGain.gain.value = value / 100;
}

export function setCrossfader(value) {
  // value 0-100, 0=full A, 50=equal, 100=full B
  if (!crossfaderNodes.a || !crossfaderNodes.b) return;
  const pos = value / 100;
  // Equal power crossfade
  crossfaderNodes.a.gain.value = Math.cos(pos * Math.PI / 2);
  crossfaderNodes.b.gain.value = Math.cos((1 - pos) * Math.PI / 2);
}

export function setEQ(deckId, band, value) {
  // value -12 to +12 dB
  const deck = decks[deckId];
  const db = parseFloat(value);
  if (band === 'high' && deck.eqHigh) deck.eqHigh.gain.value = db;
  if (band === 'mid' && deck.eqMid) deck.eqMid.gain.value = db;
  if (band === 'low' && deck.eqLow) deck.eqLow.gain.value = db;
}

export function setDeckBPM(deckId, originalBpm, targetBpm) {
  const deck = decks[deckId];
  if (deck.source) {
    deck.source.playbackRate.value = targetBpm / originalBpm;
  }
}

export function seekDeck(deckId, position) {
  // position 0-1
  const deck = decks[deckId];
  if (!deck.buffer) return;
  const wasPlaying = deck.playing;
  if (wasPlaying) stopDeck(deckId);
  deck.offset = position * deck.buffer.duration;
  if (wasPlaying) playDeck(deckId);
}

// --- Recording ---
export function startRecording() {
  const ctx = initAudio();
  const dest = ctx.createMediaStreamDestination();
  masterGain.connect(dest);
  recordedChunks = [];
  recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus' });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
  recorder.start(100);
  return true;
}

export function stopRecording() {
  return new Promise((resolve) => {
    if (!recorder) return resolve(null);
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      resolve(blob);
    };
    recorder.stop();
  });
}

export async function exportToMP3(webmBlob) {
  // Direct download of webm (browsers can play it; for true MP3 need server-side ffmpeg)
  // For client-side MP3, we'd need lamejs or ffmpeg.wasm
  const url = URL.createObjectURL(webmBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aimix_${Date.now()}.webm`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- BPM Detection (simple autocorrelation) ---
async function estimateBPM(audioBuffer) {
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = Math.min(audioBuffer.duration, 30);
  const samples = Math.floor(duration * sampleRate);

  // Downsample to 4000Hz for speed
  const step = Math.floor(sampleRate / 4000);
  const downsampled = [];
  for (let i = 0; i < samples; i += step) {
    downsampled.push(data[i]);
  }

  // Simple onset detection
  const effectiveSampleRate = 4000;
  const minBPM = 70, maxBPM = 200;
  const minLag = Math.floor(60 / maxBPM * effectiveSampleRate);
  const maxLag = Math.floor(60 / minBPM * effectiveSampleRate);

  let bestCorr = -1, bestLag = minLag;
  for (let lag = minLag; lag <= Math.min(maxLag, downsampled.length / 2); lag++) {
    let corr = 0;
    for (let i = 0; i < downsampled.length - lag; i++) {
      corr += Math.abs(downsampled[i]) * Math.abs(downsampled[i + lag]);
    }
    if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
  }

  const bpm = Math.round(60 / (bestLag / effectiveSampleRate));
  return Math.max(minBPM, Math.min(maxBPM, bpm));
}

// --- Waveform Data ---
export function extractWaveformData(audioBuffer, points = 200) {
  const data = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(data.length / points);
  const waveform = [];
  for (let i = 0; i < points; i++) {
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const abs = Math.abs(data[i * blockSize + j]);
      if (abs > max) max = abs;
    }
    waveform.push(max);
  }
  return waveform;
}
