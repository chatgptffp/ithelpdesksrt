import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

// Temporary type until Prisma generates new types
interface NotificationSettings {
  emailEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpSecure: boolean;
  fromEmail: string | null;
  fromName: string | null;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

  constructor(private settings: NotificationSettings) {
    if (this.settings.emailEnabled && this.settings.smtpHost) {
      const transportOptions: SMTPTransport.Options = {
        host: this.settings.smtpHost,
        port: this.settings.smtpPort || 587,
        secure: this.settings.smtpSecure,
        auth: {
          user: this.settings.smtpUser || '',
          pass: this.settings.smtpPassword || '',
        },
      };
      this.transporter = nodemailer.createTransport(transportOptions);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const info = await this.transporter.sendMail({
        from: `${this.settings.fromName || 'IT Helpdesk'} <${this.settings.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}
