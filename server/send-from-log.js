require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendFromLog(prenom, nom, message) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('SMTP verified');
  } catch (e) {
    console.error('SMTP verify failed:', e);
    process.exit(1);
  }

  const mailOptions = {
    from: `Site Mariage <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `Nouveau message de ${prenom || 'Anonyme'} ${nom || ''}`,
    text: `${message}\n\nDe: ${prenom || ''} ${nom || ''}`,
    html: `<p>${(message||'').replace(/\n/g,'<br>')}</p><p><small>De: ${prenom||''} ${nom||''}</small></p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Mail sent:', info.messageId);
    process.exit(0);
  } catch (e) {
    console.error('Mail send failed:', e);
    process.exit(1);
  }
}

// If run directly, use sample values or CLI args
if (require.main === module) {
  const args = process.argv.slice(2);
  const prenom = args[0] || 'nour';
  const nom = args[1] || 'dhifallah';
  const message = args.slice(2).join(' ') || 'hhdhhdebdhedh';
  sendFromLog(prenom, nom, message);
}
