// export.js — ffmpeg.wasm MP3 export
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ff = null
let loaded = false

async function getFFmpeg() {
  if (loaded && ff) return ff
  ff = new FFmpeg()
  const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  await ff.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  loaded = true
  return ff
}

export async function exportMP3(blob, onProgress) {
  if (!blob || blob.size === 0) throw new Error('No recording found')
  const filename = `aimix_${new Date().toISOString().slice(0, 10)}.mp3`

  try {
    const f = await getFFmpeg()
    f.on('progress', ({ progress }) => onProgress?.(Math.min(99, Math.round(progress * 100))))
    await f.writeFile('in.webm', await fetchFile(blob))
    await f.exec(['-i', 'in.webm', '-vn', '-codec:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100', '-ac', '2', 'out.mp3'])
    const data = await f.readFile('out.mp3')
    const mp3 = new Blob([data.buffer], { type: 'audio/mpeg' })
    try { await f.deleteFile('in.webm'); await f.deleteFile('out.mp3') } catch {}
    onProgress?.(100)
    download(mp3, filename)
    return 'mp3'
  } catch (e) {
    console.warn('ffmpeg failed, saving WebM:', e)
    download(blob, filename.replace('.mp3', '.webm'))
    return 'webm'
  }
}

function download(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
