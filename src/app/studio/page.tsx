"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Radio, Key, Copy, Check, Play, Square, RefreshCw, Youtube,
  Calendar, Plus, Trash2, ExternalLink, AlertCircle,
} from "lucide-react";
import { getOrCreateStreamerId, getStreamerName, setStreamerName, getUsernameFromId } from "@/lib/identity";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface YTVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface Slot {
  id: string;
  streamerId: string;
  youtubeVideoId: string;
  title: string;
  thumbnail: string;
  startTime: string;
  endTime: string;
  days: number[];
  enabled: boolean;
}

export default function StudioPage() {
  const { user, loading: authLoading } = useAuth();
  const [streamerId, setStreamerId] = useState("");
  const [displayName, setDisplayName] = useState("Meu Canal");
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [uid, setUid] = useState("");
  const [connected, setConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [cfConfigured, setCfConfigured] = useState(true);
  const [title, setTitle] = useState("Live na AqTv");
  const [category, setCategory] = useState("Just Chatting");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState<"url" | "key" | null>(null);
  const [ytHandle, setYtHandle] = useState("");
  const [ytVideos, setYtVideos] = useState<YTVideo[]>([]);
  const [loadingYt, setLoadingYt] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState({
    videoId: "", title: "", thumbnail: "", startTime: "08:00", endTime: "17:00",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    const id = getOrCreateStreamerId(user.uid);
    setStreamerId(id);
    setDisplayName(getStreamerName(user.displayName) || user.email?.split("@")[0] || "Meu Canal");
  }, [user, authLoading]);

  const copy = (text: string, type: "url" | "key") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const createKey = async () => {
    if (!streamerId) return;
    setLoading(true);
    setMsg("");
    try {
      setStreamerName(displayName);
      const res = await fetch("/api/stream/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamerId,
          name: displayName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao criar chave");
      setRtmpUrl(data.rtmpUrl);
      setStreamKey(data.streamKey);
      setUid(data.uid);
      setMsg("Chave criada. Cole no OBS (Serviço: Personalizado) e inicie a transmissão.");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = useCallback(async () => {
    if (!streamerId) return;
    try {
      const res = await fetch(`/api/stream/status?streamerId=${streamerId}`);
      const data = await res.json();
      setCfConfigured(data.configured !== false);
      setConnected(!!data.connected);
      setIsLive(!!data.isLive);
      if (data.rtmpUrl) setRtmpUrl(data.rtmpUrl);
      if (data.streamKey) setStreamKey(data.streamKey);
      if (data.uid) setUid(data.uid);
    } catch {}
  }, [streamerId]);

  useEffect(() => {
    if (!streamerId) return;
    checkStatus();
    const t = setInterval(checkStatus, 8000);
    return () => clearInterval(t);
  }, [streamerId, checkStatus]);

  const goLive = async () => {
    if (!streamerId) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/stream/go-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamerId,
          title,
          category,
          name: displayName,
          username: getUsernameFromId(streamerId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsLive(true);
      setMsg("Você está AO VIVO. A live aparece na Home e no For You.");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const endLive = async () => {
    if (!streamerId) return;
    setLoading(true);
    try {
      await fetch("/api/stream/go-live", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamerId }),
      });
      setIsLive(false);
      setMsg("Live encerrada. A programação de vídeos volta a valer.");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadYoutube = async () => {
    if (!ytHandle.trim()) return;
    setLoadingYt(true);
    try {
      const res = await fetch(
        `/api/youtube/videos?handle=${encodeURIComponent(ytHandle)}&streamerId=${streamerId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setYtVideos(data.videos || []);
      if (!(data.videos || []).length) setMsg("Nenhum vídeo encontrado nesse canal.");
    } catch (e: any) {
      setMsg("YouTube: " + e.message);
    } finally {
      setLoadingYt(false);
    }
  };

  useEffect(() => {
    if (!streamerId) return;
    fetch(`/api/schedule?streamerId=${streamerId}`)
      .then((r) => r.json())
      .then((d) => setSlots(Array.isArray(d) ? d : []));
  }, [streamerId]);

  const addSlot = async () => {
    if (!newSlot.videoId || !streamerId) return;
    const slot: Slot = {
      id: `slot-${Date.now()}`,
      streamerId,
      youtubeVideoId: newSlot.videoId,
      title: newSlot.title,
      thumbnail: newSlot.thumbnail,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      days: [],
      enabled: true,
    };
    const updated = [...slots, slot];
    setSlots(updated);
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamerId, slots: updated }),
    });
    setNewSlot({ videoId: "", title: "", thumbnail: "", startTime: "08:00", endTime: "17:00" });
  };

  const removeSlot = async (id: string) => {
    const updated = slots.filter((s) => s.id !== id);
    setSlots(updated);
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamerId, slots: updated }),
    });
  };


  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white/50">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <p className="text-white/60">Entre com seu e-mail para usar o Studio.</p>
        <Link
          href="/login"
          className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500"
        >
          Entrar / Criar conta
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Studio</h1>
        <p className="text-sm text-white/50">
          Configure OBS via Cloudflare Stream, transmita e monte a programação
        </p>
      </div>

      {!cfConfigured && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
          Cloudflare Stream não está configurado neste ambiente. Defina{" "}
          <code className="text-yellow-200">CLOUDFLARE_ACCOUNT_ID</code> e{" "}
          <code className="text-yellow-200">CLOUDFLARE_API_TOKEN</code> (veja README).
        </div>
      )}

      {msg && (
        <div
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
            msg.toLowerCase().includes("não") || msg.toLowerCase().includes("falha") || msg.toLowerCase().includes("erro") || msg.toLowerCase().includes("youtube:")
              ? "bg-red-500/15 text-red-200"
              : "bg-green-500/15 text-green-200"
          }`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {msg}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
        <label className="mb-1 block text-xs text-white/50">Nome do canal</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => setStreamerName(displayName)}
          className="mb-4 w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
        />

        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold">1. Chave de Stream (OBS + Cloudflare)</h2>
        </div>

        {!streamKey ? (
          <button
            onClick={createKey}
            disabled={loading || !streamerId}
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
          >
            {loading ? "Criando na API Cloudflare..." : "Gerar chave RTMP no Cloudflare"}
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-white/50">Servidor RTMP</label>
              <div className="flex gap-2">
                <code className="flex-1 truncate rounded-lg bg-black/50 px-3 py-2 text-sm text-purple-300">
                  {rtmpUrl}
                </code>
                <button onClick={() => copy(rtmpUrl, "url")} className="rounded-lg bg-white/10 px-3 hover:bg-white/20">
                  {copied === "url" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Chave de Stream</label>
              <div className="flex gap-2">
                <code className="flex-1 truncate rounded-lg bg-black/50 px-3 py-2 text-sm text-pink-300">
                  {streamKey}
                </code>
                <button onClick={() => copy(streamKey, "key")} className="rounded-lg bg-white/10 px-3 hover:bg-white/20">
                  {copied === "key" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-white/40">
              OBS → Configurações → Stream → Serviço: <strong>Personalizado</strong> → cole Servidor + Chave → Iniciar transmissão
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className={`flex items-center gap-1.5 ${connected ? "text-green-400" : "text-yellow-400"}`}>
                <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
                {connected ? "OBS conectado (sinal na Cloudflare)" : "Aguardando sinal do OBS..."}
              </span>
              <button onClick={checkStatus} className="text-white/50 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Radio className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold">2. Transmitir na AqTv</h2>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-white/50">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              {["Just Chatting", "FPS", "Arte", "Speedrun", "Tech", "Música", "Esports"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        {!isLive ? (
          <button
            onClick={goLive}
            disabled={loading || !streamKey}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-40"
          >
            <Play className="h-4 w-4" />
            Transmitir agora
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-red-400">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              AO VIVO
            </span>
            <button
              onClick={endLive}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
            >
              <Square className="h-4 w-4" />
              Encerrar live
            </button>
            {streamerId && (
              <a href={`/live/${streamerId}`} target="_blank" className="flex items-center gap-1 text-sm text-purple-400 hover:underline">
                Ver live <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold">3. Programação YouTube (fora do horário de live)</h2>
        </div>
        <p className="mb-4 text-sm text-white/50">
          Ex.: 08:00–17:00 vídeos do canal · 17:00–22:00 você transmite ao vivo · depois volta a grade.
        </p>
        <div className="mb-4 flex gap-2">
          <input
            value={ytHandle}
            onChange={(e) => setYtHandle(e.target.value)}
            placeholder="@seucanal"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={loadYoutube}
            disabled={loadingYt}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {loadingYt ? "Buscando..." : "Buscar vídeos"}
          </button>
        </div>
        {ytVideos.length > 0 && (
          <div className="mb-6 max-h-48 space-y-2 overflow-y-auto">
            {ytVideos.map((v) => (
              <button
                key={v.id}
                onClick={() => setNewSlot((s) => ({ ...s, videoId: v.id, title: v.title, thumbnail: v.thumbnail }))}
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${
                  newSlot.videoId === v.id ? "bg-purple-600/30 ring-1 ring-purple-500" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <img src={v.thumbnail} alt="" className="h-12 w-20 rounded object-cover" />
                <span className="line-clamp-2 text-xs text-white">{v.title}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/50">Vídeo</label>
            <input value={newSlot.title || "Selecione acima"} readOnly className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Início</label>
            <input type="time" value={newSlot.startTime} onChange={(e) => setNewSlot((s) => ({ ...s, startTime: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Fim</label>
            <input type="time" value={newSlot.endTime} onChange={(e) => setNewSlot((s) => ({ ...s, endTime: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          </div>
        </div>
        <button onClick={addSlot} disabled={!newSlot.videoId} className="mb-6 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-40">
          <Plus className="h-4 w-4" /> Adicionar à programação
        </button>
        {slots.length > 0 && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white/70">
              <Calendar className="h-4 w-4" /> Grade
            </h3>
            {slots.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-2">
                <img src={s.thumbnail} alt="" className="h-10 w-16 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{s.title}</p>
                  <p className="text-xs text-white/40">{s.startTime} – {s.endTime}</p>
                </div>
                <button onClick={() => removeSlot(s.id)} className="text-white/40 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
