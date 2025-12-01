// Default notification templates
export const defaultTemplates = [
  // Ticket Created Templates
  {
    name: 'ticket_created',
    channel: 'EMAIL',
    subject: '🎫 แจ้งปัญหาใหม่ #{{ticketCode}} - {{subject}}',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">🎫 แจ้งปัญหาใหม่</h1>
  </div>
  
  <div style="padding: 20px; background: #f8fafc;">
    <h2 style="color: #1e293b;">รายการ #{{ticketCode}}</h2>
    <p><strong>หัวข้อ:</strong> {{subject}}</p>
    <p><strong>ผู้แจ้ง:</strong> {{requesterName}}</p>
    <p><strong>หมวดหมู่:</strong> {{category}}</p>
    <p><strong>ความสำคัญ:</strong> {{priority}}</p>
    <p><strong>สถานะ:</strong> {{status}}</p>
    
    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="color: #374151; margin-top: 0;">รายละเอียด:</h3>
      <p style="white-space: pre-wrap;">{{description}}</p>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="{{url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        ดูรายละเอียด
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      วันที่: {{date}} เวลา: {{time}}
    </p>
  </div>
</div>
    `,
    isActive: true,
  },
  {
    name: 'ticket_created',
    channel: 'LINE',
    subject: '',
    body: `🎫 แจ้งปัญหาใหม่ #{{ticketCode}}

📋 หัวข้อ: {{subject}}
👤 ผู้แจ้ง: {{requesterName}}
📂 หมวดหมู่: {{category}}
⚡ ความสำคัญ: {{priority}}
📊 สถานะ: {{status}}

📝 รายละเอียด:
{{description}}

🔗 ดูรายละเอียด: {{url}}

📅 {{date}} ⏰ {{time}}`,
    isActive: true,
  },
  {
    name: 'ticket_created',
    channel: 'DISCORD',
    subject: '',
    body: `🎫 **แจ้งปัญหาใหม่ #{{ticketCode}}**

**📋 หัวข้อ:** {{subject}}
**👤 ผู้แจ้ง:** {{requesterName}}
**📂 หมวดหมู่:** {{category}}
**⚡ ความสำคัญ:** {{priority}}
**📊 สถานะ:** {{status}}

**📝 รายละเอียด:**
\`\`\`
{{description}}
\`\`\`

🔗 [ดูรายละเอียด]({{url}})

📅 {{date}} ⏰ {{time}}`,
    isActive: true,
  },

  // Status Changed Templates
  {
    name: 'ticket_status_changed',
    channel: 'EMAIL',
    subject: '🔄 อัปเดตสถานะ #{{ticketCode}} - {{status}}',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #059669; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">🔄 อัปเดตสถานะ</h1>
  </div>
  
  <div style="padding: 20px; background: #f8fafc;">
    <h2 style="color: #1e293b;">รายการ #{{ticketCode}}</h2>
    <p><strong>หัวข้อ:</strong> {{subject}}</p>
    <p><strong>สถานะใหม่:</strong> <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px;">{{status}}</span></p>
    <p><strong>ผู้รับผิดชอบ:</strong> {{assigneeName}}</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="{{url}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        ดูรายละเอียด
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      วันที่: {{date}} เวลา: {{time}}
    </p>
  </div>
</div>
    `,
    isActive: true,
  },
  {
    name: 'ticket_status_changed',
    channel: 'LINE',
    subject: '',
    body: `🔄 อัปเดตสถานะ #{{ticketCode}}

📋 หัวข้อ: {{subject}}
📊 สถานะใหม่: {{status}}
👨‍💼 ผู้รับผิดชอบ: {{assigneeName}}

🔗 ดูรายละเอียด: {{url}}

📅 {{date}} ⏰ {{time}}`,
    isActive: true,
  },
  {
    name: 'ticket_status_changed',
    channel: 'DISCORD',
    subject: '',
    body: `🔄 **อัปเดตสถานะ #{{ticketCode}}**

**📋 หัวข้อ:** {{subject}}
**📊 สถานะใหม่:** {{status}}
**👨‍💼 ผู้รับผิดชอบ:** {{assigneeName}}

🔗 [ดูรายละเอียด]({{url}})

📅 {{date}} ⏰ {{time}}`,
    isActive: true,
  },

  // Comment Added Templates
  {
    name: 'comment_added',
    channel: 'EMAIL',
    subject: '💬 ความคิดเห็นใหม่ #{{ticketCode}}',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">💬 ความคิดเห็นใหม่</h1>
  </div>
  
  <div style="padding: 20px; background: #f8fafc;">
    <h2 style="color: #1e293b;">รายการ #{{ticketCode}}</h2>
    <p><strong>หัวข้อ:</strong> {{subject}}</p>
    
    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #7c3aed;">
      <h3 style="color: #374151; margin-top: 0;">ความคิดเห็น:</h3>
      <p style="white-space: pre-wrap;">{{comment}}</p>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="{{url}}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        ดูรายละเอียด
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      วันที่: {{date}} เวลา: {{time}}
    </p>
  </div>
</div>
    `,
    isActive: true,
  },
  {
    name: 'comment_added',
    channel: 'LINE',
    subject: '',
    body: `💬 ความคิดเห็นใหม่ #{{ticketCode}}

📋 หัวข้อ: {{subject}}

💭 ความคิดเห็น:
{{comment}}

🔗 ดูรายละเอียด: {{url}}

📅 {{date}} ⏰ {{time}}`,
    isActive: true,
  },
  {
    name: 'comment_added',
    channel: 'DISCORD',
    subject: '',
    body: `💬 **ความคิดเห็นใหม่ #{{ticketCode}}**

**📋 หัวข้อ:** {{subject}}

**💭 ความคิดเห็น:**
\`\`\`
{{comment}}
\`\`\`

🔗 [ดูรายละเอียด]({{url}})

📅 {{date}} ⏰ {{time}}`,
    isActive: true,
  },
];

export async function createDefaultTemplates(organizationId?: string) {
  const { prisma } = await import('@/lib/db');
  
  try {
    // Check if templates already exist
    const existingCount = await prisma.notificationTemplate.count({
      where: { organizationId: organizationId || null }
    });
    
    if (existingCount > 0) {
      console.log('Default templates already exist');
      return;
    }
    
    // Create default templates
    await prisma.notificationTemplate.createMany({
      data: defaultTemplates.map(template => ({
        ...template,
        organizationId: organizationId || null,
      }))
    });
    
    console.log(`Created ${defaultTemplates.length} default notification templates`);
  } catch (error) {
    console.error('Error creating default templates:', error);
  }
}
