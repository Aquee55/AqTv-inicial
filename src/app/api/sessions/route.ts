import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const streamerId = req.nextUrl.searchParams.get("streamerId");
  if (!streamerId) {
    return NextResponse.json({ error: "streamerId obrigatório" }, { status: 400 });
  }
  return NextResponse.json(db.getSessions(streamerId));
}
