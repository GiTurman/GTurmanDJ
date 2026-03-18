import React from 'react'
import PropTypes from 'prop-types'
import styles from './Mixer.module.css'

export default function Mixer({ onCrossfader, onMasterVolume }) {
  return (
    <div className={styles.mixer}>
      <input type="range" min="0" max="100" onChange={e => onCrossfader(e.target.value)} />
      <input type="range" min="0" max="100" onChange={e => onMasterVolume(e.target.value)} />
    </div>
  )
}

Mixer.propTypes = {
  onCrossfader: PropTypes.func.isRequired,
  onMasterVolume: PropTypes.func.isRequired,
}
