// components/Deck.jsx
import { useRef } from 'react'
import Waveform from './Waveform.jsx'
import styles from './Deck.module.css'

const HOT_CUE_POSITIONS = [0.1, 0.3, 0.55, 0.75]

export default function Deck({ deck, deckId, onPlay, onCue, onSync, onLoop, onVolume, onEQ, onFileLoad }) {
  const isA = deckId === 'a'
  const fileInputRef = useRef()
  const color = isA ? 'var(--accent-a)' : 'var(--accent-b)'

  const handleFileDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0]
    if (file && file.type.startsWith('audio/')) onFileLoad(file)
  }

  return (
    <div className={`${styles.deck} ${isA ? styles.deckA : styles.deckB}`}>
      <div className={styles.deckLabel} style={{ color }}>DECK {deckId.toUpperCase()}</div>

      {/* Track Card */}
      <div
        className={styles.trackCard}
        style={{ '--deck-color': color }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        title="Click or drag audio file to load"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={handleFileDrop}
        />
        <div className={styles.trackTitle}>{deck.title}</div>
        <div className={styles.trackArtist}>{deck.artist}</div>
        <div className={styles.trackMeta}>
          <span className={`${styles.tag} ${styles.genreTag}`} style={{ color, borderColor: `${color}44` }}>
            {deck.genre}
          </span>
          <span className={styles.tag}>{deck.bpm} BPM</span>
          <span className={styles.tag}>{deck.key}</span>
          {deck.camelot && <span className={styles.tag} style={{ color: 'var(--yellow)', borderColor: 'rgba(255,234,0,0.3)' }}>{deck.camelot}</span>}
        </div>
        {deck.energy && (
          <div className={styles.energyBar}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={styles.energyDot} style={{ background: i < deck.energy ? color : 'var(--border-md)' }} />
            ))}
          </div>
        )}
        {!deck.hasFile && (
          <div className={styles.dropHint}>DROP AUDIO FILE OR CLICK TO LOAD</div>
        )}
      </div>

      {/* Waveform */}
      <Waveform
        waveform={deck.waveform}
        position={deck.position}
        playing={deck.playing}
        color={color}
        deckId={deckId}
      />

      {/* Transport Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.playBtn} ${deck.playing ? styles.playingBtn : ''}`}
          style={deck.playing ? { background: color, borderColor: color, color: '#000' } : { borderColor: color, color }}
          onClick={onPlay}
        >
          {deck.playing ? '⏸' : '▶'} {deck.playing ? 'PAUSE' : 'PLAY'}
        </button>
        <button className={styles.btn} onClick={onCue}>CUE</button>
        <button
          className={`${styles.btn} ${deck.synced ? styles.activeBtn : ''}`}
          style={deck.synced ? { borderColor: color, color, background: `${color}18` } : {}}
          onClick={onSync}
        >
          SYNC
        </button>
        <button
          className={`${styles.btn} ${deck.looping ? styles.activeBtn : ''}`}
          style={deck.looping ? { borderColor: color, color, background: `${color}18` } : {}}
          onClick={onLoop}
        >
          LOOP
        </button>
      </div>

      {/* Hot Cues */}
      <div className={styles.hotCues}>
        {[1, 2, 3, 4].map(n => (
          <button key={n} className={styles.hotCueBtn} style={{ '--hc-color': color }}>
            HCU {n}
          </button>
        ))}
      </div>

      {/* EQ */}
      <div className={styles.eqSection}>
        {['HIGH', 'MID', 'LOW'].map(band => (
          <div key={band} className={styles.knobGroup}>
            <span className={styles.knobLabel}>{band}</span>
            <input
              type="range" min="-12" max="12" value={deck.eq?.[band.toLowerCase()] ?? 0}
              className={isA ? 'deck-a' : 'deck-b'}
              onChange={e => onEQ(band.toLowerCase(), e.target.value)}
            />
            <span className={styles.knobVal} style={{ color }}>
              {(deck.eq?.[band.toLowerCase()] ?? 0) > 0 ? '+' : ''}{deck.eq?.[band.toLowerCase()] ?? 0}
            </span>
          </div>
        ))}
        <div className={styles.knobGroup}>
          <span className={styles.knobLabel}>GAIN</span>
          <input
            type="range" min="0" max="150" value={deck.gain}
            className={isA ? 'deck-a' : 'deck-b'}
            onChange={e => {}}
          />
          <span className={styles.knobVal}>{deck.gain}%</span>
        </div>
      </div>

      {/* Position/Duration */}
      {deck.duration > 0 && (
        <div className={styles.posInfo}>
          <span>{formatTime(deck.position * deck.duration)}</span>
          <span style={{ color: 'var(--text-muted)' }}>/ {formatTime(deck.duration)}</span>
        </div>
      )}
    </div>
  )
}

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
