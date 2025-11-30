import { z } from "zod";

// Schema สำหรับการอัปเดต Ticket (Admin)
export const updateTicketSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED", "REJECTED"]).optional(),
  assigneeId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  priorityId: z.string().nullable().optional(),
  note: z.string().max(500).optional(),
});

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

// Schema สำหรับการเพิ่ม Comment (Admin)
export const adminCommentSchema = z.object({
  message: z
    .string()
    .min(1, "กรุณาระบุข้อความ")
    .max(4000, "ข้อความต้องไม่เกิน 4000 ตัวอักษร"),
  visibility: z.enum(["PUBLIC", "INTERNAL"]).default("PUBLIC"),
  cannedResponseId: z.string().optional(),
});

export type AdminCommentInput = z.infer<typeof adminCommentSchema>;

// Schema สำหรับ Master Data - Category
export const categorySchema = z.object({
  code: z
    .string()
    .min(1, "กรุณาระบุรหัส")
    .max(20, "รหัสต้องไม่เกิน 20 ตัวอักษร")
    .regex(/^[A-Za-z0-9\-_]+$/, "รหัสต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น"),
  name: z
    .string()
    .min(1, "กรุณาระบุชื่อ")
    .max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Schema สำหรับ Master Data - Priority
export const prioritySchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(50),
  severity: z.number().int().min(1).max(5).default(3),
  slaFirstResponseMins: z.number().int().nullable().optional(),
  slaResolveMins: z.number().int().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type PriorityInput = z.infer<typeof prioritySchema>;

// Schema สำหรับ Master Data - System
export const systemSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  ownerTeam: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type SystemInput = z.infer<typeof systemSchema>;

// Schema สำหรับ Org Unit
export const orgUnitSchema = z.object({
  code: z.string().max(20).optional(),
  name: z.string().min(1).max(100),
  type: z.enum(["BUREAU", "DIVISION", "DEPARTMENT"]),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type OrgUnitInput = z.infer<typeof orgUnitSchema>;

// Schema สำหรับ Staff User
export const staffUserSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  displayName: z.string().min(1).max(100),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร").optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE"),
  orgUnitId: z.string().nullable().optional(),
  roleIds: z.array(z.string()).optional(),
});

export type StaffUserInput = z.infer<typeof staffUserSchema>;

// Schema สำหรับ Login
export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณาระบุรหัสผ่าน"),
});

export type LoginInput = z.infer<typeof loginSchema>;
