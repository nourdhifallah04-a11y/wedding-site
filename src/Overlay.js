import React from 'react';
import './Overlay.css';
import Hero from './components/Hero';

export default function Overlay({ onClose }) {
  return (
    <div className="overlay-root" role="dialog" aria-modal="true">
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="overlay-panel">
        <button className="overlay-close" onClick={onClose} aria-label="Fermer">✕</button>
        <Hero />
      </div>
    </div>
  );
}
