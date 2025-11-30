# IT Helpdesk - ระบบแจ้งปัญหาการใช้งาน IT

ระบบแจ้งปัญหาการใช้งานระบบสำหรับพนักงานภายในองค์กร โดยผู้แจ้งไม่ต้อง Login

## Tech Stack

- **Frontend**: React 19 + Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **File Upload**: Vercel Blob (optional)

## Features

### สำหรับผู้แจ้ง (ไม่ต้อง Login)
- แจ้งปัญหาผ่านฟอร์มง่ายๆ
- รับรหัส Ticket ทันที
- ติดตามสถานะด้วยรหัส Ticket + รหัสพนักงาน
- เพิ่มข้อมูลตอบกลับ
- ประเมินความพึงพอใจ

### สำหรับเจ้าหน้าที่ IT (ต้อง Login)
- Dashboard แสดงสถิติ
- จัดการ Ticket (เปลี่ยนสถานะ, มอบหมาย, ตอบกลับ)
- จัดการ Master Data (หมวดหมู่, ความเร่งด่วน, ระบบ, หน่วยงาน)
- จัดการผู้ใช้งาน

## Getting Started

### 1. Clone และติดตั้ง Dependencies

```bash
git clone <repository-url>
cd it-helpdesk
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/it_helpdesk"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
EMPLOYEE_CODE_HMAC_KEY="your-hmac-key"
```

### 3. ตั้งค่าฐานข้อมูล

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ไปยังฐานข้อมูล
npm run db:push

# (Optional) เพิ่มข้อมูลตัวอย่าง
npm run db:seed
```

### 4. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Default Admin Account

หลังจาก run seed:
- **Email**: admin@example.com
- **Password**: admin123

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages (no auth required)
│   │   ├── report/        # Report issue form
│   │   └── track/         # Track ticket status
│   ├── admin/             # Admin pages (auth required)
│   │   ├── tickets/       # Ticket management
│   │   └── master-data/   # Master data management
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   └── admin/             # Admin-specific components
├── lib/
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # NextAuth config
│   └── validations/       # Zod schemas
└── types/                 # TypeScript types
```

## Deploy on Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

## License

MIT
