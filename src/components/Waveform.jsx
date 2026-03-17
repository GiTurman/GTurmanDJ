// components/Waveform.jsx
import { useRef, useEffect, useCallback } from 'react'
import styles from './Waveform.module.css'

export default function Waveform({ waveform, position, playing, color, deckId }) {
  const canvasRef = useRef()
  const animRef = useRef()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const data = waveform || generateDefault()
    const barW = W / data.length

    data.forEach((val, i) => {
      const barH = val * H * 0.85
      const x = i * barW
      const y = (H - barH) / 2

      // Color: played = accent, upcoming = dim
      const played = (i / data.length) < position
      ctx.fillStyle = played ? color : `${color}44`

      ctx.fillRect(x + 0.5, y, Math.max(barW - 1, 1), barH)
    })

    // Playhead
    const px = position * W
    ctx.fillStyle = '#ffffff'
    ctx.globalAlpha = 0.9
    ctx.fillRect(px - 1, 0, 2, H)
    ctx.globalAlpha = 1

    // Beat grid lines (simulated)
    ctx.fillStyle = `${color}22`
    for (let i = 0; i < 16; i++) {
      ctx.fillRect(i * (W / 16), 0, 1, H)
    }
  }, [waveform, position, color])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      canvas.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio)
      draw()
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [draw])

  useEffect(() => { draw() }, [draw])

  return (
    <div className={styles.waveformContainer}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width: '100%', height: '100%' }} />
      {playing && <div className={styles.scanline} style={{ '--scan-color': color }} />}
    </div>
  )
}

function generateDefault(points = 120) {
  return Array.from({ length: points }, () => 0.15 + Math.random() * 0.7)
}
