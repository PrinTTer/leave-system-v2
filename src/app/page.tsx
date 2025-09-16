"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/userContext";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

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
    }
  }, [router, user]);

  return null;
}
