"use client";

import { useEffect, useState } from "react";
import { getOrCreateStreamerId, getStreamerName } from "@/lib/identity";
import { useAuth } from "@/contexts/AuthContext";
import { formatNumber } from "@/lib/utils";
import { Clock, Eye, Radio } from "lucide-react";
import Link from "next/link";

interface Session {
  id: string;
  title: string;
  category: string;
  startedAt: string;
  endedAt?: string;
  peakViewers: number;
  totalLikes: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [name, setName] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    const sid = getOrCreateStreamerId(user?.uid);
    setId(sid);
    setName(getStreamerName(user?.displayName) || user?.email?.split("@")[0] || "Seu canal");
    fetch(`/api/sessions?streamerId=${sid}`)
      .then((r) => r.json())
      .then((d) => setSessions(Array.isArray(d) ? d : []));
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-white">Dashboard</h1>
      <p className="mb-6 text-sm text-white/50">
        {name || "Seu canal"} ·{" "}
        <Link href="/studio" className="text-purple-400 hover:underline">
          Abrir Studio
        </Link>
      </p>

      <section className="mb-8 rounded-2xl border border-white/10 bg-[#18181b] p-6">
        <div className="mb-2 flex items-center gap-2">
          <Radio className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold">Transmissão</h2>
        </div>
        <p className="text-sm text-white/50">
          Gere a chave RTMP, conecte o OBS e clique em Transmitir no{" "}
          <Link href="/studio" className="text-purple-400 hover:underline">
            Studio
          </Link>
          . A API do Cloudflare Stream precisa estar ativa (Account ID + API Token).
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Histórico de lives</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-white/40">Nenhuma live registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((live) => (
              <div
                key={live.id}
                className="rounded-xl border border-white/5 bg-[#18181b] p-4"
              >
                <h3 className="font-medium text-white">{live.title}</h3>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(live.startedAt).toLocaleString("pt-BR")}
                    {live.endedAt
                      ? ` → ${new Date(live.endedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                      : " (em andamento)"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Pico {formatNumber(live.peakViewers)} · Likes {formatNumber(live.totalLikes)}
                  </span>
                  <span>{live.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
