// components/APIKeyModal.jsx
import { useState } from 'react'
import styles from './APIKeyModal.module.css'

export default function APIKeyModal({ currentKey, onSave, onClose }) {
  const [key, setKey] = useState(currentKey || '')
  const [show, setShow] = useState(false)

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>GOOGLE AI STUDIO</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <p className={styles.desc}>
            AI-powered track suggestions-ისთვის Google AI Studio API key საჭიროა.
            ის <strong>მხოლოდ შენს ბრაუზერში</strong> ინახება — სერვერზე არ იგზავნება.
          </p>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            ↗ API Key-ის მოსაღებად — aistudio.google.com
          </a>

          <div className={styles.inputRow}>
            <input
              type={show ? 'text' : 'password'}
              className={styles.keyInput}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="AIzaSy..."
              spellCheck={false}
            />
            <button
              className={styles.toggleBtn}
              onClick={() => setShow(s => !s)}
              type="button"
            >
              {show ? 'HIDE' : 'SHOW'}
            </button>
          </div>

          <div className={styles.modelInfo}>
            <span className={styles.modelDot} />
            Model: <strong>gemini-1.5-flash</strong> — სწრაფი და უფასო tier-ზე მუშაობს
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>CANCEL</button>
          {currentKey && (
            <button
              className={styles.removeBtn}
              onClick={() => { onSave('') }}
            >
              REMOVE KEY
            </button>
          )}
          <button
            className={styles.saveBtn}
            onClick={() => onSave(key.trim())}
            disabled={!key.trim()}
          >
            SAVE & CONNECT
          </button>
        </div>
      </div>
    </div>
  )
}
