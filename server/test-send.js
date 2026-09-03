require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
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
    subject: 'Test email from wedding-site',
    text: 'Ceci est un email de test envoyé depuis server/test-send.js'
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

main();
