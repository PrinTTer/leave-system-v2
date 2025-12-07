declare type UserList = {
  data: {
    id: number;
    uid: string;
    nontriAccount: string;
    name: string;
    surname: string;
    kuMail: string;
    createdAt: string;
    updatedAt: string;
  }[];
  page: number;
  totalPage: number;
  limit: number;
  totalCount: number;
};

export interface User {
  nontri_account: string;
  other_prefix: string;
  prefix: string;
  fullname: string;
  firstName?: string;
  lastName?: string;
  gender: string;
  position: string;
  faculty: string;
  department: string;
  employment_start_date: string;
}
