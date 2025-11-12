import { snakeToCamel } from "@/app/utils";
import { HttpStatusCode } from "axios";

// --- ประกาศ types ให้ TypeScript รู้จัก ---
export interface AllUserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface User {
  id: number;
  uid: string;
  email: string;
  role: string;
  password: string;
  primeNum: number;
  username: string;
  firstname: string;
  lastname: string;
  phone: string;
  registeredAt: string;
  pseudoKey: string;
  tmpSystemKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AllUser {
  data: User[];
  page: number;
  totalPage: number;
  limit: number;
  totalCount: number;
}

export type SingleUser = User;

export interface HttpResponse<T> {
  status: "success" | "fail";
  errorMsg?: string;
  data: T;
}

// --- ฟังก์ชัน getAllUser ---
export async function getAllUser(
  body: AllUserFilter
): Promise<HttpResponse<AllUser>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ASSET_BASE_PATH}/api/user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (res.status !== HttpStatusCode.Ok) {
    return {
      status: "fail",
      errorMsg: "Unable to get data! Please try again.",
      data: {
        data: [],
        page: 0,
        totalPage: 1,
        limit: 0,
        totalCount: 0,
      },
    };
  }

  const resData: AllUser = await res.json();

  // กำหนด key ให้แต่ละ item
resData.data.forEach((item, i) => {
  (item as User & { key: number }).key = i;
});

const dataWithKey = resData.data.map((item, i) => ({
  ...snakeToCamel(item),
  key: i,
}));

return {
  status: "success",
  data: { ...snakeToCamel(resData), data: dataWithKey },
};
}

// --- ฟังก์ชัน getSingleUser ---
export async function getSingleUser(
  id: string
): Promise<HttpResponse<SingleUser>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ASSET_BASE_PATH}/api/user/${id}`,
    {
      method: "GET",
    }
  );

  if (res.status !== HttpStatusCode.Ok) {
    return {
      status: "fail",
      errorMsg: "Unable to get data! Please try again.",
      data: {
        id: -1,
        uid: "",
        email: "",
        role: "",
        password: "",
        primeNum: -1,
        username: "",
        firstname: "",
        lastname: "",
        phone: "",
        registeredAt: "",
        pseudoKey: "",
        tmpSystemKey: null,
        createdAt: "",
        updatedAt: "",
      },
    };
  }

  const resData: SingleUser = await res.json();

  return {
    status: "success",
    data: snakeToCamel(resData),
  };
}