import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { code: "ADMIN" },
    update: {},
    create: {
      code: "ADMIN",
      name: "ผู้ดูแลระบบ",
      description: "สิทธิ์เข้าถึงทุกฟังก์ชัน",
    },
  });

  const agentRole = await prisma.role.upsert({
    where: { code: "AGENT" },
    update: {},
    create: {
      code: "AGENT",
      name: "เจ้าหน้าที่",
      description: "จัดการ Ticket และตอบกลับ",
    },
  });

  console.log("Created roles:", { adminRole, agentRole });

  // Create Org Units (Bureau -> Division -> Department)
  const itBureau = await prisma.orgUnit.upsert({
    where: { type_code: { type: "BUREAU", code: "B-IT" } },
    update: {},
    create: {
      code: "B-IT",
      name: "สำนักเทคโนโลยีสารสนเทศ",
      type: "BUREAU",
      isActive: true,
      sortOrder: 1,
    },
  });

  const devDivision = await prisma.orgUnit.upsert({
    where: { type_code: { type: "DIVISION", code: "D-DEV" } },
    update: {},
    create: {
      code: "D-DEV",
      name: "กองพัฒนาระบบ",
      type: "DIVISION",
      parentId: itBureau.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const infraDivision = await prisma.orgUnit.upsert({
    where: { type_code: { type: "DIVISION", code: "D-INFRA" } },
    update: {},
    create: {
      code: "D-INFRA",
      name: "กองโครงสร้างพื้นฐาน",
      type: "DIVISION",
      parentId: itBureau.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  const webDept = await prisma.orgUnit.upsert({
    where: { type_code: { type: "DEPARTMENT", code: "DP-WEB" } },
    update: {},
    create: {
      code: "DP-WEB",
      name: "งานพัฒนาเว็บ",
      type: "DEPARTMENT",
      parentId: devDivision.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const appDept = await prisma.orgUnit.upsert({
    where: { type_code: { type: "DEPARTMENT", code: "DP-APP" } },
    update: {},
    create: {
      code: "DP-APP",
      name: "งานพัฒนาแอปพลิเคชัน",
      type: "DEPARTMENT",
      parentId: devDivision.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  const netDept = await prisma.orgUnit.upsert({
    where: { type_code: { type: "DEPARTMENT", code: "DP-NET" } },
    update: {},
    create: {
      code: "DP-NET",
      name: "งานเครือข่าย",
      type: "DEPARTMENT",
      parentId: infraDivision.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log("Created org units");

  // Create Categories
  const categories = [
    { code: "CAT-ACC", name: "บัญชีผู้ใช้/สิทธิ์เข้าใช้งาน", sortOrder: 1 },
    { code: "CAT-EMAIL", name: "อีเมล/ปฏิทิน", sortOrder: 2 },
    { code: "CAT-NET", name: "เครือข่าย/อินเทอร์เน็ต", sortOrder: 3 },
    { code: "CAT-DOC", name: "ระบบเอกสาร/e-Office", sortOrder: 4 },
    { code: "CAT-HW", name: "เครื่องคอมพิวเตอร์/อุปกรณ์", sortOrder: 5 },
    { code: "CAT-SW", name: "โปรแกรม/ซอฟต์แวร์", sortOrder: 6 },
    { code: "CAT-OTHER", name: "อื่นๆ", sortOrder: 99 },
  ];

  for (const cat of categories) {
    await prisma.mdCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
  }
  console.log("Created categories");

  // Create Priorities
  const priorities = [
    { code: "P1", name: "เร่งด่วนมาก (ระบบล่ม)", severity: 1, slaFirstResponseMins: 30, slaResolveMins: 240, sortOrder: 1 },
    { code: "P2", name: "เร่งด่วน (กระทบงานมาก)", severity: 2, slaFirstResponseMins: 120, slaResolveMins: 480, sortOrder: 2 },
    { code: "P3", name: "ปกติ", severity: 3, slaFirstResponseMins: 480, slaResolveMins: 1440, sortOrder: 3 },
    { code: "P4", name: "ต่ำ (ไม่เร่งด่วน)", severity: 4, slaFirstResponseMins: 1440, slaResolveMins: 4320, sortOrder: 4 },
  ];

  for (const priority of priorities) {
    await prisma.mdPriority.upsert({
      where: { code: priority.code },
      update: {},
      create: priority,
    });
  }
  console.log("Created priorities");

  // Create Systems
  const systems = [
    { code: "SYS-ERP", name: "ระบบ ERP", sortOrder: 1 },
    { code: "SYS-HRM", name: "ระบบบริหารงานบุคคล (HRM)", sortOrder: 2 },
    { code: "SYS-DOC", name: "ระบบเอกสารอิเล็กทรอนิกส์", sortOrder: 3 },
    { code: "SYS-EMAIL", name: "ระบบอีเมลองค์กร", sortOrder: 4 },
    { code: "SYS-VPN", name: "VPN/Remote Access", sortOrder: 5 },
    { code: "SYS-WIFI", name: "Wi-Fi/เครือข่าย", sortOrder: 6 },
    { code: "SYS-OTHER", name: "อื่นๆ", sortOrder: 99 },
  ];

  for (const system of systems) {
    await prisma.mdSystem.upsert({
      where: { code: system.code },
      update: {},
      create: system,
    });
  }
  console.log("Created systems");

  // Create Admin User
  const passwordHash = await hash("admin123", 12);
  
  const adminUser = await prisma.staffUser.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      displayName: "Admin User",
      status: "ACTIVE",
    },
  });

  // Assign admin role
  await prisma.staffRoleMap.upsert({
    where: {
      staffUserId_roleId: {
        staffUserId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      staffUserId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log("Created admin user: admin@example.com / admin123");

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
