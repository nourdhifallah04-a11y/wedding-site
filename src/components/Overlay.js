// Overlay.js
import React from 'react';
import './Overlay.css';

function Overlay({ onClose }) {
  return (
    <div className="overlay">
      <div className="envelope-card">
        {/* Rabat triangulaire */}
        <div className="envelope-flap"></div>
        
        {/* Corps de l'enveloppe */}
        <div className="envelope-body">
          <h1 className="envelope-title">Saif</h1>
          <h1 className="envelope-title center">&amp;</h1>
          <h1 className="envelope-title">Meyssem</h1>
          
          <p className="envelope-subtitle">
            VOUS INVITENT À CÉLÉBRER LEUR UNION
          </p>
          
          <button className="open-btn" onClick={onClose}>
            CLIQUEZ POUR OUVRIR
          </button>
        </div>
      </div>
    </div>
  );
}

export default Overlay;