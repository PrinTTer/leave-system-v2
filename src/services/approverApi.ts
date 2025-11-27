
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";


export async function getApproverList(): Promise<Approver[]> {
  const res = await fetch(`${API_BASE_URL}/approvers`, {
    cache: "no-store", // กัน cache ฝั่ง client ของ Next
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch approvers: ${res.status} ${res.statusText}`,
    );
  }

  const data: Approver[] = await res.json();
  return data;
}
