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

    crossfaderNodes.a = audioContext.createGain();
    crossfaderNodes.b = audioContext.createGain();
    crossfaderNodes.a.gain.value = 1;
    crossfaderNodes.b.gain.value = 1;
    crossfaderNodes.a.connect(masterGain);
    crossfaderNodes.b.connect(masterGain);

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
      deck.gainNode.connect(deck.eqHigh);
      deck.eqHigh.connect(deck.eqMid);
      deck.eqMid.connect(deck.eqLow);
      deck.eqLow.connect(crossfaderNodes[deckId]);
    }
  }
  if (audioContext.state === 'suspended') audioContext.resume();
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
  if (!deck.buffer) return false;
  if (deck.playing) stopDeck(deckId);
  deck.source = ctx.createBufferSource();
  deck.source.buffer = deck.buffer;
  deck.source.connect(deck.gainNode);
  deck.source.start(0, deck.offset);
  deck.startTime = ctx.currentTime - deck.offset;
  deck.playing = true;
  deck.source.onended = () => { deck.playing = false; };
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
  if (decks[deckId].gainNode) decks[deckId].gainNode.gain.value = value / 100;
}

export function setMasterVolume(value) {
  if (masterGain) masterGain.gain.value = value / 100;
}

export function setCrossfader(value) {
  if (!crossfaderNodes.a || !crossfaderNodes.b) return;
  const pos = value / 100;
  crossfaderNodes.a.gain.value = Math.cos(pos * Math.PI / 2);
  crossfaderNodes.b.gain.value = Math.cos((1 - pos) * Math.PI / 2);
}

export function setEQ(deckId, band, value) {
  const deck = decks[deckId];
  const db = parseFloat(value);
  if (band === 'high' && deck.eqHigh) deck.eqHigh.gain.value = db;
  if (band === 'mid' && deck.eqMid) deck.eqMid.gain.value = db;
  if (band === 'low' && deck.eqLow) deck.eqLow.gain.value = db;
}

export function setDeckBPM(deckId, originalBpm, targetBpm) {
  const deck = decks[deckId];
  if (deck.source) deck.source.playbackRate.value = targetBpm / originalBpm;
}

export function seekDeck(deckId, position) {
  const deck = decks[deckId];
  if (!deck.buffer) return;
  const wasPlaying = deck.playing;
  if (wasPlaying) stopDeck(deckId);
  deck.offset = position * deck.buffer.duration;
  if (wasPlaying) playDeck(deckId);
}

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
    recorder.onstop = () => resolve(new Blob(recordedChunks, { type: 'audio/webm' }));
    recorder.stop();
  });
}

async function estimateBPM(audioBuffer) {
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const samples = Math.floor(Math.min(audioBuffer.duration, 30) * sampleRate);
  const step = Math.floor(sampleRate / 4000);
  const downsampled = [];
  for (let i = 0; i < samples; i += step) downsampled.push(data[i]);
  const effectiveSR = 4000;
  const minLag = Math.floor(60 / 200 * effectiveSR);
  const maxLag = Math.floor(60 / 70 * effectiveSR);
  let bestCorr = -1, bestLag = minLag;
  for (let lag = minLag; lag <= Math.min(maxLag, downsampled.length / 2); lag++) {
    let corr = 0;
    for (let i = 0; i < downsampled.length - lag; i++) corr += Math.abs(downsampled[i]) * Math.abs(downsampled[i + lag]);
    if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
  }
  return Math.max(70, Math.min(200, Math.round(60 / (bestLag / effectiveSR))));
}

export function extractWaveformData(audioBuffer, points = 200) {
  if (!audioBuffer?.getChannelData) return Array.from({ length: points }, () => Math.random() * 0.8);
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