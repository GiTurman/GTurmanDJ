// lib/mp3Export.js
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpegInstance = null
let isLoaded = false

export async function loadFFmpeg(onProgress) {
  if (isLoaded && ffmpegInstance) return ffmpegInstance
  ffmpegInstance = new FFmpeg()
  ffmpegInstance.on('log', ({ message }) => console.debug('[ffmpeg]', message))

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  isLoaded = true
  return ffmpegInstance
}

export async function convertWebmToMp3(webmBlob, onProgress, options = {}) {
  const { bitrate = '192k' } = options
  const ff = await loadFFmpeg()
  ff.on('progress', ({ progress }) => onProgress?.(Math.min(99, Math.round(progress * 100))))
  await ff.writeFile('input.webm', await fetchFile(webmBlob))
  await ff.exec(['-i', 'input.webm', '-vn', '-codec:a', 'libmp3lame', '-b:a', bitrate, '-ar', '44100', '-ac', '2', 'output.mp3'])
  const data = await ff.readFile('output.mp3')
  const mp3Blob = new Blob([data.buffer], { type: 'audio/mpeg' })
  try { await ff.deleteFile('input.webm'); await ff.deleteFile('output.mp3') } catch {}
  onProgress?.(100)
  return mp3Blob
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function exportMixAsMp3(webmBlob, onProgress, options = {}) {
  const filename = options.filename || `aimix_${new Date().toISOString().slice(0,10)}.mp3`
  if (!webmBlob || webmBlob.size === 0) throw new Error('No recording. Press RECORD first.')
  try {
    const mp3Blob = await convertWebmToMp3(webmBlob, onProgress, options)
    downloadBlob(mp3Blob, filename)
    return { format: 'mp3', size: mp3Blob.size }
  } catch (err) {
    console.warn('MP3 failed, downloading WebM:', err)
    downloadBlob(webmBlob, filename.replace('.mp3', '.webm'))
    return { format: 'webm', size: webmBlob.size }
  }
}
