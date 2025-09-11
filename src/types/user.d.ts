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
