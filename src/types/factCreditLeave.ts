import { LeaveType } from "./leaveType";

export interface FactCreditLeaveInfo {
  nontri_account: string;
  leave_type_id: number;
  annual_leave: number;
  used_leave: number;
  left_leave: number;
  leave_type: LeaveType;
}
