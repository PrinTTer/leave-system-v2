/* eslint-disable @typescript-eslint/no-explicit-any */
export type CreateLeavePayload = {
  requester: { userId: number; name: string; department?: string };
  leaveType: "business" | "personal" | "vacation";
  dates: string[];
  reason: string;
  assistants: string[];
  expenses: any[];
  status: "DRAFT" | "PENDING";
  fiscalYear?: number;
};

export async function createLeaveSnapshot(payload: CreateLeavePayload) {
  console.debug("[createLeaveSnapshot] payload:", payload);
  const res = await fetch("/api/leaves", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.debug("[createLeaveSnapshot] error:", err);
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  console.debug("[createLeaveSnapshot] success:", data);
  return data;
}

export async function listLeaves() {
  const res = await fetch("/api/leaves", { method: "GET" });
  return res.json();
}
