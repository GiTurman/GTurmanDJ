// export.js — Audio export

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg = null

async function getFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg()
    await ffmpeg.load()
  }
  return ffmpeg
}

export async function exportMix(blob) {
  try {
    const ffmpeg = await getFFmpeg()
    const name = 'input.webm'
    await ffmpeg.writeFile(name, await fetchFile(blob))
    await ffmpeg.exec(['-i', name, 'output.mp3'])
    const data = await ffmpeg.readFile('output.mp3')
    return new Blob([data.buffer], { type: 'audio/mp3' })
  } catch (e) {
    console.warn('FFmpeg export failed, falling back to WebM', e)
    return blob
  }
}
