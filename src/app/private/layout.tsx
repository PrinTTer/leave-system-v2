"use client";

import { useUser } from "@/app/contexts/userContext";
import PersonnelAdminLayout from "@/app/components/sidebar/sidebar-admin";
import PersonnelApproverLayout from "@/app/components/sidebar/sidebar-approver";
import PersonnelUserLayout from "@/app/components/sidebar/sidebar-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserLayout from "../components/sidebar/sidebar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, appRole } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    switch (appRole) {
      case "admin":
        router.push("/private/calendar");
        break;
      case "approver":
      case "user":
        router.push("/private");
        break;
      default:
        router.push("/private/calendar");
    }
  }, [user, appRole, router]);

  let Sidebar;
  switch (appRole) {
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
      Sidebar = <UserLayout>{children}</UserLayout>;
  }

  return (
    <div className="flex">
      {Sidebar}
      {/* <main className="flex-1">{children}</main> */}
    </div>
  );
}
