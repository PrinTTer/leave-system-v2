// src/app/private/layout.tsx
"use client";

import { useUser } from "@/app/contexts/userContext";
import PersonnelAdminLayout from "@/app/components/sidebar/sidebar-admin";
import PersonnelApproverLayout from "@/app/components/sidebar/sidebar-approver";
import PersonnelUserLayout from "@/app/components/sidebar/sidebar-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();

  // redirect หน้าแรกตาม role ทุกครั้งที่ user.role เปลี่ยน
  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "admin":
        router.push("/private/calendar");
        break;
      case "approver":
      case "user":
        router.push("/private");
        break;
      default:
        router.push("/");
    }
  }, [user, router]);

  let Sidebar;
  switch (user?.role) {
    case "admin":
      Sidebar = <PersonnelAdminLayout>{children}</PersonnelAdminLayout>;
      break;
    case "approver":
      Sidebar = <PersonnelApproverLayout>{children}</PersonnelApproverLayout>
      break;
    case "user":
      Sidebar = <PersonnelUserLayout>{children}</PersonnelUserLayout>;
      break;
    default:
      Sidebar = null; // public page หรือยังไม่ login
  }

  return (
    <div className="flex">
      {Sidebar}
      <main className="flex-1">{children}</main>
    </div>
  );
}
