export enum Gender {
  MALE = "male",
  FEMALE = "female",
  ALL = "all",
}

export enum LeaveCategory {
  GENERAL = "general",
  VACATION = "vacation",
  OFFICIALDUTY = "officialduty",
}

export interface LeaveType {
  leave_type_id: number;
  name: string;
  gender: Gender;
  is_count_vacation: boolean;
  service_year: number;
  number_approver: number;
  category: LeaveCategory;
  max_leave?: number;
}
