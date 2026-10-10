"use client";

import { useState, useEffect, useRef } from "react";
import { Maximize, Volume2, VolumeX, Play, Pause } from "lucide-react";

interface Props {
  title: string;
  isLive?: boolean;
  playbackUrl?: string;
}

export default function LivePlayer({ title, isLive = true, playbackUrl }: Props) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return;
    videoRef.current.src = playbackUrl;
    if (playing) videoRef.current.play().catch(() => {});
  }, [playbackUrl, playing]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {playbackUrl ? (
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          muted={muted}
          autoPlay
          playsInline
          controls={false}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 via-black to-pink-900/30">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
            {playing ? (
              <div className="h-4 w-4 animate-pulse rounded-sm bg-red-500" />
            ) : (
              <Play className="h-8 w-8 text-white" />
            )}
          </div>
          <p className="max-w-md px-4 text-center text-sm text-white/70">
            {isLive
              ? "Aguardando sinal do OBS… Configure a chave no Studio e inicie a transmissão."
              : "Sem sinal"}
          </p>
          <p className="mt-2 text-xs text-white/40">{title}</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPlaying(!playing);
              if (videoRef.current) {
                playing ? videoRef.current.pause() : videoRef.current.play();
              }
            }}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMuted(!muted)}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Ao Vivo
            </span>
          )}
        </div>
        <button
          onClick={() => videoRef.current?.requestFullscreen?.()}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
