// audio.js — Web Audio API engine

let ctx = null
let masterGain = null
let cfA = null  // crossfader gain A
let cfB = null  // crossfader gain B
let recorder = null
let recChunks = []

const decks = {
  a: { buf: null, src: null, gainNode: null, eqH: null, eqM: null, eqL: null, startTime: 0, offset: 0, playing: false },
  b: { buf: null, src: null, gainNode: null, eqH: null, eqM: null, eqL: null, startTime: 0, offset: 0, playing: false },
}

function buildGraph() {
  masterGain = ctx.createGain()
  masterGain.gain.value = 0.85
  masterGain.connect(ctx.destination)

  cfA = ctx.createGain(); cfA.gain.value = 1; cfA.connect(masterGain)
  cfB = ctx.createGain(); cfB.gain.value = 1; cfB.connect(masterGain)

  for (const id of ['a', 'b']) {
    const d = decks[id]
    d.gainNode = ctx.createGain(); d.gainNode.gain.value = 0.85
    d.eqH = ctx.createBiquadFilter(); d.eqH.type = 'highshelf'; d.eqH.frequency.value = 8000; d.eqH.gain.value = 0
    d.eqM = ctx.createBiquadFilter(); d.eqM.type = 'peaking'; d.eqM.frequency.value = 1000; d.eqM.Q.value = 1; d.eqM.gain.value = 0
    d.eqL = ctx.createBiquadFilter(); d.eqL.type = 'lowshelf'; d.eqL.frequency.value = 250; d.eqL.gain.value = 0
    d.gainNode.connect(d.eqH)
    d.eqH.connect(d.eqM)
    d.eqM.connect(d.eqL)
    d.eqL.connect(id === 'a' ? cfA : cfB)
  }
}

export function initAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    buildGraph()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export async function loadFile(deckId, file) {
  initAudio()
  if (ctx.state === 'suspended') await ctx.resume()
  const ab = await file.arrayBuffer()
  const buf = await ctx.decodeAudioData(ab)
  decks[deckId].buf = buf
  decks[deckId].offset = 0
  decks[deckId].playing = false
  if (decks[deckId].src) { try { decks[deckId].src.stop() } catch (e) { console.error(e) } }
  decks[deckId].src = null
  const bpm = detectBPM(buf)
  const waveform = getWaveform(buf, 180)
  return { duration: buf.duration, bpm, waveform }
}

export async function play(deckId) {
  initAudio()
  if (ctx.state === 'suspended') await ctx.resume()
  const d = decks[deckId]
  if (!d.buf) return false
  if (d.playing) stop(deckId)
  if (!d.gainNode) buildGraph()

  d.src = ctx.createBufferSource()
  d.src.buffer = d.buf
  d.src.connect(d.gainNode)
  const off = Math.max(0, Math.min(d.offset, d.buf.duration - 0.1))
  d.src.start(0, off)
  d.startTime = ctx.currentTime - off
  d.playing = true
  d.src.onended = () => { d.playing = false; d.offset = 0 }
  return true
}

export function stop(deckId) {
  const d = decks[deckId]
  if (d.src && d.playing) {
    try {
      d.offset = Math.max(0, ctx.currentTime - d.startTime)
      d.src.onended = null
      d.src.stop()
    } catch (e) { console.error(e) }
    d.src = null
    d.playing = false
  }
}

export function cue(deckId) {
  stop(deckId)
  decks[deckId].offset = 0
}

export function getPosition(deckId) {
  const d = decks[deckId]
  if (!d.buf || d.buf.duration === 0) return 0
  if (!d.playing) return d.offset / d.buf.duration
  return Math.min(1, (ctx.currentTime - d.startTime) / d.buf.duration)
}

export function setVolume(deckId, v) {
  const d = decks[deckId]
  if (d.gainNode && ctx) d.gainNode.gain.setTargetAtTime(v / 100, ctx.currentTime, 0.01)
}

export function setMaster(v) {
  if (masterGain && ctx) masterGain.gain.setTargetAtTime(v / 100, ctx.currentTime, 0.01)
}

export function setCrossfader(v) {
  if (!cfA || !cfB || !ctx) return
  const p = v / 100
  cfA.gain.setTargetAtTime(Math.cos(p * Math.PI / 2), ctx.currentTime, 0.01)
  cfB.gain.setTargetAtTime(Math.cos((1 - p) * Math.PI / 2), ctx.currentTime, 0.01)
}

export function setEQ(deckId, band, db) {
  const d = decks[deckId]
  if (!ctx) return
  const t = ctx.currentTime
  const v = parseFloat(db)
  if (band === 'high' && d.eqH) d.eqH.gain.setTargetAtTime(v, t, 0.01)
  if (band === 'mid' && d.eqM) d.eqM.gain.setTargetAtTime(v, t, 0.01)
  if (band === 'low' && d.eqL) d.eqL.gain.setTargetAtTime(v, t, 0.01)
}

export function syncBPM(deckId, from, to) {
  const d = decks[deckId]
  if (d.src && from > 0) d.src.playbackRate.value = to / from
}

export function startRec() {
  initAudio()
  const dest = ctx.createMediaStreamDestination()
  masterGain.connect(dest)
  recChunks = []
  const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
  recorder = new MediaRecorder(dest.stream, { mimeType: mime })
  recorder.ondataavailable = e => { if (e.data.size > 0) recChunks.push(e.data) }
  recorder.start(100)
}

export function stopRec() {
  return new Promise(resolve => {
    if (!recorder) return resolve(null)
    recorder.onstop = () => resolve(new Blob(recChunks, { type: recorder.mimeType || 'audio/webm' }))
    recorder.stop()
  })
}

function detectBPM(buf) {
  try {
    const data = buf.getChannelData(0)
    const sr = buf.sampleRate
    const dur = Math.min(buf.duration, 20)
    const n = Math.floor(dur * sr)
    const step = Math.floor(sr / 4000)
    const ds = []
    for (let i = 0; i < n; i += step) ds.push(Math.abs(data[i]))
    const esr = 4000
    const minL = Math.floor(60 / 200 * esr)
    const maxL = Math.floor(60 / 70 * esr)
    let best = -1, bestL = minL
    for (let lag = minL; lag <= Math.min(maxL, ds.length / 2); lag++) {
      let c = 0
      for (let i = 0; i < ds.length - lag; i++) c += ds[i] * ds[i + lag]
      if (c > best) { best = c; bestL = lag }
    }
    return Math.max(70, Math.min(200, Math.round(60 / (bestL / esr))))
  } catch { return 128 }
}

export function getWaveform(buf, points = 180) {
  if (!buf?.getChannelData) return Array.from({ length: points }, () => Math.random() * 0.7 + 0.15)
  const data = buf.getChannelData(0)
  const block = Math.floor(data.length / points)
  const out = []
  for (let i = 0; i < points; i++) {
    let max = 0
    for (let j = 0; j < block; j++) {
      const v = Math.abs(data[i * block + j] || 0)
      if (v > max) max = v
    }
    out.push(max)
  }
  return out
}
