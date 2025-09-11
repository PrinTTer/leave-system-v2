declare type SystemList = {
  data: {
    id: number;
    thaiName: string;
    englishName: string;
    shortName: string;
    description: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
  }[];
  page: number;
  totalPage: number;
  limit: number;
  totalCount: number;
};

declare type RoleSystemAccessList = {
  data: {
    id: number;
    thaiName: string;
    englishName: string;
    iconName: string;
    link: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
  }[];
  page: number;
  totalPage: number;
  limit: number;
  totalCount: number;
};
