import nodemailer from 'nodemailer'
import logger from '../../utils/logger'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface ResetPasswordEmailData {
  to: string
  resetToken: string
  userFirstName?: string
}

export interface OperatorNotificationEmailData {
  to: string
  customerName: string
  chatSummary: string
  chatId?: string
  workspaceName?: string
  subject?: string
  fromEmail?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.setupTransporter()
  }

  private setupTransporter() {
    // SMTP configuration - REQUIRES real credentials
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    // Validate SMTP credentials
    if (!config.auth.user || !config.auth.pass) {
      logger.error('SMTP credentials not configured! Please set SMTP_USER and SMTP_PASS in .env file')
      throw new Error('SMTP credentials required for email service')
    }

    this.transporter = nodemailer.createTransport(config)
    logger.info(`Email service initialized with SMTP: ${config.host}:${config.port}`)
  }

  async sendPasswordResetEmail(data: ResetPasswordEmailData): Promise<boolean> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${data.resetToken}`
      
      const htmlContent = this.generateResetEmailHTML({
        resetUrl,
        userFirstName: data.userFirstName || 'User',
        expiryTime: '1 hour'
      })

      const mailOptions = {
        from: `"ShopMe Support" <${process.env.SMTP_FROM || 'noreply@shopme.com'}>`,
        to: data.to,
        subject: 'Reset Your Password - ShopMe',
        html: htmlContent,
        text: this.generateResetEmailText(resetUrl, data.userFirstName || 'User')
      }

      const info = await this.transporter.sendMail(mailOptions)
      
      logger.info(`Password reset email sent successfully to: ${data.to}`)
      return true
    } catch (error) {
      logger.error('Failed to send password reset email:', error)
      return false
    }
  }

  private generateResetEmailHTML(data: { resetUrl: string, userFirstName: string, expiryTime: string }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #059669; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .warning { background-color: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔐 Reset Your Password</h1>
    </div>
    <div class="content">
        <p>Hello ${data.userFirstName},</p>
        
        <p>We received a request to reset the password for your ShopMe account. If you didn't make this request, you can safely ignore this email.</p>
        
        <p>To reset your password, click the button below:</p>
        
        <p style="text-align: center;">
            <a href="${data.resetUrl}" class="button">Reset My Password</a>
        </p>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px;">
            ${data.resetUrl}
        </p>
        
        <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
                <li>This link will expire in <strong>${data.expiryTime}</strong></li>
                <li>This link can only be used once</li>
                <li>If you didn't request this reset, please ignore this email</li>
            </ul>
        </div>
        
        <p>If you continue to have problems, please contact our support team.</p>
        
        <p>Best regards,<br>The ShopMe Team</p>
    </div>
    <div class="footer">
        <p>This email was sent to ${data.resetUrl.split('?')[0].includes('localhost') ? 'you' : data.resetUrl} because a password reset was requested for your ShopMe account.</p>
        <p>ShopMe - Your trusted e-commerce platform</p>
    </div>
</body>
</html>
    `
  }

  private generateResetEmailText(resetUrl: string, userFirstName: string): string {
    return `
Hello ${userFirstName},

We received a request to reset the password for your ShopMe account.

To reset your password, please visit this link:
${resetUrl}

Important:
- This link will expire in 1 hour
- This link can only be used once
- If you didn't request this reset, please ignore this email

If you continue to have problems, please contact our support team.

Best regards,
The ShopMe Team

---
This email was sent because a password reset was requested for your ShopMe account.
ShopMe - Your trusted e-commerce platform
    `
  }

  async sendOperatorNotificationEmail(data: OperatorNotificationEmailData): Promise<boolean> {
    try {
      const htmlContent = this.generateOperatorNotificationHTML(data)
      const textContent = this.generateOperatorNotificationText(data)

      const mailOptions = {
        from: `"ShopMe Support" <${data.fromEmail || process.env.SMTP_FROM || 'noreply@shopme.com'}>`,
        to: data.to,
        subject: data.subject || `🔔 Utente ${data.customerName} vuole parlare con un operatore`,
        html: htmlContent,
        text: textContent
      }

      const info = await this.transporter.sendMail(mailOptions)
      
      logger.info(`Operator notification email sent successfully to: ${data.to}`)
      return true
    } catch (error) {
      logger.error('Failed to send operator notification email:', error)
      return false
    }
  }

  private generateOperatorNotificationHTML(data: OperatorNotificationEmailData): string {
    const chatLink = data.chatId 
      ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/chat/${data.chatId}`
      : null

    return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Richiesta Assistenza Operatore</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #059669; }
        .summary-box { background-color: #e5e7eb; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; border-radius: 0 5px 5px 0; }
        .urgent { background-color: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔔 Richiesta Assistenza Operatore</h1>
    </div>
    <div class="content">
        <div class="urgent">
            <strong>⚠️ ATTENZIONE:</strong> L'utente <strong>${data.customerName}</strong> ha richiesto di parlare con un operatore.
        </div>
        
        <h3>📋 Dettagli della richiesta:</h3>
        <ul>
            <li><strong>Cliente:</strong> ${data.customerName}</li>
            <li><strong>Workspace:</strong> ${data.workspaceName || 'N/A'}</li>
            <li><strong>Data/Ora:</strong> ${new Date().toLocaleString('it-IT')}</li>
        </ul>
        
        <h3>🤖 Riassunto AI della conversazione (ultime 24h):</h3>
        <div class="summary-box">
            ${data.chatSummary}
        </div>
        
        ${chatLink ? `
        <p style="text-align: center;">
            <a href="${chatLink}" class="button">📱 Visualizza Chat Completa</a>
        </p>
        ` : ''}
        
        <p><strong>Azione richiesta:</strong> Contattare il cliente il prima possibile per fornire assistenza personalizzata.</p>
        
        <p>Cordiali saluti,<br>Sistema di Notifiche ShopMe</p>
    </div>
    <div class="footer">
        <p>Questa email è stata generata automaticamente dal sistema ShopMe quando un cliente ha richiesto assistenza operatore.</p>
        <p>ShopMe - La tua piattaforma e-commerce di fiducia</p>
    </div>
</body>
</html>
    `
  }

  private generateOperatorNotificationText(data: OperatorNotificationEmailData): string {
    const chatLink = data.chatId 
      ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/chat/${data.chatId}`
      : null

    return `
🔔 RICHIESTA ASSISTENZA OPERATORE

⚠️ ATTENZIONE: L'utente ${data.customerName} ha richiesto di parlare con un operatore.

📋 Dettagli della richiesta:
- Cliente: ${data.customerName}
- Workspace: ${data.workspaceName || 'N/A'}
- Data/Ora: ${new Date().toLocaleString('it-IT')}

🤖 Riassunto AI della conversazione (ultime 24h):
${data.chatSummary}

${chatLink ? `📱 Link alla chat completa: ${chatLink}` : ''}

Azione richiesta: Contattare il cliente il prima possibile per fornire assistenza personalizzata.

Cordiali saluti,
Sistema di Notifiche ShopMe

---
Questa email è stata generata automaticamente dal sistema ShopMe quando un cliente ha richiesto assistenza operatore.
ShopMe - La tua piattaforma e-commerce di fiducia
    `
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      logger.info('Email service connection verified successfully')
      return true
    } catch (error) {
      logger.error('Email service connection failed:', error)
      return false
    }
  }
}