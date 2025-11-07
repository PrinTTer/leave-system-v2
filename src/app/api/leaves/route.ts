/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  requester: { userId: number; name: string; department?: string };
  leaveType: "business" | "personal" | "vacation";
  dates: string[];
  reason?: string;
  assistants?: string[];
  expenses?: any[];
  status?: "DRAFT" | "PENDING";
  fiscalYear?: number;
};

function thaiFiscalYearFrom(dateISO: string) {
  const d = new Date(dateISO);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return m >= 10 ? y + 544 : y + 543;
}

export async function GET() {
  // ใช้ตรวจว่ามีไฟล์อะไรใน STORAGE_ROOT แล้วบ้าง
  const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";
  const base = path.join(STORAGE_ROOT, "leaves");
  const result: any = { STORAGE_ROOT, exists: fssync.existsSync(base), items: [] as any[] };

  if (!fssync.existsSync(base)) {
    return NextResponse.json(result);
  }
  // list โครงสร้าง: /leaves/<fy>/<userId>/<requestId>/v1.json
  const fyears = fssync.readdirSync(base, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  for (const fy of fyears) {
    const fyDir = path.join(base, fy);
    const users = fssync.readdirSync(fyDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    for (const uid of users) {
      const uDir = path.join(fyDir, uid);
      const reqIds = fssync.readdirSync(uDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
      for (const rid of reqIds) {
        const j = path.join(uDir, rid, "v1.json");
        result.items.push({ fy, userId: uid, requestId: rid, path: j, exists: fssync.existsSync(j) });
      }
    }
  }
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";
    console.log("[/api/leaves] STORAGE_ROOT:", STORAGE_ROOT);
    console.log("[/api/leaves] incoming:", {
      requester: body?.requester?.userId,
      leaveType: body?.leaveType,
      datesLen: body?.dates?.length,
      status: body?.status,
    });

    if (!body?.requester?.userId || !body?.leaveType || !Array.isArray(body?.dates) || body.dates.length === 0) {
      return NextResponse.json({ message: "invalid payload" }, { status: 400 });
    }

    const dates = [...new Set(body.dates)].sort();
    const start = dates[0];
    const end = dates[dates.length - 1];
    const fiscalYear = body.fiscalYear ?? thaiFiscalYearFrom(start);

    const snapshot = {
      version: 1,
      request: {
        requestId: "",
        fiscalYear,
        leaveType: body.leaveType,
        requester: body.requester,
        period: { start, end, days: dates.length },
        dates,
        reason: body.reason ?? "",
        assistants: body.assistants ?? [],
        expenses: body.expenses ?? [],
      },
      policyCalc: {
        workingDays: dates.filter((v) => {
          const d = new Date(v).getDay();
          return d >= 1 && d <= 5;
        }).length,
        holidaysSkipped: 0,
        vacationBalanceCounted: body.leaveType === "vacation",
      },
      approval: { finalStatus: body.status ?? "DRAFT", finalAt: null as string | null },
      audit: { createdAt: new Date().toISOString() },
    };

    const requestId = `LV-${fiscalYear}-${Math.floor(10000 + Math.random() * 90000)}`;
    snapshot.request.requestId = requestId;

    const dir = path.join(
      STORAGE_ROOT,
      "leaves",
      String(fiscalYear),
      String(body.requester.userId),
      requestId
    );
    await fs.mkdir(dir, { recursive: true });

    const fullPath = path.join(dir, "v1.json");
    const raw = Buffer.from(JSON.stringify(snapshot, null, 2));
    const sha256 = crypto.createHash("sha256").update(raw).digest("hex");
    await fs.writeFile(fullPath, raw);

    console.log("[/api/leaves] written:", fullPath, "bytes:", raw.length, "sha256:", sha256);

    return NextResponse.json({
      ok: true,
      requestId,
      path: fullPath,
      sha256,
      size: raw.length,
      fiscalYear,
      status: snapshot.approval.finalStatus,
    });
  } catch (e: any) {
    console.error("[/api/leaves] error:", e);
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
