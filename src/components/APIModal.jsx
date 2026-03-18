import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './APIModal.module.css'

export default function APIModal({ onSave, onClose }) {
  const [key, setKey] = useState('')
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>ENTER API KEY</h3>
        <input type="password" value={key} onChange={e => setKey(e.target.value)} />
        <button onClick={() => onSave(key)}>SAVE</button>
        <button onClick={onClose}>CLOSE</button>
      </div>
    </div>
  )
}

APIModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
