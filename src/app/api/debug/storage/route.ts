import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";
  const testDir = path.join(STORAGE_ROOT, "__debug__");
  const testFile = path.join(testDir, "ok.txt");
  try {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, `ok: ${new Date().toISOString()}`);
    return NextResponse.json({ STORAGE_ROOT, testDir, testFile, ok: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ STORAGE_ROOT, error: String(e) }, { status: 500 });
  }
}
