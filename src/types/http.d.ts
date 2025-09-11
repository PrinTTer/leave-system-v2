declare type HttpResponse<T> = {
  status: "success" | "fail";
  data: T;
  errorMsg?: string;
};
