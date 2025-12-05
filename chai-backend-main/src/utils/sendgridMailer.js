// src/utils/sendgridMailer.js
import sgMail from '@sendgrid/mail';

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM = process.env.EMAIL_FROM || 'no-reply@yourdomain.com';

if (!API_KEY) {
  console.warn('SENDGRID_API_KEY not set - emails will be logged to console (dev-mode).');
} else {
  sgMail.setApiKey(API_KEY);
}

export async function sendEmail({ to, subject, html, text }) {
  if (!API_KEY) {
    // dev fallback — log email (DO NOT use this in production)
    console.log('[MAIL MOCK] to:', to, 'subject:', subject, 'text:', text || html);
    return { mock: true };
  }

  const msg = {
    to,
    from: FROM,
    subject,
    text: text || '',
    html: html || '',
  };

  try {
    const res = await sgMail.send(msg);
    return res;
  } catch (err) {
    // helpful logging for SendGrid API errors
    if (err?.response?.body) {
      console.error('[sendEmail] SendGrid response body:', JSON.stringify(err.response.body, null, 2));
    } else {
      console.error('[sendEmail] Err:', err.message || err);
    }
    throw err;
  }
}
