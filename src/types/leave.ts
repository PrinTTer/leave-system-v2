// '@/types/leave'

export type GenderCode = 'male' | 'female' | 'other';

// (คงไว้เพื่อ backward-compat ถ้ายังมีที่อ้างถึง)
export type ApproverConfig = {
  position: string; // eg. 'อาจารย์', 'หัวหน้าภาควิชา', 'คณบดี', 'อธิการบดี'
  // userId?: string;   // แบบใหม่ "ไม่ใช้ userId"
};

export type DocumentRequirement = {
  name: string;                         // ชื่อเอกสาร เช่น ใบรับรองแพทย์
  fileType: 'pdf' | 'image' | 'doc' | 'other';
  required: boolean;
};

/** แบบใหม่: หนึ่ง "ลำดับ" อนุมัติ = 1 step, ภายใน step ใส่ได้หลายตำแหน่ง */
export type ApproverPositionsStep = { positions: string[] };

/** แบบใหม่: chain ของแต่ละ rule = อาร์เรย์ของ step */
export type ApprovalRule = {
  maxDaysThreshold: number;                 // เงื่อนไข "จำนวนวันลาต่ำกว่า X วัน"
  approverChain: ApproverPositionsStep[];   // ใช้ step ไม่ใช่ user อีกต่อไป
};

export type LeaveTypeConfig = {
  id: string;                   // uuid-like string
  name: string;                 // ชื่อประเภทการลา
  maxDays: number;              // จำนวนวันลาสูงสุด
  allowedGenders: GenderCode[]; // ว่าง/ครบ3 = ทุกเพศ
  minServiceYears: number;      // อายุราชการขั้นต่ำ (ปี)
  workingDaysOnly: boolean;     // นับเฉพาะวันทำการหรือไม่
  documents: DocumentRequirement[];

  /** แบบใหม่: ลำดับผู้อนุมัติเป็น step (หนึ่งลำดับมีหลายตำแหน่งได้) */
  approverPositions?: ApproverPositionsStep[];

  /** แบบใหม่: อ้างอิง step ใน chain */
  approvalRules?: ApprovalRule[];

  createdAt: string;            // ISO
  updatedAt: string;            // ISO
};

// Helpers
export const genderLabel = (g: GenderCode) =>
  g === 'male' ? 'ชาย' : g === 'female' ? 'หญิง' : 'อื่นๆ';
