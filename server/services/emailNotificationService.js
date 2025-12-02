import nodemailer from 'nodemailer';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
  const fullPath = path.resolve(__dirname, '..', serviceAccountPath);
  
  if (fs.existsSync(fullPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
}

const db = getFirestore();

// Create transporter
let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter;
  
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Email service disabled. Missing: ${missingVars.join(', ')}`);
    return null;
  }
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  return transporter;
};


/**
 * Get all registered users' emails from Firestore
 */
const getAllUserEmails = async () => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const emails = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email && userData.emailNotifications !== false) {
        emails.push({
          email: userData.email,
          name: userData.firstName || userData.displayName || 'User',
        });
      }
    });
    
    return emails;
  } catch (error) {
    console.error('Error fetching user emails:', error);
    return [];
  }
};

/**
 * Generate email HTML template
 */
const generateEmailTemplate = (type, title, message, link) => {
  const typeColors = {
    library: { primary: '#3b82f6', secondary: '#1d4ed8', icon: '📚' },
    training: { primary: '#a855f7', secondary: '#7c3aed', icon: '🎓' },
    tutorial: { primary: '#22c55e', secondary: '#16a34a', icon: '📖' },
    system: { primary: '#64748b', secondary: '#475569', icon: '🔔' },
  };
  
  const colors = typeColors[type] || typeColors.system;
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const notificationLink = `${frontendUrl}/notifications`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); padding: 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">${colors.icon}</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New ${typeLabel} Update</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #f1f5f9; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${title}</h2>
              <p style="color: #94a3b8; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">${message}</p>
              
              <!-- Badge -->
              <div style="margin-bottom: 30px;">
                <span style="display: inline-block; background-color: ${colors.primary}20; color: ${colors.primary}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${typeLabel}
                </span>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${notificationLink}" style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px 0 ${colors.primary}40;">
                      View Notification →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1e293b; padding: 24px 30px; border-top: 1px solid #334155;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #64748b; font-size: 12px;">
                    <p style="margin: 0 0 8px 0;">You're receiving this because you're registered on HUMSJ Academic Platform.</p>
                    <p style="margin: 0;">© ${new Date().getFullYear()} Jemea Hub. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Send notification email to a single user
 */
const sendNotificationEmail = async (to, subject, html, text) => {
  const transport = initTransporter();
  if (!transport) {
    throw new Error('Email service not configured');
  }
  
  return transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    text,
  });
};

/**
 * Broadcast notification to all registered users
 */
export const broadcastNotification = async ({ type, title, message, link }) => {
  const transport = initTransporter();
  if (!transport) {
    console.warn('⚠️ Email broadcast skipped - service not configured');
    return { success: false, error: 'Email service not configured', sent: 0 };
  }
  
  try {
    const users = await getAllUserEmails();
    
    if (users.length === 0) {
      console.log('No users to notify');
      return { success: true, sent: 0 };
    }
    
    const html = generateEmailTemplate(type, title, message, link);
    const textContent = `
${title}

${message}

Type: ${type}

View this notification: ${process.env.FRONTEND_URL || 'http://localhost:8080'}/notifications

---
You're receiving this because you're registered on HUMSJ Academic Platform.
    `.trim();
    
    const subject = `🔔 ${title} - HUMSJ Update`;
    
    // Send emails in batches to avoid rate limiting
    const batchSize = 10;
    let sentCount = 0;
    const errors = [];
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const promises = batch.map(async (user) => {
        try {
          await sendNotificationEmail(user.email, subject, html, textContent);
          sentCount++;
          return { success: true, email: user.email };
        } catch (error) {
          console.error(`Failed to send to ${user.email}:`, error.message);
          errors.push({ email: user.email, error: error.message });
          return { success: false, email: user.email, error: error.message };
        }
      });
      
      await Promise.all(promises);
      
      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`📧 Email broadcast complete: ${sentCount}/${users.length} sent`);
    
    return {
      success: true,
      sent: sentCount,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('❌ Broadcast failed:', error);
    return { success: false, error: error.message, sent: 0 };
  }
};

/**
 * Create notification in Firestore and optionally broadcast via email
 */
export const createAndBroadcastNotification = async ({ type, title, message, link, sendEmail = true }) => {
  try {
    // Create notification in Firestore
    const notificationData = {
      type,
      title,
      message,
      link: link || null,
      readBy: [],
      createdAt: new Date(),
    };
    
    const docRef = await db.collection('notifications').add(notificationData);
    console.log(`✅ Notification created: ${docRef.id}`);
    
    // Broadcast via email if enabled
    let emailResult = { sent: 0 };
    if (sendEmail) {
      emailResult = await broadcastNotification({ type, title, message, link });
    }
    
    return {
      success: true,
      notificationId: docRef.id,
      emailsSent: emailResult.sent,
    };
  } catch (error) {
    console.error('❌ Failed to create notification:', error);
    return { success: false, error: error.message };
  }
};

export default {
  broadcastNotification,
  createAndBroadcastNotification,
};
