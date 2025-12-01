// Temporary type until Prisma generates new types
interface NotificationSettings {
  discordEnabled: boolean;
  discordWebhook: string | null;
}

export interface DiscordWebhookOptions {
  content: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export class DiscordWebhookService {
  constructor(private settings: NotificationSettings) {}

  async sendMessage(options: DiscordWebhookOptions): Promise<boolean> {
    if (!this.settings.discordEnabled || !this.settings.discordWebhook) {
      throw new Error('Discord webhook service not configured');
    }

    try {
      const response = await fetch(this.settings.discordWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook error: ${response.status} ${response.statusText}`);
      }

      console.log('Discord webhook sent successfully');
      return true;
    } catch (error) {
      console.error('Discord webhook send error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.settings.discordEnabled || !this.settings.discordWebhook) {
      return false;
    }

    try {
      // Send a test message
      const response = await fetch(this.settings.discordWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: '🧪 Test connection from IT Helpdesk',
          username: 'IT Helpdesk Bot',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Discord webhook connection test failed:', error);
      return false;
    }
  }
}
