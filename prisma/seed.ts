import { hash } from "bcryptjs";
import { prisma } from "../src/lib/db";

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
  // ใช้ findFirst + create แทน upsert เพราะ unique constraint มี organizationId
  let itBureau = await prisma.orgUnit.findFirst({
    where: { type: "BUREAU", code: "B-IT" },
  });
  if (!itBureau) {
    itBureau = await prisma.orgUnit.create({
      data: {
        code: "B-IT",
        name: "สำนักเทคโนโลยีสารสนเทศ",
        type: "BUREAU",
        isActive: true,
        sortOrder: 1,
      },
    });
  }

  let devDivision = await prisma.orgUnit.findFirst({
    where: { type: "DIVISION", code: "D-DEV" },
  });
  if (!devDivision) {
    devDivision = await prisma.orgUnit.create({
      data: {
        code: "D-DEV",
        name: "กองพัฒนาระบบ",
        type: "DIVISION",
        parentId: itBureau.id,
        isActive: true,
        sortOrder: 1,
      },
    });
  }

  let infraDivision = await prisma.orgUnit.findFirst({
    where: { type: "DIVISION", code: "D-INFRA" },
  });
  if (!infraDivision) {
    infraDivision = await prisma.orgUnit.create({
      data: {
        code: "D-INFRA",
        name: "กองโครงสร้างพื้นฐาน",
        type: "DIVISION",
        parentId: itBureau.id,
        isActive: true,
        sortOrder: 2,
      },
    });
  }

  let webDept = await prisma.orgUnit.findFirst({
    where: { type: "DEPARTMENT", code: "DP-WEB" },
  });
  if (!webDept) {
    webDept = await prisma.orgUnit.create({
      data: {
        code: "DP-WEB",
        name: "งานพัฒนาเว็บ",
        type: "DEPARTMENT",
        parentId: devDivision.id,
        isActive: true,
        sortOrder: 1,
      },
    });
  }

  let appDept = await prisma.orgUnit.findFirst({
    where: { type: "DEPARTMENT", code: "DP-APP" },
  });
  if (!appDept) {
    appDept = await prisma.orgUnit.create({
      data: {
        code: "DP-APP",
        name: "งานพัฒนาแอปพลิเคชัน",
        type: "DEPARTMENT",
        parentId: devDivision.id,
        isActive: true,
        sortOrder: 2,
      },
    });
  }

  let netDept = await prisma.orgUnit.findFirst({
    where: { type: "DEPARTMENT", code: "DP-NET" },
  });
  if (!netDept) {
    netDept = await prisma.orgUnit.create({
      data: {
        code: "DP-NET",
        name: "งานเครือข่าย",
        type: "DEPARTMENT",
        parentId: infraDivision.id,
        isActive: true,
        sortOrder: 1,
      },
    });
  }

  console.log("Created org units");

  // Create Categories (ใช้ findFirst + create เพราะ unique constraint มี organizationId)
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
    const existing = await prisma.mdCategory.findFirst({ where: { code: cat.code } });
    if (!existing) {
      await prisma.mdCategory.create({ data: cat });
    }
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
    const existing = await prisma.mdPriority.findFirst({ where: { code: priority.code } });
    if (!existing) {
      await prisma.mdPriority.create({ data: priority });
    }
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
    const existing = await prisma.mdSystem.findFirst({ where: { code: system.code } });
    if (!existing) {
      await prisma.mdSystem.create({ data: system });
    }
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
  .finally(() => {
    process.exit(0);
  });
