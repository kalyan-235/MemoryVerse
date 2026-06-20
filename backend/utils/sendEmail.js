const nodemailer = require('nodemailer');

// Create reusable transporter using Nodemailer + Gmail SMTP
const createEmailTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Send an email using Nodemailer.
 * @param {object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createEmailTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

/** OTP email template for registration / reset */
const buildOtpEmailHtml = (userName, otp, purpose) => `
  <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #fdf6ec; border-radius: 16px; padding: 40px;">
    <h1 style="color: #3d2c1e; font-size: 26px; margin-bottom: 8px;">📖 MemoryVerse</h1>
    <p style="color: #9b8ec4; margin-bottom: 24px;">Treasure Your Memories, Every Day.</p>
    <h2 style="color: #3d2c1e; font-size: 20px;">Hi ${userName || 'there'} 👋</h2>
    <p style="color: #7a5c44; font-size: 15px; line-height: 1.6; margin-top: 12px;">
      ${purpose === 'reset'
        ? 'You requested a password reset for your MemoryVerse account.'
        : 'Thank you for joining MemoryVerse! Please verify your email address.'}
    </p>
    <div style="background: #fff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #e8d5c0;">
      <p style="color: #9b8ec4; font-size: 13px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
      <h2 style="color: #3d2c1e; font-size: 36px; font-weight: 700; letter-spacing: 12px; margin: 0;">${otp}</h2>
      <p style="color: #c8a882; font-size: 12px; margin-top: 10px;">Expires in 10 minutes</p>
    </div>
    <p style="color: #9b8ec4; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

module.exports = { sendEmail, buildOtpEmailHtml };
