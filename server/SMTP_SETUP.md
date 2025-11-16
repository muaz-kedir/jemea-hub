# SMTP Email Configuration

The server requires SMTP credentials to send registration confirmation emails.

## Required Environment Variables

Add these to your `server/.env` file:

```env
# SMTP Configuration for Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Jemea Hub <no-reply@yourdomain.com>"
```

## Provider-Specific Setup

### Gmail
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password as `SMTP_PASS`
4. Set `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`

### Outlook/Hotmail
- `SMTP_HOST=smtp-mail.outlook.com`
- `SMTP_PORT=587`
- Use your full email and password

### Custom SMTP Server
- Contact your email provider for SMTP settings
- Typically port 587 (TLS) or 465 (SSL)
- Set `SMTP_SECURE=true` if using port 465

## Testing

After configuring, restart the server and test with:

```bash
curl -X POST http://localhost:5000/api/notify/registration `
  -H "Content-Type: application/json" `
  -d '{"recipientEmail":"test@example.com","participantName":"Test","programTitle":"Sample","programType":"tutorial","deliveryMode":"online","meetingLink":"https://meet.test.com"}'
```

Check the server console for errors and verify the email arrives.
