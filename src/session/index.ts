"use server";
import { cookies } from "next/headers";
import { decrypt, encrypt } from "./encrypt";

export type Session = {
  token: string;
  user: any;
};

const expired = 24 * 60 * 60;

export const getSession = async (): Promise<Session | null> => {
  const cookieStore = cookies();
  const session = cookieStore.get("_pgsmcmsss");

  if (session?.value) {
    try {
      const decrypted = decrypt(session.value);
      return JSON.parse(decrypted) as Session;
    } catch {
      // Ignore invalid session
    }
  }

  return null;
};

export const setSession = async (session: Session) => {
  const cookieStore = cookies();
  const encrypted = encrypt(JSON.stringify(session));
  cookieStore.set("_pgsmcmsss", encrypted, {
    maxAge: expired,
    sameSite: "lax",
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true" ? true : false,
    httpOnly: process.env.NODE_ENV === "production",
    path: process.env.NEXT_PUBLIC_ASSET_BASE_PATH,
  });
};

export const removeSession = async () => {
  const cookieStore = cookies();
  cookieStore.delete("_pgsmcmsss");
};
