// src/types/leave.ts
export type LeaveTypeDocument = {
  leave_type_document_id?: number;
  leave_type_id?: number;
  name: string;
  file_type: 'pdf' | 'png' | 'doc' | 'jpg' | string;
  is_required: boolean;
};

export type LeaveApprovalRule = {
  leave_approval_rule_id?: number;
  leave_type_id?: number;
  leave_less_than: number;
  approval_level: number;
};

export type VacationRule = {
  vacation_rule_id?: number;
  leave_type_id?: number;
  service_year: number;
  annual_leave: number;
  max_leave: number;
};

export type VacationPerYear = {
    service_year: number;
  annual_leave: number;
}

export type CarryOver = {
    service_year: number;
  max_leave: number;
}

export type LeaveTypeApiItem = {
  leave_type_id?: number;
  name: string;
  gender: 'male' | 'female' | 'all' | string;
  is_count_vacation: boolean;
  service_year: number;
  number_approver: number;
  max_leave: number;
  category: 'general' | 'vacation' | 'officialduty' | string;
  update_at?: string;
  create_at?: string;
  leave_type_document?: LeaveTypeDocument[];
  leave_approval_rule?: LeaveApprovalRule[];
  vacation_rule?: VacationRule[];

  vacation_per_year?: VacationPerYear[];
  carry_over?: CarryOver[];
};

// helper to display gender label (keeps backend values)
export const genderLabelFromBackend = (g: string) =>
  g === 'male' ? 'ชาย' : g === 'female' ? 'หญิง' : 'ทุกเพศ';
