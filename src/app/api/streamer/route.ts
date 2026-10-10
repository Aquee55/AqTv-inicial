import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const username = req.nextUrl.searchParams.get("username");
  if (id) {
    const s = db.getStreamer(id);
    return s
      ? NextResponse.json(s)
      : NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (username) {
    const s = db.getStreamerByUsername(username);
    return s
      ? NextResponse.json(s)
      : NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json(db.listAllStreamers());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    }
    const s = db.upsertStreamer({
      id,
      email: body.email,
      name: body.name,
      username: body.username || id,
      image: body.image,
      cover: body.cover,
      bio: body.bio,
      youtubeHandle: body.youtubeHandle,
      youtubeChannelId: body.youtubeChannelId,
    });
    return NextResponse.json(s);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
