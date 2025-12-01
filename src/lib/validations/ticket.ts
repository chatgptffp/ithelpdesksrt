import { z } from "zod";

// Schema สำหรับการสร้าง Ticket ใหม่ (Public)
export const createTicketSchema = z.object({
  employeeCode: z
    .string()
    .length(7, "รหัสพนักงานต้องเป็นตัวเลข 7 หลัก")
    .regex(/^[0-9]{7}$/, "รหัสพนักงานต้องเป็นตัวเลข 7 หลักเท่านั้น"),
  
  fullName: z
    .string()
    .min(2, "ชื่อ-สกุลต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(120, "ชื่อ-สกุลต้องไม่เกิน 120 ตัวอักษร"),
  
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .regex(/^[0-9]{9,10}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก")
    .optional()
    .or(z.literal("")),
  
  bureau: z
    .string()
    .min(1, "กรุณาระบุสำนัก/ฝ่าย"),
  
  division: z
    .string()
    .min(1, "กรุณาระบุกอง"),
  
  department: z
    .string()
    .min(1, "กรุณาระบุแผนก/งาน"),
  
  orgUnitId: z.string().optional(),
  
  categoryId: z.string().optional(),
  
  priorityId: z.string().optional(),
  
  systemId: z.string().optional(),
  
  subject: z
    .string()
    .min(5, "หัวข้อปัญหาต้องมีอย่างน้อย 5 ตัวอักษร")
    .max(150, "หัวข้อปัญหาต้องไม่เกิน 150 ตัวอักษร"),
  
  description: z
    .string()
    .min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(4000, "รายละเอียดต้องไม่เกิน 4000 ตัวอักษร"),
  
  attachments: z.array(z.object({
    fileUrl: z.string(),
    fileName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
  })).max(5, "แนบไฟล์ได้สูงสุด 5 ไฟล์").optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

// Schema สำหรับการติดตาม Ticket
export const trackTicketSchema = z.object({
  ticketCode: z
    .string()
    .min(1, "กรุณาระบุรหัส Ticket")
    .regex(/^IT-[A-Za-z0-9]{6}$/i, "รูปแบบรหัส Ticket ไม่ถูกต้อง (ตัวอย่าง: IT-AB12CD)"),
  
  employeeCode: z
    .string()
    .length(7, "รหัสพนักงานต้องเป็นตัวเลข 7 หลัก")
    .regex(/^[0-9]{7}$/, "รหัสพนักงานต้องเป็นตัวเลข 7 หลักเท่านั้น"),
});

export type TrackTicketInput = z.infer<typeof trackTicketSchema>;

// Schema สำหรับการประเมินความพึงพอใจ
export const surveySchema = z.object({
  ticketCode: z.string(),
  employeeCode: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

export type SurveyInput = z.infer<typeof surveySchema>;

// Schema สำหรับการเพิ่ม Comment จากผู้ใช้
export const userCommentSchema = z.object({
  ticketCode: z.string(),
  employeeCode: z.string(),
  message: z
    .string()
    .min(1, "กรุณาระบุข้อความ")
    .max(2000, "ข้อความต้องไม่เกิน 2000 ตัวอักษร"),
});

export type UserCommentInput = z.infer<typeof userCommentSchema>;
