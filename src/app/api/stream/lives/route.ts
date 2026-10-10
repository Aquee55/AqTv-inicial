import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlaybackUrl } from "@/lib/cloudflare/stream";

export async function GET() {
  const lives = db.listLiveStreamers().map((s) => ({
    id: s.id,
    title: s.liveTitle || "Ao vivo",
    category: s.liveCategory || "Just Chatting",
    streamer: {
      id: s.id,
      name: s.name,
      username: s.username,
      image:
        s.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=7c3aed&color=fff`,
    },
    viewers: s.viewers,
    likes: s.likes,
    startedAt: s.liveStartedAt,
    playbackUrl: s.cloudflareLiveInputId
      ? getPlaybackUrl(s.cloudflareLiveInputId)
      : null,
    thumbnail:
      s.cover ||
      s.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(s.liveTitle || s.name)}&size=640&background=18181b&color=a78bfa`,
    isLive: true,
  }));

  return NextResponse.json(lives);
}
