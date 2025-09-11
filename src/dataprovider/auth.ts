import { HttpStatusCode } from "axios";

export async function getLoginToken(body: {
  username: string;
  password: string;
}): Promise<HttpResponse<Token>> {
  const formData = new FormData();
  formData.append("username", body.username);
  formData.append("password", body.password);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ASSET_BASE_PATH}/api/auth`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (res.status !== HttpStatusCode.Ok) {
    const resp: HttpResponse<Token> = {
      status: "fail",
      errorMsg: "Unable to login! Please try again.",
      data: { accessToken: "" },
    };
    return resp;
  }

  const resData = await res.json();

  const resp: HttpResponse<Token> = {
    status: "success",
    data: { accessToken: resData.accessToken },
  };

  return resp;
}

export async function getProfile(): Promise<HttpResponse<Person>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ASSET_BASE_PATH}/api/auth`,
    {
      method: "GET",
    }
  );

  if (res.status !== HttpStatusCode.Ok) {
    const resp: HttpResponse<Person> = {
      status: "fail",
      errorMsg: "Unable to profile! Please try again.",
      data: {
        uid: "",
        username: "",
        firstname: "",
        lastname: "",
        role: "",
        email: "",
      },
    };
    return resp;
  }

  const resData = await res.json();

  const objs: Person = {
    uid: resData.uid,
    username: resData.username,
    firstname: resData.firstname,
    lastname: resData.lastname,
    role: resData.role,
    email: resData.email,
  };

  const resp: HttpResponse<Person> = {
    status: "success",
    data: objs,
  };

  return resp;
}
