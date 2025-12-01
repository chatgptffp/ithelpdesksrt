import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/notification/email';
import { LineMessagingService } from '@/lib/notification/line';
import { DiscordWebhookService } from '@/lib/notification/discord';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  let type = '';
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    type = resolvedParams.type;
    const settings = await request.json();

    switch (type) {
      case 'email':
        if (!settings.emailEnabled) {
          return NextResponse.json({ error: 'Email not enabled' }, { status: 400 });
        }

        const emailService = new EmailService(settings);
        const emailTest = await emailService.testConnection();
        
        if (emailTest) {
          // Send test email
          await emailService.sendEmail({
            to: settings.smtpUser || settings.fromEmail,
            subject: '🧪 ทดสอบการส่งอีเมลจาก IT Helpdesk',
            html: `
              <h2>ทดสอบการส่งอีเมลสำเร็จ! ✅</h2>
              <p>การตั้งค่า SMTP ของคุณทำงานได้ถูกต้อง</p>
              <p><strong>เวลาทดสอบ:</strong> ${new Date().toLocaleString('th-TH')}</p>
              <hr>
              <p><small>ข้อความนี้ส่งจากระบบ IT Helpdesk</small></p>
            `,
          });
        }

        return NextResponse.json({ success: emailTest });

      case 'line':
        if (!settings.lineEnabled) {
          return NextResponse.json({ error: 'LINE not enabled' }, { status: 400 });
        }

        const lineService = new LineMessagingService(settings);
        const lineTest = await lineService.testConnection();
        
        if (lineTest) {
          // Send test message using rich notification
          await lineService.sendRichNotification(
            '🧪 ทดสอบการเชื่อมต่อ',
            `✅ การตั้งค่า LINE Messaging API ทำงานได้ถูกต้อง\n⏰ เวลาทดสอบ: ${new Date().toLocaleString('th-TH')}`
          );
        }

        return NextResponse.json({ success: lineTest });

      case 'discord':
        if (!settings.discordEnabled) {
          return NextResponse.json({ error: 'Discord not enabled' }, { status: 400 });
        }

        const discordService = new DiscordWebhookService(settings);
        const discordTest = await discordService.sendMessage({
          content: '🧪 ทดสอบการส่งข้อความจาก IT Helpdesk',
          username: 'IT Helpdesk Bot',
          embeds: [
            {
              title: '✅ ทดสอบการเชื่อมต่อสำเร็จ',
              description: 'การตั้งค่า Discord Webhook ทำงานได้ถูกต้อง',
              color: 0x00ff00,
              timestamp: new Date().toISOString(),
              footer: {
                text: 'IT Helpdesk System',
              },
            },
          ],
        });

        return NextResponse.json({ success: discordTest });

      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }
  } catch (error) {
    console.error(`Test ${type} error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    );
  }
}
