import { useRef, useEffect, useCallback } from 'react'
import s from './DeckPanel.module.css'

export default function DeckPanel({ deck, deckId, onPlay, onCue, onSync, onLoop, onVolume, onEQ, onFile }) {
  const isA = deckId === 'a'
  const color = isA ? 'var(--accent-a)' : 'var(--accent-b)'
  const cls = isA ? 'a' : 'b'
  const fileRef = useRef()
  const canvasRef = useRef()

  const drawWave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.offsetWidth * devicePixelRatio
    const H = canvas.offsetHeight * devicePixelRatio
    canvas.width = W; canvas.height = H
    ctx.clearRect(0, 0, W, H)
    const data = deck.waveform || []
    if (!data.length) return
    const bw = W / data.length
    const pos = deck.position
    data.forEach((v, i) => {
      const h = v * H * 0.82
      const x = i * bw
      const played = i / data.length < pos
      ctx.fillStyle = played ? (isA ? '#d050ff' : '#00d4ff') : (played ? '#888' : 'rgba(255,255,255,0.15)')
      ctx.fillRect(x + 0.5, (H - h) / 2, Math.max(bw - 1, 1), h)
    })
    // playhead
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.9
    ctx.fillRect(pos * W - 1, 0, 2, H)
    ctx.globalAlpha = 1
    // beat grid
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    for (let i = 0; i < 16; i++) ctx.fillRect(i * (W / 16), 0, 1, H)
  }, [deck.waveform, deck.position, isA])

  useEffect(() => { drawWave() }, [drawWave])

  const handleDrop = e => {
    e.preventDefault()
    const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0]
    if (f?.type.startsWith('audio/')) onFile(f)
  }

  const eq = deck.eq || { high: 0, mid: 0, low: 0 }

  return (
    <div className={`${s.deck} ${isA ? s.a : s.b}`}>
      <div className={s.label} style={{ color }}>DECK {deckId.toUpperCase()}</div>

      {/* Track card */}
      <div className={s.track} style={{ '--c': color }}
        onDragOver={e => e.preventDefault()} onDrop={handleDrop}
        onClick={() => fileRef.current?.click()} title="Click or drag audio file">
        <input ref={fileRef} type="file" accept="audio/*" hidden onChange={handleDrop} />
        <div className={s.title}>{deck.title}</div>
        <div className={s.artist}>{deck.artist}</div>
        <div className={s.tags}>
          <span className={s.tag} style={{ color, borderColor: `${color}55` }}>{deck.genre}</span>
          <span className={s.tag}>{deck.bpm} BPM</span>
          <span className={s.tag}>{deck.key}</span>
          {deck.camelot && <span className={s.tag} style={{ color: 'var(--yellow)', borderColor: 'rgba(255,214,0,0.3)' }}>{deck.camelot}</span>}
        </div>
        {deck.energy > 0 && (
          <div className={s.energy}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={s.eDot} style={{ background: i < deck.energy ? color : 'var(--border-md)' }} />
            ))}
          </div>
        )}
        {!deck.hasFile && <div className={s.hint}>DRAG OR CLICK TO LOAD AUDIO</div>}
      </div>

      {/* Waveform */}
      <div className={s.wave}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        {deck.playing && <div className={s.scan} style={{ '--c': color }} />}
      </div>

      {/* Position */}
      {deck.duration > 0 && (
        <div className={s.pos}>
          <span>{fmt(deck.position * deck.duration)}</span>
          <span className={s.posTotal}>/ {fmt(deck.duration)}</span>
        </div>
      )}

      {/* Transport */}
      <div className={s.transport}>
        <button className={s.play}
          style={deck.playing ? { background: color, borderColor: color, color: '#000' } : { borderColor: color, color }}
          onClick={onPlay}>
          {deck.playing ? '⏸ PAUSE' : '▶ PLAY'}
        </button>
        <button className={s.btn} onClick={onCue}>CUE</button>
        <button className={`${s.btn} ${deck.synced ? s.active : ''}`}
          style={deck.synced ? { borderColor: color, color, background: `${color}18` } : {}}
          onClick={onSync}>SYNC</button>
        <button className={`${s.btn} ${deck.looping ? s.active : ''}`}
          style={deck.looping ? { borderColor: color, color, background: `${color}18` } : {}}
          onClick={onLoop}>LOOP</button>
      </div>

      {/* Hot cues */}
      <div className={s.hcues}>
        {[1,2,3,4].map(n => (
          <button key={n} className={s.hcue} style={{ '--c': color }}>HCU {n}</button>
        ))}
      </div>

      {/* Volume */}
      <div className={s.volRow}>
        <span className={s.vlbl}>VOL</span>
        <input type="range" min="0" max="100" value={deck.volume} className={cls}
          onChange={e => onVolume(+e.target.value)} />
        <span className={s.vval}>{deck.volume}%</span>
      </div>

      {/* EQ */}
      <div className={s.eq}>
        {['HIGH','MID','LOW'].map(band => {
          const val = eq[band.toLowerCase()] ?? 0
          return (
            <div key={band} className={s.knob}>
              <span className={s.klbl}>{band}</span>
              <input type="range" min="-12" max="12" value={val} className={cls}
                onChange={e => onEQ(band.toLowerCase(), e.target.value)} />
              <span className={s.kval} style={{ color }}>{val > 0 ? '+' : ''}{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function fmt(s) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`
}
