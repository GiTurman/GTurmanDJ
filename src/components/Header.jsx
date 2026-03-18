import React from 'react'
import PropTypes from 'prop-types'
import styles from './Header.module.css'

export default function Header({ bpm, volume, aiStatus }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>AI DJ MIXER</div>
      <div className={styles.stats}>
        <div className={styles.stat}>BPM: <span>{bpm.toFixed(1)}</span></div>
        <div className={styles.stat}>VOL: <span>{volume}%</span></div>
        <div className={styles.aiStatus}>AI: {aiStatus ? '●' : '○'}</div>
      </div>
    </header>
  )
}

Header.propTypes = {
  bpm: PropTypes.number.isRequired,
  volume: PropTypes.number.isRequired,
  aiStatus: PropTypes.bool.isRequired,
}
