import React, { useState } from 'react';
import './rsvp.css';

export default function RSVP() {
  const [form, setForm] = useState({ name: '', email: '', guests: 1, attending: 'yes' });
  const [sent, setSent] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) return alert('Veuillez renseigner le nom et l\'email.');
    setSent(true);
  }

  return (
    <section className="rsvp">
      <h2>RSVP</h2>
      {sent ? (
        <div className="sent">Merci ! Votre réponse a été enregistrée.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Nom complet
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Nombre d'invités
            <input name="guests" type="number" min="1" value={form.guests} onChange={handleChange} />
          </label>
          <label className="attending">
            Présence
            <select name="attending" value={form.attending} onChange={handleChange}>
              <option value="yes">J'assisterai</option>
              <option value="no">Je ne pourrai pas</option>
            </select>
          </label>
          <button type="submit" className="btn">Envoyer</button>
        </form>
      )}
    </section>
  );
}
