// src/app/contexts/userContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode, FC, useEffect } from "react";
import { User } from "@/types/user"; // ใช้ User type ตัวหลักที่เรามี
import { getSession } from "@/session";

// ปรับ Type Role ให้สอดคล้องกับ Logic ของคุณ
export type AppRole = "admin" | "approver" | "user" | null;

interface UserContextType {
  user: User | null;
  appRole: AppRole; // Role ที่เลือกอยู่ปัจจุบัน
  setUserDetails: (user: User) => void;
  setAppRole: (role: AppRole) => void; // เพิ่มฟังก์ชันนี้เพื่อสลับ Role
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  appRole: null,
  setUserDetails: () => {},
  setAppRole: () => {},
  logout: () => {},
});

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<AppRole>(null);

// ฟังก์ชันคำนวณ Role เริ่มต้น (คนที่มีหลาย Role จะได้ Role สูงสุดก่อน)
  const getDefaultRole = (u: User): AppRole => {
    const names = u.role?.map(r => r.thai_name) || [];
    if (names.includes('ผู้ดูแลระบบ')) return "admin";
    if (names.some(n => n.startsWith('ผู้อนุมัติ'))) return "approver";
    return "user";
  };

  const setUserDetails = (userDetails: User) => {
    setUser(userDetails);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("main_system_session"); // ล้างข้อมูลจริงถ้ามี
  };

useEffect(() => {
    const sessionUser = getSession();
    if (sessionUser) {
      setUser(sessionUser);
      setActiveRole(getDefaultRole(sessionUser)); // ตั้งค่าเริ่มต้น
    }
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      appRole: activeRole, // ส่ง Role ที่คำนวณแล้วออกไป
      setUserDetails, 
      setAppRole: (r) => setActiveRole(r),
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);