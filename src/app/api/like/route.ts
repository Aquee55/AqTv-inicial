import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { streamerId } = await req.json();
    if (!streamerId) {
      return NextResponse.json({ error: "streamerId obrigatório" }, { status: 400 });
    }
    const likes = db.incrementLikes(streamerId);
    return NextResponse.json({ likes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
