import React from 'react'
import PropTypes from 'prop-types'
import styles from './BottomBar.module.css'

export default function BottomBar({ onRecord, onExport, recording }) {
  return (
    <div className={styles.bar}>
      <button onClick={onRecord}>{recording ? 'STOP REC' : 'START REC'}</button>
      <button onClick={onExport}>EXPORT</button>
    </div>
  )
}

BottomBar.propTypes = {
  onRecord: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  recording: PropTypes.bool.isRequired,
}
