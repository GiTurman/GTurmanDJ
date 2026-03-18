import { useState } from 'react'
import s from './APIModal.module.css'

export default function APIModal({ current, onSave, onClose }) {
  const [key, setKey] = useState(current || '')
  const [show, setShow] = useState(false)

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.head}>
          <span className={s.headTitle}>GOOGLE AI STUDIO</span>
          <button className={s.close} onClick={onClose}>✕</button>
        </div>
        <div className={s.body}>
          <p className={s.desc}>
            AI track suggestions-ისთვის Google AI Studio-ს API key საჭიროა.
            key <strong>მხოლოდ შენს ბრაუზერში</strong> ინახება.
          </p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className={s.link}>
            ↗ aistudio.google.com — API Key მიღება (უფასო)
          </a>
          <div className={s.inputRow}>
            <input
              type={show ? 'text' : 'password'}
              value={key} onChange={e => setKey(e.target.value)}
              placeholder="AIzaSy..." className={s.input} spellCheck={false}
              onKeyDown={e => e.key === 'Enter' && key.trim() && onSave(key.trim())}
            />
            <button className={s.toggle} onClick={() => setShow(x => !x)}>{show ? 'HIDE' : 'SHOW'}</button>
          </div>
          <div className={s.model}>
            <span className={s.modelDot} />
            Model: <strong>gemini-1.5-flash</strong> — უფასო tier-ზე მუშაობს (15 req/min)
          </div>
        </div>
        <div className={s.foot}>
          <button className={s.cancel} onClick={onClose}>CANCEL</button>
          {current && <button className={s.remove} onClick={() => onSave('')}>REMOVE</button>}
          <button className={s.save} onClick={() => onSave(key.trim())} disabled={!key.trim()}>
            SAVE & CONNECT
          </button>
        </div>
      </div>
    </div>
  )
}
