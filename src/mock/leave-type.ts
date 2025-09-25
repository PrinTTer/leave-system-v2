import type { LeaveTypeConfig } from '@/types/leave';

// ---- เพิ่ม type เสริมเฉพาะ seed เพื่อรองรับกติกาลาพักผ่อนแบบยืดหยุ่น ----
type VacationRule = { minServiceYears: number; daysPerYear: number };
type CarryOverRule = { minServiceYears: number; carryOverDays: number };

// อนุญาตให้ seed มีฟิลด์เสริม โดยยังคงเป็น LeaveTypeConfig ได้
type LeaveTypeSeed = LeaveTypeConfig & {
  vacationRules?: VacationRule[];   // เงื่อนไข "วันลาพักผ่อนต่อปี" ตามอายุราชการ
  carryOverRules?: CarryOverRule[]; // เงื่อนไข "สะสมวันลาได้" ตามอายุราชการ
};

/** ตัวช่วยสั้น ๆ สำหรับสร้าง step เดี่ยวจากตำแหน่งหนึ่งชื่อ */
const step = (pos: string) => ({ positions: [pos] });

export const leaveTypesSeed: LeaveTypeSeed[] = [
  {
    id: 'lt-001',
    name: 'ลากิจส่วนตัว',
    maxDays: 45,
    allowedGenders: ['male', 'female', 'other'],
    minServiceYears: 0,
    workingDaysOnly: true,
    documents: [],
    // เดิม: approvers = [หัวหน้าฝ่าย, หัวหน้าภาค, คณบดี, อธิการบดี]
    // ใหม่: approverPositions เป็น step (หนึ่งลำดับ = 1 step)
    approverPositions: [
      step('หัวหน้าฝ่าย'),
      step('หัวหน้าภาค'),
      step('คณบดี'),
      step('อธิการบดี'),
    ],
    // เดิม: approverChain เป็นลิสต์ตำแหน่ง
    // ใหม่: approverChain เป็นลิสต์ "step"
    approvalRules: [
      { maxDaysThreshold: 15, approverChain: [step('หัวหน้าฝ่าย')] },
      { maxDaysThreshold: 20, approverChain: [step('หัวหน้าฝ่าย'), step('หัวหน้าภาค')] },
      { maxDaysThreshold: 30, approverChain: [step('หัวหน้าฝ่าย'), step('หัวหน้าภาค'), step('คณบดี')] },
      {
        maxDaysThreshold: 45,
        approverChain: [step('หัวหน้าฝ่าย'), step('หัวหน้าภาค'), step('คณบดี'), step('อธิการบดี')],
      },
    ],
    createdAt: '2025-09-01T08:00:00Z',
    updatedAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'lt-002',
    name: 'ลาป่วย',
    maxDays: 120,
    allowedGenders: ['male', 'female', 'other'],
    minServiceYears: 0,
    workingDaysOnly: true,
    documents: [{ name: 'ใบรับรองแพทย์', fileType: 'pdf', required: true }],
    approverPositions: [
      step('หัวหน้าฝ่าย'),
      step('หัวหน้าภาค'),
      step('คณบดี'),
      step('อธิการบดี'),
    ],
    approvalRules: [
      { maxDaysThreshold: 30, approverChain: [step('หัวหน้าฝ่าย')] },
      { maxDaysThreshold: 40, approverChain: [step('หัวหน้าฝ่าย'), step('หัวหน้าภาค')] },
      { maxDaysThreshold: 60, approverChain: [step('หัวหน้าฝ่าย'), step('หัวหน้าภาค'), step('คณบดี')] },
      {
        maxDaysThreshold: 120,
        approverChain: [step('หัวหน้าฝ่าย'), step('หัวหน้าภาค'), step('คณบดี'), step('อธิการบดี')],
      },
    ],
    createdAt: '2025-08-20T08:00:00Z',
    updatedAt: '2025-08-20T08:00:00Z',
  },

  // ----------------- ลาพักผ่อน -----------------
  {
    id: 'lt-003',
    name: 'ลาพักผ่อน',
    maxDays: 20, // เพดานสูงสุดต่อปี
    allowedGenders: ['male', 'female', 'other'],
    minServiceYears: 0,
    workingDaysOnly: true,
    documents: [],
    approverPositions: [
      step('หัวหน้าฝ่าย'),
      step('หัวหน้าภาค'),
      step('คณบดี'),
      step('อธิการบดี'),
    ],
    // ลาพักผ่อนใช้ vacationRules / carryOverRules แทนเงื่อนไขอนุมัติ
    approvalRules: [],
    vacationRules: [
      { minServiceYears: 1,  daysPerYear: 10 },
      { minServiceYears: 10, daysPerYear: 20 },
    ],
    carryOverRules: [
      { minServiceYears: 1,  carryOverDays: 20 },
      { minServiceYears: 10, carryOverDays: 20 },
    ],
    createdAt: '2025-09-24T08:00:00Z',
    updatedAt: '2025-09-24T08:00:00Z',
  },

  {
    id: 'lt-004',
    name: 'ลาเข้ารับการตรวจเลือก หรือเข้ารับการเตรียมพล',
    maxDays: 0, // อ้างอิงตามหนังสือเรียก (0 = ไม่กำหนดตายตัว)
    allowedGenders: ['male'], // เฉพาะเพศชาย
    minServiceYears: 1,
    workingDaysOnly: true,
    documents: [],
    approverPositions: [
      step('หัวหน้าฝ่าย'),
      step('หัวหน้าภาค'),
      step('คณบดี'),
      step('อธิการบดี'),
    ],
    approvalRules: [], // ใช้ default step เฉย ๆ
    createdAt: '2025-09-24T08:05:00Z',
    updatedAt: '2025-09-24T08:05:00Z',
  },
  {
    id: 'lt-005',
    name: 'ลาอุปสมบท',
    maxDays: 120,
    allowedGenders: ['male'], // (แก้คอมเมนต์ให้ตรง: เฉพาะชาย)
    minServiceYears: 1,
    workingDaysOnly: true,
    documents: [],
    approverPositions: [
      step('หัวหน้าฝ่าย'),
      step('หัวหน้าภาค'),
      step('คณบดี'),
      step('อธิการบดี'),
    ],
    approvalRules: [],
    createdAt: '2025-09-24T08:06:00Z',
    updatedAt: '2025-09-24T08:06:00Z',
  },
  {
    id: 'lt-006',
    name: 'ลาฮัจย์',
    maxDays: 120,
    allowedGenders: ['male', 'female', 'other'],
    minServiceYears: 1,
    workingDaysOnly: true,
    documents: [],
    approverPositions: [
      step('หัวหน้าฝ่าย'),
      step('หัวหน้าภาค'),
      step('คณบดี'),
      step('อธิการบดี'),
    ],
    approvalRules: [],
    createdAt: '2025-09-24T08:06:00Z',
    updatedAt: '2025-09-24T08:06:00Z',
  },
  {
    id: 'lt-007',
    name: 'ลาถือศีลปฏิบัติธรรม',
    maxDays: 120,
    allowedGenders: ['male', 'female', 'other'],
    minServiceYears: 1,
    workingDaysOnly: true,
    documents: [],
    approverPositions: [
      step('หัวหน้าฝ่าย'),
      step('หัวหน้าภาค'),
      step('คณบดี'),
      step('อธิการบดี'),
    ],
    approvalRules: [],
    createdAt: '2025-09-24T08:06:00Z',
    updatedAt: '2025-09-24T08:06:00Z',
  },
  {
    id: 'lt-008',
    name: 'ลาไปช่วยเหลือภริยาที่คลอดบุตร',
    maxDays: 15,
    allowedGenders: ['male'],
    minServiceYears: 1,
    workingDaysOnly: true,
    documents: [],
    approverPositions: [
      step('หัวหน้าฝ่าย'),
      step('หัวหน้าภาค'),
      step('คณบดี'),
      step('อธิการบดี'),
    ],
    approvalRules: [],
    createdAt: '2025-09-24T08:07:00Z',
    updatedAt: '2025-09-24T08:07:00Z',
  },
];
