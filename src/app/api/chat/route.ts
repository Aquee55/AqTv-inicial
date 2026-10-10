import { NextRequest, NextResponse } from "next/server";
import { db, filterBadWords } from "@/lib/db";

export async function GET(req: NextRequest) {
  const streamerId = req.nextUrl.searchParams.get("streamerId");
  if (!streamerId) {
    return NextResponse.json({ error: "streamerId obrigatório" }, { status: 400 });
  }
  return NextResponse.json(db.getChat(streamerId));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const streamerId = String(body.streamerId || "");
    const text = String(body.text || "").trim().slice(0, 300);
    if (!streamerId || !text) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const msg = db.addChatMessage({
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      streamerId,
      userId: String(body.userId || "anon"),
      userName: String(body.userName || "Anônimo").slice(0, 40),
      userImage: body.userImage,
      text: filterBadWords(text),
      createdAt: new Date().toISOString(),
      replyToId: body.replyToId,
      replyToName: body.replyToName,
      replyToText: body.replyToText,
    });

    return NextResponse.json(msg);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
