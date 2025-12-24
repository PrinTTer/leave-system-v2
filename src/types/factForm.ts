import { Dayjs } from "dayjs";
import { Attachment } from "./common";
import { LeaveType } from "./leaveType";

export interface Assistants {
  nontri_account: string;
}

export interface ExtendLeaves {
  leave_type_id: number;
  leave_dates: Date[];
  total_days: number;
}

export interface OtherExpenses {
  reason: string;
  expense: number;
}

export interface PositionExpenses {
  amount_per_person: number;
  total_person: number;
}

export interface Expenses {
  rs_allowance?: PositionExpenses;
  asst_allowance?: PositionExpenses;
  driver?: number;
  accommodation?: number;
  vehicle?: OtherExpenses;
  other?: OtherExpenses[];
  expenses_type?: string;
  attachment?: string;
}

export interface TravelDetails {
  car_brand?: string;
  license?: string;
  driver?: string;
}

export enum Status {
  Draft = "draft",
  Pending = "pending",
  Approve = "approve",
  Reject = "reject",
  Cancel = "cancel",
}

export interface FactFormInput {
  nontri_account: string;
  leave_type_id?: number;
  start_date: Date | Dayjs;
  start_type: LeaveTimeType;
  end_type?: LeaveTimeType;
  end_date: Date | Dayjs;
  total_day: number;
  fiscal_year: number;
  status?: Status;
  note?: string;
  countries?: string[];
  provinces?: string[];
  reason?: string;
  attachment?: Attachment;
  leave_aboard?: string;
}

export enum ExpensesType {
  PERSONAL_FUND = "ทุนส่วนตัว",
  DEPARTMENT_FUND = "ทุนภาควิชา",
  FACULTY_FUND = "ทุนคณะ",
}

export interface OfficialdutyFactFormInput {
  nontri_account: string;
  start_date: Date | Dayjs;
  start_type: string;
  end_type?: string;
  end_date: Date | Dayjs;
  total_day: number;
  fiscal_year: number;
  status?: Status;
  note?: string;
  assistants?: Assistants[];
  countries?: string[];
  provinces?: string[];
  reason?: string;
  extend_leaves?: ExtendLeaves[];
  expenses?: Expenses;
  travel_details?: TravelDetails;
  attachment?: Attachment;
  leave_aboard?: string;
  expenses_type?: ExpensesType;
}

export type LeaveTimeType = "full" | "am" | "pm" | "";

export interface SearchFactformDto {
  fiscal_year?: string;
  leave_type_id?: string;
  search?: string;
}

export interface FactForm {
  fact_form_id: number;
  leave_type_id: number;
  start_date: Date;
  end_date: Date;
  fiscal_year: number;
  status: Status;
  approve_date: Date;
  note: string;
  file_leave: string;
  update_at: Date;
  create_at: Date;
  nontri_account: string;
}

export interface FactFormInfo extends FactFormInput {
  fact_form_id: number;
  leave_type_id: number;
  countries: string[];
  provinces: string[];
  reason: string;
  leave_type?: LeaveType;
  leave_aboard?: string;
}

export interface LeaveHistoryInfo extends FactForm {
  leave_aboard: string;
  leave_type?: LeaveType;
  approver1: ApproverStep;
  approver2?: ApproverStep;
  approver3?: ApproverStep;
  approver4?: ApproverStep;
  remark: string;
}

export interface Approval {
  nontri_account: string;
  other_prefix: string;
  prefix: string;
  fullname: string;
  gender: string;
  position: string;
  faculty: string;
  department: string;
  employment_start_date: string;
}

export type ApproverStep = [Approval, ApproverStatus];

export interface ApproverStatus {
  status: "pending" | "approved" | "rejected";
}

export interface OfficialdutyFactformInfo extends OfficialdutyFactFormInput {
  fact_form_id: number;
  leave_type_id: number;
  leave_type?: LeaveType;
}
