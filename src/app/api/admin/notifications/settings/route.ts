import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, use undefined as organizationId (single tenant)
    const organizationId: string | undefined = undefined;

    const settings = await prisma.notificationSettings.findFirst({
      where: { organizationId: organizationId ?? undefined },
    });

    if (!settings) {
      // Create default settings
      const defaultSettings = await prisma.notificationSettings.create({
        data: {
          organizationId: organizationId ?? undefined,
          emailEnabled: false,
          lineEnabled: false,
          discordEnabled: false,
        },
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, use undefined as organizationId (single tenant)
    const organizationId: string | undefined = undefined;
    const data = await request.json();

    const settings = await prisma.notificationSettings.upsert({
      where: { organizationId: organizationId ?? undefined },
      update: {
        emailEnabled: data.emailEnabled,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPassword: data.smtpPassword,
        smtpSecure: data.smtpSecure,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        lineEnabled: data.lineEnabled,
        lineChannelSecret: data.lineChannelSecret,
        lineAccessToken: data.lineAccessToken,
        lineUserId: data.lineUserId,
        discordEnabled: data.discordEnabled,
        discordWebhook: data.discordWebhook,
      },
      create: {
        organizationId: organizationId ?? undefined,
        emailEnabled: data.emailEnabled,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPassword: data.smtpPassword,
        smtpSecure: data.smtpSecure,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        lineEnabled: data.lineEnabled,
        lineChannelSecret: data.lineChannelSecret,
        lineAccessToken: data.lineAccessToken,
        lineUserId: data.lineUserId,
        discordEnabled: data.discordEnabled,
        discordWebhook: data.discordWebhook,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
