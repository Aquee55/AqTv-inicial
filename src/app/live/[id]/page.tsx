"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LivePlayer from "@/components/LivePlayer";
import LikeButton from "@/components/LikeButton";
import Chat from "@/components/Chat";
import { formatViewers } from "@/lib/utils";
import { Users, UserPlus } from "lucide-react";

interface LiveData {
  id: string;
  title: string;
  category: string;
  streamer: { id: string; name: string; username: string; image: string };
  viewers: number;
  likes: number;
  playbackUrl?: string | null;
  isLive: boolean;
}

export default function LivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stream, setStream] = useState<LiveData | null>(null);
  const [following, setFollowing] = useState(false);
  const [mode, setMode] = useState<"live" | "vod" | "idle">("idle");
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/schedule/now?streamerId=${id}`);
        const data = await res.json();

        if (data.mode === "live" && data.streamer) {
          setMode("live");
          setStream({
            id: data.streamer.id,
            title: data.streamer.liveTitle || "Ao vivo",
            category: data.streamer.liveCategory || "Just Chatting",
            streamer: {
              id: data.streamer.id,
              name: data.streamer.name,
              username: data.streamer.username,
              image: data.streamer.image || "https://picsum.photos/seed/default/48",
            },
            viewers: data.streamer.viewers || 0,
            likes: data.streamer.likes || 0,
            playbackUrl: data.playbackUrl,
            isLive: true,
          });
        } else if (data.mode === "vod") {
          setMode("vod");
          setYoutubeId(data.youtubeId);
          setStream({
            id,
            title: data.video?.title || "Programação",
            category: "Programação",
            streamer: {
              id,
              name: "AqTv",
              username: "aqtv",
              image: "https://picsum.photos/seed/aqtv/200",
            },
            viewers: 0,
            likes: 0,
            isLive: false,
          });
        } else {
          // fallback: lista de lives
          const livesRes = await fetch("/api/stream/lives");
          const lives = await livesRes.json();
          const found = Array.isArray(lives) ? lives.find((l: any) => l.id === id) : null;
          if (found) {
            setMode("live");
            setStream(found);
          } else {
            setMode("idle");
            setStream(null);
          }
        }
      } catch {
        setMode("idle");
      }
    };
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [id]);

  if (mode === "idle" && !stream) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <p className="text-white/50">Nenhuma transmissão ou programação ativa.</p>
        <Link href="/studio" className="text-purple-400 hover:underline">
          Ir para o Studio →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {mode === "vod" && youtubeId ? (
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title={stream?.title || ""}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <LivePlayer
              title={stream?.title || ""}
              isLive={mode === "live"}
              playbackUrl={stream?.playbackUrl || undefined}
            />
          )}

          {stream && (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Link href={`/perfil/${stream.streamer.username}`}>
                  <Image
                    src={stream.streamer.image}
                    alt={stream.streamer.name}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-purple-500"
                  />
                </Link>
                <div>
                  <h1 className="text-lg font-bold text-white">{stream.title}</h1>
                  <Link
                    href={`/perfil/${stream.streamer.username}`}
                    className="text-sm text-white/70 hover:text-purple-300"
                  >
                    {stream.streamer.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/50">
                    {mode === "live" && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {formatViewers(stream.viewers)} assistindo
                      </span>
                    )}
                    <span>{stream.category}</span>
                    {mode === "vod" && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">PROGRAMAÇÃO</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <LikeButton initialLikes={stream.likes} streamerId={id} />
                <button
                  onClick={() => setFollowing(!following)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    following
                      ? "bg-white/10 text-white"
                      : "bg-purple-600 text-white hover:bg-purple-500"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  {following ? "Seguindo" : "Seguir"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-[480px] lg:h-auto lg:min-h-[520px]">
          <Chat streamerId={id} />
        </div>
      </div>
    </div>
  );
}
