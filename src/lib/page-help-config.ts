export interface HelpItem {
  title: string;
  description: string;
}

export const pageHelpConfig: Record<string, HelpItem[]> = {
  // Admin Pages
  "admin-dashboard": [
    { title: "ภาพรวม", description: "แสดงสถิติ Ticket ทั้งหมด รวมถึงกราฟแสดงแนวโน้ม" },
    { title: "Ticket ล่าสุด", description: "รายการ Ticket ที่เข้ามาล่าสุด คลิกเพื่อดูรายละเอียด" },
    { title: "กราฟ", description: "แสดงข้อมูลเชิงสถิติ เช่น Ticket รายวัน, สถานะ, หมวดหมู่" },
  ],
  "admin-tickets": [
    { title: "รายการ Ticket", description: "แสดง Ticket ทั้งหมดในระบบ สามารถกรองตามสถานะได้" },
    { title: "ดูรายละเอียด", description: "คลิกที่ไอคอนตาเพื่อดูรายละเอียดและจัดการ Ticket" },
    { title: "เปลี่ยนสถานะ", description: "ในหน้ารายละเอียด สามารถเปลี่ยนสถานะ, มอบหมายงาน, เพิ่มความคิดเห็น" },
  ],
  "admin-ticket-detail": [
    { title: "ข้อมูล Ticket", description: "แสดงรายละเอียดทั้งหมดของ Ticket รวมถึงไฟล์แนบ" },
    { title: "เปลี่ยนสถานะ", description: "คลิกปุ่ม 'เปลี่ยนสถานะ' เพื่ออัปเดตสถานะ Ticket" },
    { title: "มอบหมายงาน", description: "เลือกทีมและผู้รับผิดชอบในการแก้ไขปัญหา" },
    { title: "ความคิดเห็น", description: "เพิ่มความคิดเห็นเพื่อสื่อสารกับผู้แจ้งหรือทีมงาน" },
  ],
  "admin-teams": [
    { title: "จัดการทีม", description: "สร้าง แก้ไข ลบทีมสนับสนุน" },
    { title: "สมาชิก", description: "เพิ่ม/ลบสมาชิกในทีม" },
    { title: "กฎการมอบหมาย", description: "ตั้งค่ากฎอัตโนมัติสำหรับมอบหมาย Ticket ไปยังทีม" },
  ],
  "admin-knowledge-base": [
    { title: "บทความ", description: "จัดการบทความความรู้สำหรับผู้ใช้งาน" },
    { title: "สร้างบทความ", description: "คลิก 'สร้างบทความ' เพื่อเพิ่มบทความใหม่" },
    { title: "เผยแพร่", description: "บทความที่ตั้งเป็น 'เผยแพร่' จะแสดงในหน้าสถานีความรู้" },
  ],
  "admin-templates": [
    { title: "Template ปัญหา", description: "แบบฟอร์มสำเร็จรูปสำหรับแจ้งปัญหาที่พบบ่อย" },
    { title: "สร้าง Template", description: "กำหนดหัวข้อ รายละเอียด และหมวดหมู่ล่วงหน้า" },
    { title: "การใช้งาน", description: "ผู้ใช้สามารถเลือก Template ในหน้าแจ้งปัญหาเพื่อกรอกข้อมูลอัตโนมัติ" },
  ],
  "admin-canned-responses": [
    { title: "ข้อความสำเร็จรูป", description: "ข้อความตอบกลับที่ใช้บ่อยสำหรับ Staff" },
    { title: "คัดลอก", description: "คลิกไอคอนคัดลอกเพื่อ copy ข้อความไปใช้" },
    { title: "หมวดหมู่", description: "จัดกลุ่มข้อความตามหมวดหมู่เพื่อค้นหาง่าย" },
  ],
  "admin-reports": [
    { title: "รายงาน SLA", description: "ดู Ticket ที่ค้างและเกินเวลา SLA" },
    { title: "Export Excel", description: "ดาวน์โหลดรายงาน Ticket เป็นไฟล์ Excel" },
    { title: "ตัวกรอง", description: "กรองข้อมูลตามช่วงวันที่และสถานะ" },
  ],
  "admin-sla-report": [
    { title: "เกิน SLA", description: "Ticket ที่เกินเวลาที่กำหนด (สีแดง)" },
    { title: "ใกล้เกิน", description: "Ticket ที่ใช้เวลาไป ≥75% ของ SLA (สีเหลือง)" },
    { title: "ปกติ", description: "Ticket ที่ยังอยู่ในเวลาที่กำหนด (สีเขียว)" },
  ],
  "admin-users": [
    { title: "จัดการผู้ใช้", description: "เพิ่ม แก้ไข ระงับการใช้งานของ Staff" },
    { title: "สิทธิ์", description: "กำหนด Role และสิทธิ์การเข้าถึงของผู้ใช้" },
  ],
  "admin-master-data": [
    { title: "ข้อมูลหลัก", description: "จัดการหมวดหมู่ ความเร่งด่วน ระบบ และหน่วยงาน" },
    { title: "เปิด/ปิดใช้งาน", description: "สามารถเปิด/ปิดการใช้งานข้อมูลได้โดยไม่ต้องลบ" },
  ],

  // Public Pages
  "public-report": [
    { title: "กรอกข้อมูล", description: "กรอกข้อมูลผู้แจ้งและรายละเอียดปัญหาให้ครบถ้วน" },
    { title: "Template", description: "เลือก Template เพื่อกรอกข้อมูลอัตโนมัติ (ถ้ามี)" },
    { title: "ไฟล์แนบ", description: "แนบรูปภาพหรือเอกสารประกอบได้สูงสุด 5 ไฟล์" },
    { title: "รหัส Ticket", description: "หลังส่งเรื่อง จะได้รหัส Ticket สำหรับติดตามสถานะ" },
  ],
  "public-track": [
    { title: "ติดตามสถานะ", description: "ใส่รหัส Ticket และรหัสพนักงานเพื่อดูสถานะ" },
    { title: "ประเมินความพึงพอใจ", description: "เมื่อ Ticket แก้ไขแล้ว สามารถประเมินความพึงพอใจได้" },
  ],
  "public-knowledge-base": [
    { title: "ค้นหา", description: "ค้นหาบทความจากคำค้นหาหรือเลือกหมวดหมู่" },
    { title: "บทความยอดนิยม", description: "บทความที่มีผู้เข้าชมมากที่สุด" },
  ],
};
