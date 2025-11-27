declare type Approver = {
  id: number;
  academicPosition?: string | null;
  pronoun?: string;
  thaiName: string;
  englishName?: string;
  department?: string;
  position?: string;
  positionApprover?: string;
  updatedAt?: string;
  createdAt?: string;
  level?: number[];
};

declare type ApproverList = {
  data: Approver[];
  page: number;
  totalPage: number;
  limit: number;
  totalCount: number;
};
