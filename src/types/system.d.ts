declare type SystemList = {
  data: {
    id: number;
    user: {
      id: number;
      pronuon: string;
      thaiName: string;
      englishName: string;
      department: string;
      position: string;
    };
    leaveCategory: string;
    leaveGeneral: {
      id: number;
      leaveType: string;
      des: string;
      file: string | null;
      startDate: string;
      endDate: string;
    }[] | null;
    leaveOfficial: {
      id: number;
      leaveType?: string; // Optional for consistency
      des: string;
      file: string | null;
      followers?: {
        id: number;
        pronuon: string;
        thaiName: string;
        englishName: string;
        department: string;
        position: string;
      }[];
      startDate: string;
      endDate: string;
    }[] | null;
    leaveOverseas: {
      id: number;
      country: string;
      des: string;
      file: string | null;
      follower?: {
        id: number;
        pronuon: string;
        thaiName: string;
        englishName: string;
        department: string;
        position: string;
      }[];
      startDate: string;
      endDate: string;
    }[] | null;
    status: string;
    updatedAt: number;
    createdAt: number;
  }[];
  page: number;
  totalPage: number;
  limit: number;
  totalCount: number;
};

declare type leaveGeneral = {
  id: number;
  leaveType: string;
  des: string;
  file: string | null;
  startDate: string;
  endDate: string;
}[];

declare type leaveOfficial = {
  id: number;
  des: string;
  file: string | null;
  follower: users,
  startDate: string;
  endDate: string;
}[];

declare type leaveOverseas = {
  id: number;
  country: string;
  des: string;
  file: string | null;
  startDate: string;
  endDate: string;
}[];

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
