declare type RoleList = {
  data: {
    id: number;
    sequence: number;
    thaiName: string;
    englishName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }[];
  page: number;
  totalPage: number;
  limit: number;
  totalCount: number;
};
