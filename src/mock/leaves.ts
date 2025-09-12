import type { LeaveItem } from '@/types/calendar';

// สร้างข้อมูลให้ครอบคลุมสถานะ/ช่วงวัน/ผู้ใช้ที่หลากหลาย
export const leavesMock: LeaveItem[] = [
  { id: 'lv-001', userId: '1',  type: 'personal', status: 'approved', startDate: '2025-09-10', endDate: '2025-09-12' },
  { id: 'lv-002', userId: '2',  type: 'sick',     status: 'approved', startDate: '2025-09-11', endDate: '2025-09-11' },
  { id: 'lv-003', userId: '3',  type: 'vacation', status: 'pending',  startDate: '2025-09-15', endDate: '2025-09-18' },
  { id: 'lv-004', userId: '4',  type: 'work',     status: 'approved', startDate: '2025-09-20', endDate: '2025-09-22' },
  { id: 'lv-005', userId: '5',  type: 'sick',     status: 'rejected', startDate: '2025-09-05', endDate: '2025-09-05' },
  { id: 'lv-006', userId: '6',  type: 'personal', status: 'approved', startDate: '2025-10-01', endDate: '2025-10-03' },
  { id: 'lv-007', userId: '7',  type: 'vacation', status: 'approved', startDate: '2025-10-10', endDate: '2025-10-14' },
  { id: 'lv-008', userId: '8',  type: 'work',     status: 'pending',  startDate: '2025-10-12', endDate: '2025-10-13' },
  { id: 'lv-009', userId: '9',  type: 'personal', status: 'approved', startDate: '2025-10-20', endDate: '2025-10-21' },
  { id: 'lv-010', userId: '10', type: 'vacation', status: 'approved', startDate: '2025-11-02', endDate: '2025-11-06' },
  { id: 'lv-011', userId: '1',  type: 'personal', status: 'approved', startDate: '2025-01-15', endDate: '2025-01-16' },
  { id: 'lv-012', userId: '2',  type: 'sick',     status: 'approved', startDate: '2025-02-05', endDate: '2025-02-06' },
  { id: 'lv-013', userId: '3',  type: 'vacation', status: 'approved', startDate: '2025-03-10', endDate: '2025-03-14' },
  { id: 'lv-014', userId: '4',  type: 'work',     status: 'approved', startDate: '2025-04-20', endDate: '2025-04-22' },
  { id: 'lv-015', userId: '5',  type: 'personal', status: 'approved', startDate: '2025-05-01', endDate: '2025-05-03' },
  { id: 'lv-016', userId: '6',  type: 'sick',     status: 'approved', startDate: '2025-06-18', endDate: '2025-06-18' },
  { id: 'lv-017', userId: '7',  type: 'vacation', status: 'approved', startDate: '2025-07-05', endDate: '2025-07-09' },
  { id: 'lv-018', userId: '8',  type: 'work',     status: 'approved', startDate: '2025-08-22', endDate: '2025-08-23' },
  { id: 'lv-019', userId: '9',  type: 'personal', status: 'approved', startDate: '2025-09-12', endDate: '2025-09-14' },
  { id: 'lv-020', userId: '10', type: 'vacation', status: 'approved', startDate: '2025-10-02', endDate: '2025-10-06' },
  { id: 'lv-021', userId: '11', type: 'work',     status: 'approved', startDate: '2025-11-11', endDate: '2025-11-12' },
  { id: 'lv-022', userId: '12', type: 'personal', status: 'approved', startDate: '2025-12-20', endDate: '2025-12-24' },
];
