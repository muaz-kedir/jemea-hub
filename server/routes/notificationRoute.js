import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

let transporter = null;

if (missingVars.length === 0) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify().catch((error) => {
    console.error('❌ SMTP configuration validation failed:', error.message);
  });
} else {
  console.warn(
    `⚠️  SMTP configuration incomplete. Missing: ${missingVars.join(', ')}. Email notifications will be disabled.`
  );
}

router.post('/notify/registration', async (req, res) => {
  if (!transporter) {
    return res.status(500).json({
      success: false,
      error: 'Email service is not configured on the server.',
    });
  }

  const {
    recipientEmail,
    participantName,
    programTitle,
    programType,
    deliveryMode,
    meetingLink,
    location,
    schedule,
  } = req.body || {};

  if (!recipientEmail || !programType) {
    return res.status(400).json({
      success: false,
      error: 'recipientEmail and programType are required.',
    });
  }

  const typeLabel = programType === 'training' ? 'training' : 'tutorial';
  const displayName = participantName?.trim() || 'Participant';
  const subject = `Invitation: ${programTitle || `Your upcoming ${typeLabel}`}`;
  const isOnline = deliveryMode === 'online';
  const accessDetail = isOnline ? meetingLink : location;

  if (!accessDetail) {
    return res.status(400).json({
      success: false,
      error: 'A meeting link or location is required to notify participants.',
    });
  }

  const lines = [
    `Hi ${displayName},`,
    '',
    `Congratulations, you are invited to this impressive ${typeLabel}!`,
    '',
    programTitle ? `Session: ${programTitle}` : '',
    schedule ? `Schedule: ${schedule}` : '',
    isOnline ? `Meeting Link: ${accessDetail}` : `Location: ${accessDetail}`,
    '',
    'We look forward to your participation.',
    '',
    'Best regards,',
    'Jemea Hub Team',
  ].filter(Boolean);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipientEmail,
      subject,
      text: lines.join('\n'),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Failed to send registration email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send confirmation email.',
    });
  }
});

export default router;
