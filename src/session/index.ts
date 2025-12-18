// src/session/index.ts
// ลบ "use server" ออก

import { User } from "@/types/user";
import { mockSession } from "@/mock/session";

export type Session = {
  token: string;
  user: User;
};

export const getSession = (): User | null => {
  if (process.env.NODE_ENV === 'development') {
    return mockSession[1].user; 
  }
  
  // ตรวจสอบว่ารันบน Browser หรือไม่ก่อนใช้ localStorage
  if (typeof window !== 'undefined') {
    const sessionData = localStorage.getItem('main_system_session');
    return sessionData ? JSON.parse(sessionData) : null;
  }
  return null;
};