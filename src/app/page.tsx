// src/app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/userContext";
import { Spin } from "antd";

export default function Home() {
  const router = useRouter();
  const { user, appRole } = useUser();

  useEffect(() => {
    // ถ้ายังไม่มีข้อมูล User (เช่น กำลังโหลด) ให้รอ
    if (!user || !appRole) return;

    // เช็คตาม appRole ที่คำนวณมาจาก Context
    switch (appRole) {
      case "admin":
        router.push("/private/calendar");
        break;
      case "approver":
      case "user":
        router.push("/private");
        break;
      default:
        // กรณีไม่มีสิทธิ์เลย อาจจะส่งไปหน้า 403 หรือ Error
        router.push("/private/calendar");
        console.error("No valid role found");
        break;
    }
  }, [router, user, appRole]);

  return (
  <div style={{ textAlign: 'center', padding: 16 }}>
    <Spin />
  </div>
  );
}