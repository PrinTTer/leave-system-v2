"use server";
import { getSession } from "@/session";
import axios, { AxiosRequestConfig } from "axios";
// import { getSession } from "@/session";

export async function request(request: AxiosRequestConfig) {
  const session = await getSession();
  const token = session?.token;

  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios.defaults.headers["Authorization"] = `Bearer ${token}`;
  axios.defaults.withCredentials = true;

  return await axios(request);
}
