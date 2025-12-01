import { prisma } from '@/lib/db';
import { EmailService } from './email';
import { LineNotifyService } from './line';
import { DiscordWebhookService } from './discord';
// Temporary enums until Prisma regenerates
enum NotificationChannel {
  EMAIL = 'EMAIL',
  LINE = 'LINE',
  DISCORD = 'DISCORD'
}

enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export interface NotificationData {
  ticketId?: string;
  ticketCode?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  assigneeName?: string;
  requesterName?: string;
  comment?: string;
  url?: string;
}

export class NotificationManager {
  private emailService: EmailService | null = null;
  private lineService: LineNotifyService | null = null;
  private discordService: DiscordWebhookService | null = null;

  constructor(private organizationId?: string) {}

  async initialize() {
    const settings = await prisma.notificationSettings.findFirst({
      where: { organizationId: this.organizationId },
    });

    if (!settings) {
      console.warn('No notification settings found');
      return;
    }

    if (settings.emailEnabled) {
      this.emailService = new EmailService(settings as any);
    }

    if (settings.lineEnabled) {
      this.lineService = new LineNotifyService(settings as any);
    }

    if (settings.discordEnabled) {
      this.discordService = new DiscordWebhookService(settings as any);
    }
  }

  async sendNotification(
    templateName: string,
    channel: NotificationChannel,
    recipient: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      // Get template
      const template = await prisma.notificationTemplate.findFirst({
        where: {
          organizationId: this.organizationId,
          name: templateName,
          channel,
          isActive: true,
        },
      });

      if (!template) {
        console.warn(`Template not found: ${templateName} for ${channel}`);
        return false;
      }

      // Replace variables in template
      const subject = this.replaceVariables(template.subject || '', data);
      const body = this.replaceVariables(template.body, data);

      // Send notification based on channel
      let success = false;
      let error: string | null = null;

      try {
        switch (channel) {
          case 'EMAIL':
            if (this.emailService) {
              success = await this.emailService.sendEmail({
                to: recipient,
                subject,
                html: body,
              });
            }
            break;

          case 'LINE':
            if (this.lineService) {
              success = await this.lineService.sendMessage({
                message: body,
              });
            }
            break;

          case 'DISCORD':
            if (this.discordService) {
              success = await this.discordService.sendMessage({
                content: body,
                username: 'IT Helpdesk Bot',
              });
            }
            break;
        }
      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error';
        success = false;
      }

      // Log notification
      await prisma.notification.create({
        data: {
          templateId: template.id,
          ticketId: data.ticketId,
          channel,
          recipient,
          subject,
          body,
          status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
          error,
          sentAt: success ? new Date() : null,
        },
      });

      return success;
    } catch (error) {
      console.error('Notification send error:', error);
      return false;
    }
  }

  private replaceVariables(template: string, data: NotificationData): string {
    let result = template;

    // Replace common variables
    const variables = {
      '{{ticketCode}}': data.ticketCode || '',
      '{{subject}}': data.subject || '',
      '{{description}}': data.description || '',
      '{{status}}': data.status || '',
      '{{priority}}': data.priority || '',
      '{{category}}': data.category || '',
      '{{assigneeName}}': data.assigneeName || '',
      '{{requesterName}}': data.requesterName || '',
      '{{comment}}': data.comment || '',
      '{{url}}': data.url || '',
      '{{date}}': new Date().toLocaleDateString('th-TH'),
      '{{time}}': new Date().toLocaleTimeString('th-TH'),
    };

    for (const [variable, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(variable, 'g'), value);
    }

    return result;
  }

  // Convenience methods for common notifications
  async notifyTicketCreated(ticketData: NotificationData, recipients: string[]) {
    const promises = [];

    for (const recipient of recipients) {
      // Try all enabled channels
      if (this.emailService) {
        promises.push(
          this.sendNotification('ticket_created', NotificationChannel.EMAIL, recipient, ticketData)
        );
      }
      if (this.lineService) {
        promises.push(
          this.sendNotification('ticket_created', NotificationChannel.LINE, recipient, ticketData)
        );
      }
      if (this.discordService) {
        promises.push(
          this.sendNotification('ticket_created', NotificationChannel.DISCORD, recipient, ticketData)
        );
      }
    }

    await Promise.allSettled(promises);
  }

  async notifyStatusChanged(ticketData: NotificationData, recipients: string[]) {
    const promises = [];

    for (const recipient of recipients) {
      if (this.emailService) {
        promises.push(
          this.sendNotification('ticket_status_changed', NotificationChannel.EMAIL, recipient, ticketData)
        );
      }
      if (this.lineService) {
        promises.push(
          this.sendNotification('ticket_status_changed', NotificationChannel.LINE, recipient, ticketData)
        );
      }
      if (this.discordService) {
        promises.push(
          this.sendNotification('ticket_status_changed', NotificationChannel.DISCORD, recipient, ticketData)
        );
      }
    }

    await Promise.allSettled(promises);
  }

  async notifyCommentAdded(ticketData: NotificationData, recipients: string[]) {
    const promises = [];

    for (const recipient of recipients) {
      if (this.emailService) {
        promises.push(
          this.sendNotification('comment_added', NotificationChannel.EMAIL, recipient, ticketData)
        );
      }
      if (this.lineService) {
        promises.push(
          this.sendNotification('comment_added', NotificationChannel.LINE, recipient, ticketData)
        );
      }
      if (this.discordService) {
        promises.push(
          this.sendNotification('comment_added', NotificationChannel.DISCORD, recipient, ticketData)
        );
      }
    }

    await Promise.allSettled(promises);
  }
}
