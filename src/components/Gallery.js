import React from 'react';
import './gallery.css';

const images = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505575967452-9e5b9a8b35d3?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80',
];

export default function Gallery() {
  return (
    <section className="gallery">
      <h2>Galerie</h2>
      <div className="grid">
        {images.map((src, i) => (
          <div className="tile" key={i}>
            <img src={src} alt={`gallery-${i}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
