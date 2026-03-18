import React from 'react';
import styles from './MixPlanModal.module.css';

export default function MixPlanModal({ track, onClose }) {
  if (!track) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Mix Plan: {track.title}</h2>
        <p className={styles.artist}>{track.artist}</p>
        <div className={styles.content}>
          <h3>Instructions:</h3>
          <p>{track.mixPlan || 'No specific mix plan available for this track.'}</p>
        </div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
