require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Resend } = require('resend');
const bodyParser = require('body-parser');

const app = express();
const PORT = Number(process.env.PORT || process.env.PORT_SERVER || 3001);
const db = require('./db');

const cleanEnv = (value) => (typeof value === 'string' ? value.trim() : value);
process.env.RESEND_API_KEY = cleanEnv(process.env.RESEND_API_KEY);
process.env.RESEND_FROM = cleanEnv(process.env.RESEND_FROM);
process.env.ADMIN_EMAIL = cleanEnv(process.env.ADMIN_EMAIL);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1mb' }));

app.get('/healthz', (req, res) => {
  res.json({ ok: true, mongodb: db.isConnected() });
});

app.post('/api/messages', (req, res) => {
  const { prenom, nom, message } = req.body || {};
  const cleanPrenom = String(prenom || '').trim();
  const cleanNom = String(nom || '').trim();
  const cleanMessage = String(message || '').trim();

  if (!cleanMessage) {
    return res.status(400).json({ error: 'Le message est obligatoire' });
  }

  db.addMessage({
    prenom: cleanPrenom,
    nom: cleanNom,
    message: cleanMessage
  }, async (err, row) => {
    if (err) {
      console.error('DB write error:', err);
      return res.status(500).json({ error: 'Échec de l\'enregistrement du message' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const mailConfigured = Boolean(resend && process.env.RESEND_FROM && adminEmail);

    res.status(201).json({ success: true, id: row.id, message: row.message });

    if (adminEmail && mailConfigured) {
      resend.emails.send({
        from: process.env.RESEND_FROM,
        to: adminEmail,
        subject: `Nouveau message de ${row.prenom || 'Anonyme'} ${row.nom || ''}`,
        text: `${row.message}\n\nDe: ${row.prenom || ''} ${row.nom || ''}`,
        html: `
          <p>${row.message}</p>
          <p><small>De: ${row.prenom || ''} ${row.nom || ''}</small></p>
        `
      }).then(({ data, error }) => {
        if (error) {
          console.error('Mail error:', error);
          return;
        }
        console.log(`Message email sent to ${adminEmail} (${data?.id || 'accepted'})`);
      }).catch(mailErr => {
        console.error('Mail error:', mailErr.message);
      });
    } else {
      console.warn('Resend non configuré: message enregistré sans notification email.');
    }
  });
});

app.get('/api/messages', (req, res) => {
  db.getMessages((err, rows) => {
    if (err) {
      console.error('DB read error:', err);
      return res.status(500).json({ error: 'failed to read messages' });
    }
    res.json(rows);
  });
});

const buildPath = path.join(__dirname, '..', 'build');

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

async function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  try {
    await db.init();
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }

  if (resend && process.env.RESEND_FROM && process.env.ADMIN_EMAIL) {
    console.log(`Resend ready from ${process.env.RESEND_FROM}`);
  } else {
    console.warn('Resend not configured: messages will be stored without email notification.');
  }
}

startServer();