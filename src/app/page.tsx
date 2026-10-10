"use client";

import { useEffect, useState } from "react";
import LiveCard from "@/components/LiveCard";
import { motion } from "framer-motion";

interface LiveItem {
  id: string;
  title: string;
  category: string;
  streamer: { id: string; name: string; username: string; image: string };
  viewers: number;
  likes: number;
  thumbnail: string;
  isLive: boolean;
  playbackUrl?: string;
}

export default function HomePage() {
  const [mode, setMode] = useState<"grid" | "foryou">("grid");
  const [lives, setLives] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stream/lives");
        const data = await res.json();
        setLives(Array.isArray(data) ? data : []);
      } catch {
        setLives([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ao Vivo agora</h1>
          <p className="text-sm text-white/50">
            {loading ? "Carregando..." : `${lives.length} live${lives.length !== 1 ? "s" : ""} acontecendo`}
          </p>
        </div>
        <div className="flex rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setMode("grid")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              mode === "grid" ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Grade
          </button>
          <button
            onClick={() => setMode("foryou")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              mode === "foryou" ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            For You
          </button>
        </div>
      </div>

      {!loading && lives.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-white/50">Nenhuma live no momento.</p>
          <p className="mt-1 text-sm text-white/30">
            Vá no <a href="/studio" className="text-purple-400 hover:underline">Studio</a> e clique em Transmitir.
          </p>
        </div>
      )}

      {mode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lives.map((stream) => (
            <LiveCard
              key={stream.id}
              stream={{
                id: stream.id,
                title: stream.title,
                streamer: {
                  id: stream.streamer.id,
                  name: stream.streamer.name,
                  username: stream.streamer.username,
                  image: stream.streamer.image,
                  followers: 0,
                  following: 0,
                },
                thumbnail: stream.thumbnail,
                viewers: stream.viewers,
                category: stream.category,
                tags: [],
                isLive: true,
                likes: stream.likes,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {lives.map((stream, i) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="live-pulse rounded-2xl"
            >
              <LiveCard
                stream={{
                  id: stream.id,
                  title: stream.title,
                  streamer: {
                    id: stream.streamer.id,
                    name: stream.streamer.name,
                    username: stream.streamer.username,
                    image: stream.streamer.image,
                    followers: 0,
                    following: 0,
                  },
                  thumbnail: stream.thumbnail,
                  viewers: stream.viewers,
                  category: stream.category,
                  tags: [],
                  isLive: true,
                  likes: stream.likes,
                }}
                large
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
