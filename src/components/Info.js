import React from 'react';
import './info.css';

export default function Info() {
  return (
    <section className="info">
      <h2>Informations</h2>
      <div className="infos">
        <div>
          <h3>Lieu</h3>
          <p>Jardin des Roses, Marrakech</p>
        </div>
        <div>
          <h3>Hébergement</h3>
          <p>Voir les hôtels recommandés près du centre-ville.</p>
        </div>
        <div>
          <h3>Dress code</h3>
          <p>Chic décontracté. Couleurs naturelles recommandées.</p>
        </div>
      </div>
    </section>
  );
}
