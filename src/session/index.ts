"use server";

import { cookies } from "next/headers";
import { encrypt, decrypt } from "./encrypt";

// --- กำหนด type ของ user แทน any ---
export interface User {
  id: number;
  uid: string;
  email: string;
  role: string;
  username: string;
  firstname: string;
  lastname: string;
  phone: string;
  registeredAt: string;
  // เพิ่ม fields ตามที่คุณเก็บใน session
}

// --- Session type ---
export type Session = {
  token: string;
  user: User;
};

const expired = 24 * 60 * 60; // 24 ชั่วโมง

// --- อ่าน session จาก cookie ---
export const getSession = async (): Promise<Session | null> => {
  const cookieStore = await cookies(); // await เพราะ cookies() คืนค่า Promise
  const sessionCookie = cookieStore.get("_pgsmcmsss");

  if (sessionCookie?.value) {
    try {
      const decrypted = decrypt(sessionCookie.value);
      return JSON.parse(decrypted) as Session;
    } catch {
      // invalid session
    }
  }

  return null;
};

// --- เซ็ต session ---
export const setSession = async (session: Session) => {
  const cookieStore = await cookies();
  const encrypted = encrypt(JSON.stringify(session));

  cookieStore.set({
    name: "_pgsmcmsss",
    value: encrypted,
    maxAge: expired,
    sameSite: "lax",
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
    httpOnly: process.env.NODE_ENV === "production",
    path: process.env.NEXT_PUBLIC_ASSET_BASE_PATH || "/",
  });
};

// --- ลบ session ---
export const removeSession = async () => {
  const cookieStore = await cookies();

  cookieStore.delete({
    name: "_pgsmcmsss",
    path: process.env.NEXT_PUBLIC_ASSET_BASE_PATH || "/",
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
    sameSite: "lax",
  });
};

