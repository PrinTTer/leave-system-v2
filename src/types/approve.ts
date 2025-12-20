// types/approve.ts

// Type สำหรับข้อมูลดิบที่มาจาก API /approvers (Snake Case)
export type ApproversRaw = {
  nontri_account: string;
  academic_position?: string | null;
  pronoun?: string;
  thai_name: string;
  department?: string;
  position?: string;
  position_approver?: string;
  level?: number[];
};

// Type มาตรฐานที่ใช้ใน Component เพื่อความง่าย (เลือกใช้อย่างใดอย่างหนึ่งให้จบ)
export type Approver = {
  nontri_account: string;
  other_prefix: string; // สำหรับแสดงผล
  fullname: string;    // สำหรับแสดงผล
  position: string;
  approve_position?: string; 
  department: string;
};

export type RequesterDetail = {
  nontri_account: string;
  user: {
    other_prefix: string;
    fullname: string;
    position: string;
    department: string;
  };
  approver_order1: Approver[];
  approver_order2: Approver[];
  approver_order3: Approver[];
  approver_order4: Approver[];
};