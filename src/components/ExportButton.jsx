// components/ExportButton.jsx
import { useState } from 'react'
import { exportMixAsMp3, loadFFmpeg } from '../lib/mp3Export.js'
import styles from './ExportButton.module.css'

export default function ExportButton({ getRecordingBlob, disabled }) {
  const [state, setState] = useState('idle') // idle | loading_ffmpeg | converting | done | error
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const handleExport = async () => {
    if (state !== 'idle' && state !== 'done' && state !== 'error') return

    const blob = getRecordingBlob?.()
    if (!blob || blob.size === 0) {
      setErrorMsg('No recording — press RECORD first')
      setState('error')
      setTimeout(() => setState('idle'), 3000)
      return
    }

    try {
      setState('loading_ffmpeg')
      setProgress(0)

      const result = await exportMixAsMp3(blob, (p) => {
        setState('converting')
        setProgress(p)
      })

      setState('done')
      setTimeout(() => {
        setState('idle')
        setProgress(0)
      }, 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Export failed')
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  const label = {
    idle: '↓ MP3',
    loading_ffmpeg: '⏳ LOADING...',
    converting: `⚙ ${progress}%`,
    done: '✓ SAVED',
    error: '✕ ERROR',
  }[state]

  const isActive = state !== 'idle' && state !== 'done' && state !== 'error'

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.btn} ${styles[state]}`}
        onClick={handleExport}
        disabled={disabled || isActive}
        title={state === 'error' ? errorMsg : 'Export mix as MP3'}
      >
        {label}
      </button>
      {state === 'converting' && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}
