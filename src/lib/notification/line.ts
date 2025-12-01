// Temporary type until Prisma generates new types
interface NotificationSettings {
  lineEnabled: boolean;
  lineChannelSecret: string | null;
  lineAccessToken: string | null;
  lineUserId: string | null;
}

export interface LineMessageOptions {
  text?: string;
  sticker?: {
    packageId: string;
    stickerId: string;
  };
  flex?: any; // Flex Message JSON
  template?: any; // Template Message JSON
}

export class LineMessagingService {
  private readonly baseUrl = 'https://api.line.me/v2/bot';

  constructor(private settings: NotificationSettings) {}

  async sendMessage(options: LineMessageOptions): Promise<boolean> {
    if (!this.settings.lineEnabled || !this.settings.lineAccessToken || !this.settings.lineUserId) {
      throw new Error('LINE Messaging API service not configured');
    }

    try {
      const messages: any[] = [];

      // Text message
      if (options.text) {
        messages.push({
          type: 'text',
          text: options.text,
        });
      }

      // Sticker message
      if (options.sticker) {
        messages.push({
          type: 'sticker',
          packageId: options.sticker.packageId,
          stickerId: options.sticker.stickerId,
        });
      }

      // Flex message
      if (options.flex) {
        messages.push({
          type: 'flex',
          altText: 'Notification from IT Helpdesk',
          contents: options.flex,
        });
      }

      // Template message
      if (options.template) {
        messages.push({
          type: 'template',
          altText: 'Notification from IT Helpdesk',
          template: options.template,
        });
      }

      if (messages.length === 0) {
        throw new Error('No message content provided');
      }

      const response = await fetch(`${this.baseUrl}/message/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.lineAccessToken}`,
        },
        body: JSON.stringify({
          to: this.settings.lineUserId,
          messages: messages.slice(0, 5), // LINE API limit: max 5 messages
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LINE Messaging API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('LINE message sent successfully');
      return true;
    } catch (error) {
      console.error('LINE Messaging API send error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.settings.lineEnabled || !this.settings.lineAccessToken) {
      return false;
    }

    try {
      // Test by getting bot info
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.settings.lineAccessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('LINE Messaging API connection test failed:', error);
      return false;
    }
  }

  // Helper method to create rich notification
  async sendRichNotification(title: string, message: string, url?: string): Promise<boolean> {
    const flexMessage = {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🔔 IT Helpdesk',
            weight: 'bold',
            color: '#1DB446',
            size: 'sm',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: title,
            weight: 'bold',
            size: 'lg',
            wrap: true,
          },
          {
            type: 'text',
            text: message,
            size: 'md',
            wrap: true,
            margin: 'md',
          },
        ],
      },
      footer: url ? {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียด',
              uri: url,
            },
            style: 'primary',
            color: '#1DB446',
          },
        ],
      } : undefined,
    };

    return this.sendMessage({ flex: flexMessage });
  }
}
