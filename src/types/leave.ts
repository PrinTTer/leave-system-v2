export type GenderCode = 'male' | 'female' | 'other';

export type ApproverConfig = {
  position: string; // eg. 'อาจารย์', 'หัวหน้าภาควิชา', 'คณบดี', 'อธิการบดี'
  userId: string;   // link to usersMock[].id
};

export type DocumentRequirement = {
  name: string;              // ชื่อเอกสาร เช่น ใบรับรองแพทย์
  fileType: 'pdf' | 'image' | 'doc' | 'other'; // ชนิดไฟล์หลัก
  required: boolean;         // ต้องแนบหรือไม่
};

export type ApprovalRule = {
  maxDaysThreshold: number;  // เงื่อนไข "จำนวนวันลาต่ำกว่า X วัน"
  approverChain: ApproverConfig[]; // ลำดับผู้อนุมัติสำหรับเงื่อนไขนี้
};

export type LeaveTypeConfig = {
  id: string;                   // uuid-like string
  name: string;                 // ชื่อประเภทการลา
  maxDays: number;              // จำนวนวันลาสูงสุด
  allowedGenders: GenderCode[]; // เพศที่ลาได้ (ว่าง/ครบ3 = ทุกเพศ)
  minServiceYears: number;      // อายุราชการขั้นต่ำ (ปี)
  workingDaysOnly: boolean;     // นับเฉพาะวันทำการหรือไม่
  documents: DocumentRequirement[]; // เอกสารที่ต้องแนบ
  approvers: ApproverConfig[];  // ลำดับผู้อนุมัติ default (ถ้าไม่เข้าเงื่อนไขเฉพาะ)
  approvalRules?: ApprovalRule[]; // เงื่อนไขการอนุมัติแบบไดนามิก (ไม่ใส่ก็ได้)
  createdAt: string;            // ISO
  updatedAt: string;            // ISO
};

// Helpers
export const genderLabel = (g: GenderCode) =>
  g === 'male' ? 'ชาย' : g === 'female' ? 'หญิง' : 'อื่นๆ';