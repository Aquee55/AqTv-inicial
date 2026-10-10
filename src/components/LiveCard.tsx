"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Stream } from "@/types";
import { formatViewers } from "@/lib/utils";

interface Props {
  stream: Stream;
  large?: boolean;
}

export default function LiveCard({ stream, large = false }: Props) {
  return (
    <Link href={`/live/${stream.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative overflow-hidden rounded-xl bg-[#18181b] transition-shadow hover:shadow-lg hover:shadow-purple-500/20 ${
          large ? "aspect-video" : "aspect-video"
        }`}
      >
        <Image
          src={stream.thumbnail}
          alt={stream.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* LIVE badge */}
        {stream.isLive && (
          <div className="absolute left-2 top-2 flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Ao Vivo
            </span>
          </div>
        )}

        {/* Viewers */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
          <Users className="h-3 w-3" />
          {formatViewers(stream.viewers)}
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-start gap-2">
            <Image
              src={stream.streamer.image}
              alt={stream.streamer.name}
              width={36}
              height={36}
              className="rounded-full border-2 border-purple-500"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-white">{stream.title}</h3>
              <p className="truncate text-xs text-white/70">{stream.streamer.name}</p>
              <p className="text-[11px] text-white/50">{stream.category}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
