import type { LeaveTypeConfig } from '@/types/leave';

export const leaveTypesSeed: LeaveTypeConfig[] = [
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
      { maxDaysThreshold: 20, approverChain: [
        { position: 'หัวหน้าฝ่าย', userId: '3' },
        { position: 'หัวหน้าภาค', userId: '5' },
      ]},
      { maxDaysThreshold: 30, approverChain: [
        { position: 'หัวหน้าฝ่าย', userId: '3' },
        { position: 'หัวหน้าภาค', userId: '5' },
        { position: 'คณบดี', userId: '10' },
      ]},
      { maxDaysThreshold: 45, approverChain: [
        { position: 'หัวหน้าฝ่าย', userId: '3' },
        { position: 'หัวหน้าภาค', userId: '5' },
        { position: 'คณบดี', userId: '10' },
        { position: 'อธิการบดี', userId: '12' },
      ]},
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
    documents: [
      { name: 'ใบรับรองแพทย์', fileType: 'pdf', required: true },
    ],
    approvers: [
      { position: 'หัวหน้าฝ่าย', userId: '3' },
      { position: 'หัวหน้าภาค', userId: '5' },
      { position: 'คณบดี', userId: '10' },
      { position: 'อธิการบดี', userId: '12' },
    ],
    approvalRules: [
      { maxDaysThreshold: 30, approverChain: [{ position: 'หัวหน้าฝ่าย', userId: '3' }] },
      { maxDaysThreshold: 40, approverChain: [
        { position: 'หัวหน้าฝ่าย', userId: '3' },
        { position: 'หัวหน้าภาค', userId: '5' },
      ]},
      { maxDaysThreshold: 60, approverChain: [
        { position: 'หัวหน้าฝ่าย', userId: '3' },
        { position: 'หัวหน้าภาค', userId: '5' },
        { position: 'คณบดี', userId: '10' },
      ]},
      { maxDaysThreshold: 120, approverChain: [
        { position: 'หัวหน้าฝ่าย', userId: '3' },
        { position: 'หัวหน้าภาค', userId: '5' },
        { position: 'คณบดี', userId: '10' },
        { position: 'อธิการบดี', userId: '12' },
      ]},
    ],
    createdAt: '2025-08-20T08:00:00Z',
    updatedAt: '2025-08-20T08:00:00Z',
  },
];