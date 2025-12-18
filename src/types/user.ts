export interface User {
  id: number;
  uid: string;
  thai_name: string;
  thai_surname: string;
  nontri_account: string;
  other_prefix: string | null;
  prefix: string;
  fullname: string;
  gender: string;
  position: string;
  faculty: string;
  department: string;
  employment_start_date: string;
  approve_position?: string;
  role: Role[];
}

export interface Role {
  role_id: number;
  thai_name: string;
  priority: number;
  visibility: string;
}

export interface UserList {
  nontri_account: string;
  other_prefix: string | null;
  prefix: string;
  fullname: string;
  gender: string;
  position: string;
  faculty: string;
  department: string;
  employment_start_date: string;
}
