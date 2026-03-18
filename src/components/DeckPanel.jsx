import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './DeckPanel.module.css'

export default function DeckPanel({ id, track, onFileLoad, onPlay, onStop, onCue, onVolume, onEQ, position }) {
  const fileInput = useRef(null)
  return (
    <div className={styles.deck}>
      <div className={styles.trackInfo}>{track ? `${track.title} - ${track.artist}` : 'No Track'}</div>
      <div className={styles.waveform} onClick={() => onCue()}>
        <div className={styles.progress} style={{ width: `${position * 100}%` }} />
      </div>
      <div className={styles.controls}>
        <button onClick={() => fileInput.current.click()}>LOAD</button>
        <button onClick={onPlay}>PLAY</button>
        <button onClick={onStop}>STOP</button>
        <button onClick={onCue}>CUE</button>
      </div>
      <input type="file" ref={fileInput} onChange={e => onFileLoad(e.target.files[0])} style={{display:'none'}} />
      <div className={styles.sliders}>
        <input type="range" className={id} min="0" max="100" onChange={e => onVolume(e.target.value)} />
        <input type="range" className={id} min="-12" max="12" step="0.5" onChange={e => onEQ('high', e.target.value)} />
        <input type="range" className={id} min="-12" max="12" step="0.5" onChange={e => onEQ('mid', e.target.value)} />
        <input type="range" className={id} min="-12" max="12" step="0.5" onChange={e => onEQ('low', e.target.value)} />
      </div>
    </div>
  )
}

DeckPanel.propTypes = {
  id: PropTypes.string.isRequired,
  track: PropTypes.shape({
    title: PropTypes.string,
    artist: PropTypes.string,
  }),
  onFileLoad: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onCue: PropTypes.func.isRequired,
  onVolume: PropTypes.func.isRequired,
  onEQ: PropTypes.func.isRequired,
  position: PropTypes.number.isRequired,
}
