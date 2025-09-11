declare type IconImageList = {
  data: {
    id: number;
    sequence: number;
    thaiName: string;
    englishName: string;
    pathName: string;
    createdAt: string;
    updatedAt: string;
  }[];
  page: number;
  totalPage: number;
  limit: number;
  totalCount: number;
};
