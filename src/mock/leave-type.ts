import type { LeaveTypeConfig } from '@/types/leave';

// ---- เพิ่ม type เสริมเฉพาะ seed เพื่อรองรับกติกาลาพักผ่อนแบบยืดหยุ่น ----
type VacationRule = { minServiceYears: number; daysPerYear: number };
type CarryOverRule = { minServiceYears: number; carryOverDays: number };

// อนุญาตให้ seed มีฟิลด์เสริม โดยยังคงเป็น LeaveTypeConfig ได้
type LeaveTypeSeed = LeaveTypeConfig & {
  vacationRules?: VacationRule[];   // เงื่อนไข "วันลาพักผ่อนต่อปี" ตามอายุราชการ
  carryOverRules?: CarryOverRule[]; // เงื่อนไข "สะสมวันลาได้" ตามอายุราชการ
};

export const leaveTypesSeed: LeaveTypeSeed[] = [
  {
    id: 'lt-001',
    name: 'ลากิจส่วนตัว',
    maxDays: 45,
    allowedGenders: ['male', 'female', 'other'],
    minServiceYears: 0,
    workingDaysOnly: true,
    documents: [],
    approvers: [
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],
    approvalRules: [
      { maxDaysThreshold: 15, approverChain: [{ position: 'หัวหน้าฝ่าย', userId: '3' }] },
      {
        maxDaysThreshold: 20,
        approverChain: [
          { position: 'หัวหน้าฝ่าย', userId: '3' },
          { position: 'หัวหน้าภาค', userId: '5' },
        ],
      },
      {
        maxDaysThreshold: 30,
        approverChain: [
          { position: 'หัวหน้าฝ่าย', userId: '3' },
          { position: 'หัวหน้าภาค', userId: '5' },
          { position: 'คณบดี', userId: '10' },
        ],
      },
      {
        maxDaysThreshold: 45,
        approverChain: [
          { position: 'หัวหน้าฝ่าย', userId: '3' },
          { position: 'หัวหน้าภาค', userId: '5' },
          { position: 'คณบดี', userId: '10' },
          { position: 'อธิการบดี', userId: '12' },
        ],
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
    approvers: [
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],
    approvalRules: [
      { maxDaysThreshold: 30, approverChain: [{ position: 'หัวหน้าฝ่าย', userId: '3' }] },
      {
        maxDaysThreshold: 40,
        approverChain: [
          { position: 'หัวหน้าฝ่าย', userId: '3' },
          { position: 'หัวหน้าภาค', userId: '5' },
        ],
      },
      {
        maxDaysThreshold: 60,
        approverChain: [
          { position: 'หัวหน้าฝ่าย', userId: '3' },
          { position: 'หัวหน้าภาค', userId: '5' },
          { position: 'คณบดี', userId: '10' },
        ],
      },
      {
        maxDaysThreshold: 120,
        approverChain: [
          { position: 'หัวหน้าฝ่าย', userId: '3' },
          { position: 'หัวหน้าภาค', userId: '5' },
          { position: 'คณบดี', userId: '10' },
          { position: 'อธิการบดี', userId: '12' },
        ],
      },
    ],
    createdAt: '2025-08-20T08:00:00Z',
    updatedAt: '2025-08-20T08:00:00Z',
  },
  {
    id: 'lt-004',
    name: 'ลาเข้ารับการตรวจเลือก หรือเข้ารับการเตรียมพล',
    maxDays: 0, // ตามหนังสือเรียก/กำหนดการ (ตั้ง 0 = ไม่จำกัดตายตัว)
    allowedGenders: ['male'],        // เฉพาะเพศชาย
    minServiceYears: 1,              // อายุราชการขั้นต่ำ 1 ปี
    workingDaysOnly: true,
    documents: [],
    approvers: [
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],
    approvalRules: [],               // ใช้ผู้อนุมัติค่าเริ่มต้น ไม่ตั้งเงื่อนไขวัน
    createdAt: '2025-09-24T08:05:00Z',
    updatedAt: '2025-09-24T08:05:00Z',
  },
  {
    id: 'lt-005',
    name: 'ลาอุปสมบท',
    maxDays: 120,                    // สิทธิสูงสุด 120 วัน
    allowedGenders: ['male'], // เปิดทุกเพศ (เผื่อกรณีฮัจย์/ปฏิบัติธรรม)
    minServiceYears: 1,              // อายุราชการขั้นต่ำ 1 ปี
    workingDaysOnly: true,
    documents: [],
    approvers: [
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],
    approvalRules: [],
    createdAt: '2025-09-24T08:06:00Z',
    updatedAt: '2025-09-24T08:06:00Z',
  },
  {
    id: 'lt-006',
    name: 'ลาฮัจย์',
    maxDays: 120,                    // สิทธิสูงสุด 120 วัน
    allowedGenders: ['male', 'female', 'other'], // เปิดทุกเพศ (เผื่อกรณีฮัจย์/ปฏิบัติธรรม)
    minServiceYears: 1,              // อายุราชการขั้นต่ำ 1 ปี
    workingDaysOnly: true,
    documents: [],
    approvers: [
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],
    approvalRules: [],
    createdAt: '2025-09-24T08:06:00Z',
    updatedAt: '2025-09-24T08:06:00Z',
  },
  {
    id: 'lt-007',
    name: 'ลาถือศีลปฏิบัติธรรม',
    maxDays: 120,                    // สิทธิสูงสุด 120 วัน
    allowedGenders: ['male', 'female', 'other'], // เปิดทุกเพศ (เผื่อกรณีฮัจย์/ปฏิบัติธรรม)
    minServiceYears: 1,              // อายุราชการขั้นต่ำ 1 ปี
    workingDaysOnly: true,
    documents: [],
    approvers: [
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],
    approvalRules: [],
    createdAt: '2025-09-24T08:06:00Z',
    updatedAt: '2025-09-24T08:06:00Z',
  },
  {
    id: 'lt-008',
    name: 'ลาไปช่วยเหลือภริยาที่คลอดบุตร',
    maxDays: 15,                     // สิทธิ 15 วัน
    allowedGenders: ['male'],        // เฉพาะเพศชาย
    minServiceYears: 1,              // อายุราชการขั้นต่ำ 1 ปี
    workingDaysOnly: true,
    documents: [],
    approvers: [
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],
    approvalRules: [],
    createdAt: '2025-09-24T08:07:00Z',
    updatedAt: '2025-09-24T08:07:00Z',
  },

  // ----------------- ลาพักผ่อน (ตามที่ขอ) -----------------
  {
    id: 'lt-003',
    name: 'ลาพักผ่อน',
    // ควรกำหนด maxDays ให้เท่ากับเพดานสูงสุดตามสิทธิต่อปี (เช่น 20)
    maxDays: 20,
    allowedGenders: ['male', 'female', 'other'],
    // ถ้าต้องการห้ามพนักงานอายุงาน <= 1 ปีลา ให้ตั้งเป็น 1
    // แต่ถ้าจะใช้กติกาใน vacationRules เป็นตัวกำหนดสิทธิ์ ให้ปล่อย 0 ไว้
    minServiceYears: 0,
    workingDaysOnly: true,
    documents: [],
    approvers: [
      // ยังคง “ผู้อนุมัติลำดับค่าเริ่มต้น” ไว้ได้ (ใช้ในส่วนอื่นของระบบ)
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],

    // เปลี่ยนจาก “เงื่อนไขของการอนุมัติ” → มาใช้กติกาวันลาต่อปีแทน
    approvalRules: [],

    // เงื่อนไขวันลาพักผ่อนต่อปี (เลือก rule ที่ serviceYears >= minServiceYears สูงสุด)
    vacationRules: [
      // อายุราชการ > 1 ปี → 10 วัน/ปี
      { minServiceYears: 1, daysPerYear: 10 },
      // อายุราชการ > 10 ปี → 20 วัน/ปี
      { minServiceYears: 10, daysPerYear: 20 },
    ],

    // เงื่อนไขการสะสมวันลา (เลือก rule ที่ serviceYears >= minServiceYears สูงสุด)
    carryOverRules: [
      // อายุราชการ > 1 ปี → สะสมได้ 20 วัน
      { minServiceYears: 1, carryOverDays: 20 },
      // อายุราชการ > 10 ปี → สะสมได้ 20 วัน
      { minServiceYears: 10, carryOverDays: 20 },
    ],

    createdAt: '2025-09-24T08:00:00Z',
    updatedAt: '2025-09-24T08:00:00Z',
  },
];
