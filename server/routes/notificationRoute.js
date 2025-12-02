import express from 'express';
import nodemailer from 'nodemailer';
import { createAndBroadcastNotification, broadcastNotification } from '../services/emailNotificationService.js';

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

/**
 * POST /api/notify/broadcast
 * Broadcast a notification to all registered users via email
 * Body: { type, title, message, link?, sendEmail? }
 */
router.post('/notify/broadcast', async (req, res) => {
  const { type, title, message, link, sendEmail = true } = req.body || {};

  if (!type || !title || !message) {
    return res.status(400).json({
      success: false,
      error: 'type, title, and message are required.',
    });
  }

  const validTypes = ['library', 'training', 'tutorial', 'system'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
    });
  }

  try {
    const result = await createAndBroadcastNotification({
      type,
      title,
      message,
      link,
      sendEmail,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        notificationId: result.notificationId,
        emailsSent: result.emailsSent,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast notification.',
    });
  }
});

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
