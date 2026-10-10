"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Clock } from "lucide-react";
import { getOrCreateStreamerId } from "@/lib/identity";
import { useAuth } from "@/contexts/AuthContext";

interface Slot {
  id: string;
  youtubeVideoId: string;
  title: string;
  thumbnail: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export default function ProgramacaoPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [current, setCurrent] = useState<Slot | null>(null);

  const { user } = useAuth();
  useEffect(() => {
    const id = getOrCreateStreamerId(user?.uid);
    fetch(`/api/schedule?streamerId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data.filter((s: Slot) => s.enabled) : [];
        setSlots(list);
        if (list.length) setCurrent(list[0]);
      });
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-white">Programação</h1>
      <p className="mb-6 text-sm text-white/50">
        Vídeos do YouTube agendados no Studio. Fora do horário de live, a plataforma usa esta grade.
      </p>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-white/50">Nenhum vídeo agendado.</p>
          <p className="mt-1 text-sm text-white/30">
            Monte a grade em{" "}
            <a href="/studio" className="text-purple-400 hover:underline">
              /studio
            </a>
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {current && (
              <>
                <div className="aspect-video overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${current.youtubeVideoId}?rel=0`}
                    title={current.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                <h2 className="mt-3 text-lg font-semibold text-white">{current.title}</h2>
                <p className="text-sm text-white/50">
                  {current.startTime} – {current.endTime}
                </p>
              </>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">Grade</h3>
            {slots.map((video) => (
              <button
                key={video.id}
                onClick={() => setCurrent(video)}
                className={`flex w-full gap-3 rounded-xl p-2 text-left transition ${
                  current?.id === video.id
                    ? "bg-purple-600/30 ring-1 ring-purple-500"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg">
                  <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-white">{video.title}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-white/50">
                    <Clock className="h-3 w-3" />
                    {video.startTime} – {video.endTime}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
