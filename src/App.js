// App.js — React conversion of provided wedding HTML
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

export function getMessageApiUrl() {
  const baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
  return baseUrl ? `${baseUrl}/api/messages` : '/api/messages';
}

function getTimeLeft() {
  const target = new Date('2026-10-18T00:00:00');
  const now = new Date();
  const diff = Math.max(target.getTime() - now.getTime(), 0);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}

export default function App() {
  const envWrapRef = useRef(null);
  const envOverlayRef = useRef(null);
  const heroRef = useRef(null);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    // petals
    const hero = heroRef.current;
    if (hero) {
      for (let i = 0; i < 14; i++) {
        const p = document.createElement('div');
        p.className = 'petal';
        const w = Math.random() * 8 + 5;
        p.style.cssText = `width:${w}px; height:${w * 1.6}px; left:${Math.random() * 100}%; top:-20px; --dur:${Math.random() * 10 + 10}s; --delay:${Math.random() * 12}s; --op:${(Math.random() * 0.12 + 0.04).toFixed(2)}; --drift:${(Math.random() * 60 - 30).toFixed(0)}px; --rot:${Math.floor(Math.random() * 360)}deg;`;
        hero.appendChild(p);
      }
    }

    // stars in overlay
    const overlay = envOverlayRef.current;
    if (overlay) {
      for (let i = 0; i < 28; i++) {
        const s = document.createElement('div');
        s.className = 'env-star';
        const size = Math.random() * 2.5 + 1;
        s.style.cssText = `width:${size}px; height:${size}px; top:${Math.random() * 100}%; left:${Math.random() * 100}%; opacity:${Math.random() * 0.35 + 0.05}; animation: hintPulse ${Math.random() * 4 + 3}s ease-in-out ${Math.random() * 4}s infinite;`;
        overlay.appendChild(s);
        }
    }

    // reveal observer
    const observer = typeof window !== 'undefined' && 'IntersectionObserver' in window
      ? new IntersectionObserver(
          entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
          { threshold: 0.1 }
        )
      : null;

    const activateAllAnimations = () => {
      const animatedEls = document.querySelectorAll(
        '.reveal, .hero-date, .hero-divider, .hero-names, .hero-location, .hero-scroll, .countdown-label, .countdown-item, .countdown-num, .countdown-unit'
      );

      animatedEls.forEach((el, index) => {
        const delay = Number(el.dataset.delay || 0) + index * 0.08;
        el.style.transitionDelay = `${delay}s`;
        el.style.animationDelay = `${delay}s`;
        requestAnimationFrame(() => {
          el.classList.add('visible');
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      });
    };

    activateAllAnimations();
    if (observer) {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    } else {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }

    return () => {
      if (hero) hero.querySelectorAll('.petal').forEach(n => n.remove());
      if (overlay) overlay.querySelectorAll('.env-star').forEach(n => n.remove());
      if (observer) observer.disconnect();
    };
  }, []);

  // Open the envelope overlay: animate then hide overlay
  const openEnvelope = () => {
    const overlay = envOverlayRef.current;
    const wrap = envWrapRef.current;
    if (!overlay || !wrap) return;
    // add classes that CSS may use to animate opening
    overlay.classList.add('env-open');
    // use the 'opening' class which matches the CSS selectors in App.css
    wrap.classList.add('opening');
    // hide the hint text
    const hint = document.getElementById('env-hint');
    if (hint) hint.classList.add('hide');
    // leave the envelope open for 2s so the user can see the sheet,
    // then fade out the overlay and remove it from DOM flow
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        try {
          overlay.style.display = 'none';
        } catch (e) {}
        setOverlayVisible(false);
      }, 900);
    }, 2000);
  };

  useEffect(() => {
    const form = document.getElementById('wedding-form');
    if (!form) return;

    const handle = async e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      if (!btn) return;

      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;

      try {
        const data = {
          prenom: form.elements.prenom?.value || form.prenom?.value || '',
          nom: form.elements.nom?.value || form.nom?.value || '',
          message: form.elements.message?.value || form.message?.value || ''
        };

        const res = await fetch(getMessageApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || 'Network response was not ok');

        form.reset();
        form.style.display = 'none';
        const success = document.getElementById('form-success');
        if (success) success.style.display = 'block';
      } catch (err) {
        console.error('Form submit error', err);
        btn.textContent = 'Erreur réseau — réessayez';
        btn.disabled = false;
      }
    };

    form.addEventListener('submit', handle);
    return () => form.removeEventListener('submit', handle);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {overlayVisible && (
        <div id="env-overlay" ref={envOverlayRef}>
          <div className="env-scene" onClick={openEnvelope}>
            <div id="env-wrap" ref={envWrapRef}>
              <div id="env-letter">
                <span className="env-letter-eyebrow">MY Wedding</span>
                <svg className="env-flower" viewBox="0 0 70 32" fill="none">
                  <path d="M35,16 C26,16 18,11 10,13" stroke="var(--gold)" strokeWidth="0.8" fill="none" opacity="0.55"/>
                  <path d="M22,13 C20,9 24,7 26,10 C25,11 23,12 22,13Z" fill="var(--gold)" opacity="0.45"/>
                </svg>
                <div className="env-letter-sep" />
                <div className="env-letter-names">Saif<br />&amp;<br />Meyssem</div>
                <div className="env-letter-sep" />
                <span className="env-letter-date">18 Octobre 2026 &nbsp;·&nbsp; Podium Gammarth</span>
                <span className="env-letter-subtitle">Saif's &amp; Meyssem's Wedding</span>
              </div>
              <div id="env-body">
                <div className="env-interior" />
                <div className="env-fold-l" />
                <div className="env-fold-r" />
                <div className="env-fold-b" />
              </div>
              <div id="env-flap">
                <div className="env-flap-front" />
                <div className="env-flap-back" />
              </div>
              <div id="env-seal">♥</div>
            </div>
          </div>
          <p id="env-hint"> <span>Cliquez pour ouvrir</span> </p>
        </div>
      )}

      <section className="hero" ref={heroRef}>
        <svg className="hero-ornament top-left" viewBox="0 0 200 200" fill="none">
          <path d="M10,10 Q100,10 100,100 Q100,10 190,10" stroke="var(--gold)" strokeWidth="0.8" fill="none" />
          <path d="M10,30 Q80,30 80,100" stroke="var(--gold)" strokeWidth="0.5" fill="none" />
          <path d="M30,10 Q30,80 100,80" stroke="var(--gold)" strokeWidth="0.5" fill="none" />
        </svg>
        
        <div className="hero-inner">
          <div className="sep-top reveal">
              <span className="line" />
              <svg viewBox="0 0 20 20" className="flower-sep" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(10,10)">
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" />
                  <circle cx="0" cy="0" r="2.2" />
                </g>
              </svg>
              <span className="line" />
            </div>
            
          <p className="hero-date"><b>Le 18 Octobre 2026</b> &nbsp;·&nbsp; <b>ESPACE PODIUM GAMMARTH</b></p>
          <div className="section-sep reveal" style={{margin: '0.6rem auto 0.8rem'}}>
            <span className="line" />
            <svg viewBox="0 0 20 20" className="flower-sep" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(10,10)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" />
                <circle cx="0" cy="0" r="2.2" />
              </g>
            </svg>
            <span className="line" />
          </div>
          <svg viewBox="0 0 300 40" className="branch-sep" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20 Q150 0 290 20" stroke="#ddbaae" strokeWidth="1" fill="none" opacity="0.4" />
              <path d="M40 18 Q45 10 50 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M70 18 Q75 10 80 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M100 18 Q105 10 110 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M190 18 Q195 10 200 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M220 18 Q225 10 230 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M250 18 Q255 10 260 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <g transform="translate(150,20)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" fill="#ddbaae" />
                <circle cx="0" cy="0" r="2.2" fill="#ddbaae" />
              </g>
              <g transform="translate(20,20)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" fill="#ddbaae" />
                <circle cx="0" cy="0" r="2.2" fill="#ddbaae" />
              </g>
              <g transform="translate(280,20)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" fill="#ddbaae" />
                <circle cx="0" cy="0" r="2.2" fill="#ddbaae" />
              </g>
            </svg>
         
          <h1 className="hero-names">
            <em>Saif</em>
            <span className="hero-amp">&amp;</span>
            <em>Meyssem</em>
          </h1>
          <div className="section-sep reveal" style={{margin: '0.6rem auto 0.8rem'}}>
            <span className="line" />
            <svg viewBox="0 0 20 20" className="flower-sep" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(10,10)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" />
                <circle cx="0" cy="0" r="2.2" />
              </g>
            </svg>
            <span className="line" />
          </div>
        </div>
          <p className="hero-location">Vous invitent à célébrer leur union</p>
         
        <a className="hero-scroll" href="#histoire">
          <span><b>Découvrir</b></span>
          <div className="hero-scroll-line" />
        </a>
      </section>

      <div className="countdown-wrap">
        <p className="countdown-label">Le grand jour est dans</p>
        <div className="countdown" id="countdown">
          <div className="countdown-item"><span className="countdown-num" id="cd-days">{timeLeft.days}</span><span className="countdown-unit">Jours</span></div>
          <span className="countdown-sep">·</span>
          <div className="countdown-item"><span className="countdown-num" id="cd-hours">{timeLeft.hours}</span><span className="countdown-unit">Heures</span></div>
          <span className="countdown-sep">·</span>
          <div className="countdown-item"><span className="countdown-num" id="cd-min">{timeLeft.minutes}</span><span className="countdown-unit">Minutes</span></div>
          <span className="countdown-sep">·</span>
          <div className="countdown-item"><span className="countdown-num" id="cd-sec">{timeLeft.seconds}</span><span className="countdown-unit">Secondes</span></div>
        </div>
      </div>

      <main>
        <section className="histoire-section" id="histoire">
          <div className="histoire-inner">
            <p className="section-label reveal"><b>NOTRE HISTOIRE</b></p>
            <h2 className="section-title reveal">Deux âmes, une promesse et un début d’éternité ...</h2>
            
            <div className="sep-top reveal">
              <span className="line" />
              <svg viewBox="0 0 20 20" className="flower-sep" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(10,10)">
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" />
                  <circle cx="0" cy="0" r="2.2" />
                </g>
              </svg>
              <span className="line" />
            </div> <svg viewBox="0 0 300 40" className="branch-sep" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20 Q150 0 290 20" stroke="#ddbaae" strokeWidth="1" fill="none" opacity="0.4" />
              <path d="M40 18 Q45 10 50 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M70 18 Q75 10 80 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M100 18 Q105 10 110 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M190 18 Q195 10 200 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M220 18 Q225 10 230 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <path d="M250 18 Q255 10 260 18" stroke="#ddbaae" strokeWidth="0.8" fill="none" />
              <g transform="translate(150,20)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" fill="#ddbaae" />
                <circle cx="0" cy="0" r="2.2" fill="#ddbaae" />
              </g>
              <g transform="translate(20,20)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" fill="#ddbaae" />
                <circle cx="0" cy="0" r="2.2" fill="#ddbaae" />
              </g>
              <g transform="translate(280,20)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" fill="#ddbaae" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" fill="#ddbaae" />
                <circle cx="0" cy="0" r="2.2" fill="#ddbaae" />
              </g>
            </svg>
            <svg className="botanical-branch reveal" viewBox="0 0 280 50" fill="none" />
            <p className="histoire-text reveal">Notre plus belle histoire est sur le point de commencer ...<br /><br />Le moment tant attendu est enfin venu : celui de nous dire  <strong><span className="green-accent"><b>« oui »</b></span></strong> et d’entamer ensemble notre <strong><span className="green-accent"><b>« forever ∞ »</b></span></strong> <br /><br />Nous serions profondément heureux de vous avoir à nos côtés pour célébrer notre amour et créer  <strong>des souvenirs inoubliables .</strong></p>
            <div className="couple-grid reveal">
              <div className="photo-slot"><img src="/coup1.jpg" alt="Nous" /></div>
              <div className="photo-slot"><img src="/merci.jpg" alt="Nous" /></div>
              <div className="photo-slot"><img src="/coupl3.jpg" alt="Nous" /></div>
            </div>
           
          </div>
        </section>

        <section className="programme-section" id="programme">
          <div className="programme-inner">
            <p className="section-label reveal"></p>
            <h2 className="section-title reveal">Le programme de la soirée</h2>
            <div className="section-sep reveal green" style={{margin: '0.6rem auto 0.8rem'}}>
              <span className="line" />
              <svg viewBox="0 0 20 20" className="flower-sep" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(10,10)">
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" />
                  <circle cx="0" cy="0" r="2.2" />
                </g>
              </svg>
              <span className="line" />
            </div>
            <div className="timeline">
              <div className="timeline-item reveal">
                <div className="timeline-time">19h00<small></small></div>
                <div className="timeline-dot" />
                <div className="timeline-content"><div className="timeline-icon">🌿</div><div className="timeline-event">Accueil des invités</div><div className="timeline-desc"></div></div>
              </div>
              <div className="timeline-item reveal">
                <div className="timeline-time">19h30<small></small></div>
                <div className="timeline-dot" />
                <div className="timeline-content"><div className="timeline-icon">📜</div><div className="timeline-event">Signature du contrat de mariage</div><div className="timeline-desc"></div></div>
              </div>
               <div className="timeline-item reveal">
                <div className="timeline-time">20h00<small>  </small></div>
                <div className="timeline-dot" />
                <div className="timeline-content"><div className="timeline-icon">🎉</div><div className="timeline-event">Let’s party</div><div className="timeline-desc"></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="lieu-section" id="lieu">
          <div className="lieu-inner">
            <p className="section-label reveal">Où nous retrouver</p>
            <h2 className="section-title light reveal">ESPACE PODIUM GAMMARTH</h2>
            <div className="section-sep reveal" style={{margin: '0.6rem auto 0.8rem'}}>
              <span className="line" />
              <svg viewBox="0 0 20 20" className="flower-sep" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(10,10)">
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" />
                  <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" />
                  <circle cx="0" cy="0" r="2.2" />
                </g>
              </svg>
              <span className="line" />
            </div>
            <p className="section-text light reveal"><br /></p>
            <div className="lieu-grid reveal">
              <div className="photo-slot"><img src="mey06.jpg" alt="Lieu" /></div>
              <div className="photo-slot"><img src="meyssem07.jpg" alt="Lieu" /></div>
            </div>
            <a className="map-link" href="https://www.google.com/maps/place/Espace+%22Podium%22/@36.9212155,10.2871359,17z/data=!3m1!4b1!4m6!3m5!1s0x12e2b5c44401cc8f:0xad0cdf2794455fc9!8m2!3d36.9212155!4d10.2897108!16s%2Fg%2F1hf2cpc43?entry=ttu&g_ep=EgoyMDI2MDgyNS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">Voir sur Google Maps</a>
          </div>
        </section>

        <section className="form-section" id="message">
          <p className="section-label reveal"><b></b><b>Laissez-nous un mot</b></p>
          <h2 className="section-title reveal">Vos vœux &amp; messages</h2>
          <div className="section-sep reveal" style={{margin: '0.6rem auto 0.8rem'}}>
            <span className="line" />
            <svg viewBox="0 0 20 20" className="flower-sep" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(10,10)">
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(72)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(144)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(216)" />
                <ellipse cx="0" cy="-5.5" rx="2.2" ry="4.5" transform="rotate(288)" />
                <circle cx="0" cy="0" r="2.2" />
              </g>
            </svg>
            <span className="line" />
          </div>
          <div className="form-wrap reveal">
            <form id="wedding-form" action="/api/messages" method="POST">
              <input type="hidden" name="_subject" value="Nouveau message de mariage 💌" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <div className="form-row">
                <div className="field"><label htmlFor="prenom">Prénom</label><input id="prenom" name="prenom" required /></div>
                <div className="field"><label htmlFor="nom">Nom</label><input id="nom" name="nom" required /></div>
              </div>
              <div className="field"><label htmlFor="message-field">Votre message</label><textarea id="message-field" name="message" required /></div>
              <button type="submit" className="btn-submit">Envoyer mon message ✦</button>
            </form>
            <div id="form-success">Merci infiniment pour votre message — il nous va droit au cœur. 💛</div>
          </div>
        </section>

        <footer>
          <div className="footer-names">Saif &amp; Meyssem</div>
          <div className="footer-date">Le 18 October 2026 &nbsp;·&nbsp; ESPACE PODIUM GAMMARTH</div>
        </footer>
      </main>
    </div>
  );
}