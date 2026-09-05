require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = Number(process.env.PORT || process.env.PORT_SERVER || 3001);
const db = require('./db');

const cleanEnv = (value) => (typeof value === 'string' ? value.trim() : value);
process.env.SMTP_HOST = cleanEnv(process.env.SMTP_HOST);
process.env.SMTP_PORT = cleanEnv(process.env.SMTP_PORT);
process.env.SMTP_USER = cleanEnv(process.env.SMTP_USER);
process.env.SMTP_PASS = cleanEnv(process.env.SMTP_PASS);
process.env.ADMIN_EMAIL = cleanEnv(process.env.ADMIN_EMAIL);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

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

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const mailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    res.status(201).json({ success: true, id: row.id, message: row.message });

    if (adminEmail && mailConfigured) {
      transporter.sendMail({
        from: `"Site Mariage" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `Nouveau message de ${row.prenom || 'Anonyme'} ${row.nom || ''}`,
        text: `${row.message}\n\nDe: ${row.prenom || ''} ${row.nom || ''}`,
        html: `
          <p>${row.message}</p>
          <p><small>De: ${row.prenom || ''} ${row.nom || ''}</small></p>
        `
      }).then(() => {
        console.log(`Message email sent to ${adminEmail}`);
      }).catch(mailErr => {
        console.error('Mail error:', mailErr.message);
      });
    } else {
      console.log('SMTP non configuré: message enregistré localement uniquement.');
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
  try {
    await db.init();
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await transporter.verify();
      console.log(`SMTP ready for ${process.env.SMTP_USER}`);
    } catch (err) {
      console.error('SMTP configuration failed:', err.message);
    }
  } else {
    console.warn('SMTP not configured: messages will be stored without email notification.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();