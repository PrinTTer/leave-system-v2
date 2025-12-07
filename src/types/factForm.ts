import { Dayjs } from "dayjs";
import { Attachment } from "./common";

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

export interface Expenses {
  rs_allowance?: number;
  asst_allowance?: number;
  driver?: number;
  accommodation?: number;
  vehicle?: OtherExpenses;
  other?: OtherExpenses;
  expenses_type?: string;
  attachment?: string;
}

export interface TravelDetails {
  car_brand: string;
  license: string;
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
  leave_type_id: number;
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
}

export type LeaveTimeType = "full" | "am" | "pm" | "";
