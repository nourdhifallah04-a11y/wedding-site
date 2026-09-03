import React, { useState } from 'react';
import './hero.css';

export default function Hero() {
  const [opened, setOpened] = useState(false);

  return (
    <header className={`hero ${opened ? 'opened' : ''}`}>
      <div className="overlay"></div>
      <div className="envelope-wrap">
        {!opened && (
          <button className="envelope" onClick={() => setOpened(true)} aria-label="Ouvrir l'invitation">
            <span className="seal">❤</span>
          </button>
        )}
      </div>

      <div className="hero-inner container">
        <p className="meta">LE 18ER Octobre 2026 · UTIQUE, TUNIS</p>

        <div className="hero-divider">
          <span className="hero-divider-line"></span>
          <svg className="hero-divider-star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0
                     C12.6 6.5 13.5 9 20 9
                     C13.5 9 12.6 11.5 12 18
                     C11.4 11.5 10.5 9 4 9
                     C10.5 9 11.4 6.5 12 0 Z" />
          </svg>
          <span className="hero-divider-line"></span>
        </div>

        <h1 className="couple">Saif<span className="and">&</span> Meyssem</h1>
        <p className="sub">VOUS INVITENT À CÉLÉBRER LEUR UNION</p>
        <button className="discover" onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}>DÉCOUVRIR</button>
      </div>
    </header>
  );
}