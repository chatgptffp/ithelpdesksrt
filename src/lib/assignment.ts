import { prisma } from "@/lib/db";

interface AssignmentResult {
  teamId: string | null;
  teamName: string | null;
}

/**
 * หาทีมที่รับผิดชอบตาม Assignment Rules
 * @param systemId - ID ของระบบที่มีปัญหา
 * @param categoryId - ID ของหมวดหมู่ปัญหา
 * @returns ทีมที่รับผิดชอบ (ถ้ามี)
 */
export async function findResponsibleTeam(
  systemId?: string | null,
  categoryId?: string | null
): Promise<AssignmentResult> {
  // หากฎที่ match ทั้ง system และ category
  // เรียงตาม priority สูงสุดก่อน
  const rules = await prisma.assignmentRule.findMany({
    where: {
      isActive: true,
      OR: [
        // Match ทั้ง system และ category
        ...(systemId && categoryId
          ? [{ systemId, categoryId }]
          : []),
        // Match เฉพาะ system
        ...(systemId
          ? [{ systemId, categoryId: null }]
          : []),
        // Match เฉพาะ category
        ...(categoryId
          ? [{ systemId: null, categoryId }]
          : []),
        // Default rule (ไม่ระบุ system และ category)
        { systemId: null, categoryId: null },
      ],
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
    include: {
      team: {
        select: { id: true, name: true, isActive: true },
      },
    },
  });

  // หากฎที่ match ที่สุด
  for (const rule of rules) {
    // ข้ามทีมที่ไม่ active
    if (!rule.team.isActive) continue;

    // Priority: match ทั้งคู่ > match อย่างใดอย่างหนึ่ง > default
    const matchBoth = rule.systemId === systemId && rule.categoryId === categoryId;
    const matchSystem = rule.systemId === systemId && !rule.categoryId;
    const matchCategory = !rule.systemId && rule.categoryId === categoryId;
    const isDefault = !rule.systemId && !rule.categoryId;

    if (matchBoth || matchSystem || matchCategory || isDefault) {
      return {
        teamId: rule.team.id,
        teamName: rule.team.name,
      };
    }
  }

  return { teamId: null, teamName: null };
}

/**
 * ดึงรายชื่อสมาชิกในทีม
 * @param teamId - ID ของทีม
 * @returns รายชื่อสมาชิก
 */
export async function getTeamMembers(teamId: string) {
  const members = await prisma.staffTeamMap.findMany({
    where: { teamId },
    include: {
      staff: {
        select: { id: true, displayName: true, email: true, status: true },
      },
    },
    orderBy: [
      { isLeader: "desc" },
      { createdAt: "asc" },
    ],
  });

  return members
    .filter((m: { staff: { status: string } }) => m.staff.status === "ACTIVE")
    .map((m: { staff: { id: string; displayName: string; email: string }; isLeader: boolean }) => ({
      id: m.staff.id,
      displayName: m.staff.displayName,
      email: m.staff.email,
      isLeader: m.isLeader,
    }));
}
