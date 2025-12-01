// Temporary type until Prisma generates new types
interface NotificationSettings {
  lineEnabled: boolean;
  lineToken: string | null;
}

export interface LineNotifyOptions {
  message: string;
  stickerPackageId?: number;
  stickerId?: number;
}

export class LineNotifyService {
  constructor(private settings: NotificationSettings) {}

  async sendMessage(options: LineNotifyOptions): Promise<boolean> {
    if (!this.settings.lineEnabled || !this.settings.lineToken) {
      throw new Error('LINE Notify service not configured');
    }

    try {
      const formData = new FormData();
      formData.append('message', options.message);
      
      if (options.stickerPackageId && options.stickerId) {
        formData.append('stickerPackageId', options.stickerPackageId.toString());
        formData.append('stickerId', options.stickerId.toString());
      }

      const response = await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings.lineToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`LINE Notify API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('LINE Notify sent:', result);
      return true;
    } catch (error) {
      console.error('LINE Notify send error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.settings.lineEnabled || !this.settings.lineToken) {
      return false;
    }

    try {
      const response = await fetch('https://notify-api.line.me/api/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.settings.lineToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('LINE Notify connection test failed:', error);
      return false;
    }
  }
}
