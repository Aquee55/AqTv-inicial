"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, LayoutDashboard } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Streamer {
  id: string;
  name: string;
  username: string;
  image?: string;
  cover?: string;
  bio?: string;
  followers: number;
  following?: number;
  isLive: boolean;
  liveTitle?: string;
}

export default function PerfilPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [user, setUser] = useState<Streamer | null>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    fetch(`/api/streamer?username=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.id) setUser(d);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [username]);

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4">
        <p className="text-white/50">Perfil não encontrado.</p>
        <p className="text-sm text-white/30">
          Transmita pelo Studio para criar seu perfil automaticamente.
        </p>
        <Link href="/studio" className="text-purple-400 hover:underline">
          Ir ao Studio
        </Link>
      </div>
    );
  }

  const avatar =
    user.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff&size=128`;

  return (
    <div>
      <div className="relative h-40 w-full bg-gradient-to-br from-purple-900/50 to-black md:h-56">
        {user.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={user.name}
              className="h-24 w-24 rounded-full border-4 border-[#0e0e10] object-cover"
            />
            {user.isLive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Ao Vivo
              </span>
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-white/50">@{user.username}</p>
            {user.bio && <p className="mt-1 max-w-lg text-sm text-white/70">{user.bio}</p>}
            <div className="mt-2 text-sm">
              <strong className="text-white">{formatNumber(user.followers)}</strong>{" "}
              <span className="text-white/50">seguidores</span>
            </div>
          </div>
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setFollowing(!following)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                following ? "bg-white/10 text-white" : "bg-purple-600 text-white hover:bg-purple-500"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              {following ? "Seguindo" : "Seguir"}
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>

        {user.isLive && (
          <div className="mt-8">
            <Link
              href={`/live/${user.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500"
            >
              Assistir live agora
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
