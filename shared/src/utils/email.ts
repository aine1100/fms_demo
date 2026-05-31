import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Nodemailer
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Sent to ${options.to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${options.to}:`, error);
    return false;
  }
};

/**
 * Send expiry notification email
 */
export const sendExpiryNotification = async (
  to: string,
  customerName: string,
  serialNumber: string,
  expiryDate: string,
  daysUntilExpiry: number
): Promise<boolean> => {
  const subject = `⚠️ Fire Extinguisher ${serialNumber} - Expiring in ${daysUntilExpiry} days`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🔥 Fire Safety Alert</h1>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your fire extinguisher <strong>${serialNumber}</strong> will expire on <strong>${expiryDate}</strong>.</p>
        <p>That's only <strong style="color: #ff6b35;">${daysUntilExpiry} days</strong> from now.</p>
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>⚡ Action Required:</strong> Please contact your fire extinguisher provider to schedule a replacement or maintenance.</p>
        </div>
        <p>Stay safe!</p>
        <p style="color: #666; font-size: 12px;">— Fire Management System</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};

/**
 * Send payment reminder email
 */
export const sendPaymentReminder = async (
  to: string,
  customerName: string,
  invoiceId: string,
  amount: number,
  dueDate: string
): Promise<boolean> => {
  const subject = `💳 Payment Reminder - Invoice #${invoiceId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">💳 Payment Reminder</h1>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>You have a pending payment:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Invoice:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">#${invoiceId}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">$${amount.toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${dueDate}</td></tr>
        </table>
        <p>Please log in to your account to complete the payment.</p>
        <p style="color: #666; font-size: 12px;">— Fire Management System</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};
