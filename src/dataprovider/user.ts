import { snakeToCamel } from "@/app/utils";
import { HttpStatusCode } from "axios";

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
    const resp: HttpResponse<AllUser> = {
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
    return resp;
  }

  let resData = await res.json();

  resData.data.map((item: any, i: number) => {
    item.key = i;
  });

  const resp: HttpResponse<AllUser> = {
    status: "success",
    data: snakeToCamel(resData),
  };

  return resp;
}

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
    const resp: HttpResponse<SingleUser> = {
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
    return resp;
  }

  const resData = await res.json();

  const resp: HttpResponse<SingleUser> = {
    status: "success",
    data: snakeToCamel(resData),
  };

  return resp;
}
