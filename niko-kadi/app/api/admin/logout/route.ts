import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/admin/session";

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}
