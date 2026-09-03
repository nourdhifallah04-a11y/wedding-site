require('dotenv').config();
const fs = require('fs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify SMTP configuration at startup to catch auth/connect errors early
transporter.verify()
  .then(() => console.log('SMTP transporter verified — ready to send emails'))
  .catch(err => console.error('SMTP transporter verification failed:', err));

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { init, addMessage, getMessages } = require('./db');

const app = express();
// Prefer a dedicated server port to avoid conflicting with Create React App's `PORT`
const PORT = process.env.PORT_SERVER || process.env.PORT || 3002;

init();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve admin page
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// API: receive message submissions
app.post('/api/messages', (req, res) => {
  const { prenom, nom, message } = req.body;
  console.log('Received /api/messages POST:', { prenom, nom, message: message ? message.slice(0,100) : message });
  if (!message) return res.status(400).json({ error: 'message required' });
  addMessage({ prenom, nom, message }, (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });

    // prepare email notification to admin (if configured)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const mailOptions = {
        from: `"Site Mariage" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `Nouveau message de ${prenom || 'Anonyme'} ${nom || ''}`,
        text: `${message}\n\nDe: ${prenom || ''} ${nom || ''}`,
        html: `<p>${message}</p><p><small>De: ${prenom || ''} ${nom || ''}</small></p>`
      };
        (async () => {
          try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Mail sent:', info.messageId);
            return res.json({ success: true, id: row.id });
          } catch (e) {
            console.error('Mail error:', e);
            return res.status(500).json({ error: 'mail error' });
          }
        })();
        return; // response will be sent from the async sender above
    } else {
      console.log('ADMIN_EMAIL not set — skipping email');
    }
      res.json({ success: true, id: row.id });
  });
});


// API: list messages (JSON)
app.get('/api/messages', (req, res) => {
  getMessages((err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// Serve React static build when available (production/full‑stack deploy)
const buildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
