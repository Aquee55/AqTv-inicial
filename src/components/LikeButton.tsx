"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Props {
  initialLikes: number;
  streamerId?: string;
}

export default function LikeButton({ initialLikes, streamerId }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [particles, setParticles] = useState<{ id: number; x: number }[]>([]);

  const handleLike = async () => {
    setLikes((prev) => prev + 1);
    const id = Date.now();
    setParticles((p) => [...p, { id, x: Math.random() * 40 - 20 }]);
    setTimeout(() => setParticles((p) => p.filter((part) => part.id !== id)), 800);
    if (streamerId) {
      try {
        const res = await fetch("/api/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streamerId }),
        });
        const data = await res.json();
        if (typeof data.likes === "number") setLikes(data.likes);
      } catch {}
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleLike}
        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500/30 active:scale-95"
      >
        <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
        <span>{formatNumber(likes)}</span>
      </button>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, x: p.x, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute left-1/2 top-0"
          >
            <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
