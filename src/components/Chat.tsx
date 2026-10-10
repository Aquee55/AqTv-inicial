"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Reply, X } from "lucide-react";

interface Msg {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: string;
  replyToId?: string;
  replyToName?: string;
  replyToText?: string;
}

export default function Chat({ streamerId }: { streamerId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [name, setName] = useState("Espectador");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const n = localStorage.getItem("aqtv_chat_name");
    if (n) setName(n);
  }, []);

  useEffect(() => {
    if (!streamerId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/chat?streamerId=${streamerId}`);
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch {}
    };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [streamerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !streamerId) return;
    localStorage.setItem("aqtv_chat_name", name);
    const body = {
      streamerId,
      text: input.trim(),
      userId: localStorage.getItem("aqtv_chat_uid") || `u_${Date.now()}`,
      userName: name,
      replyToId: replyTo?.id,
      replyToName: replyTo?.userName,
      replyToText: replyTo?.text,
    };
    if (!localStorage.getItem("aqtv_chat_uid")) {
      localStorage.setItem("aqtv_chat_uid", body.userId);
    }
    setInput("");
    setReplyTo(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const msg = await res.json();
      if (msg.id) setMessages((m) => [...m, msg]);
    } catch {}
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-[#18181b]">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Chat ao vivo</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="py-8 text-center text-xs text-white/30">Nenhuma mensagem ainda</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="group flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600/40 text-[10px] font-bold text-white">
              {(msg.userName || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              {msg.replyToName && (
                <div className="mb-0.5 flex items-center gap-1 text-[11px] text-white/40">
                  <Reply className="h-3 w-3" />
                  <span className="font-medium text-purple-400">@{msg.replyToName}</span>
                  <span className="truncate">{msg.replyToText}</span>
                </div>
              )}
              <p className="text-sm leading-snug">
                <span className="font-semibold text-purple-300">{msg.userName}</span>{" "}
                <span className="text-white/90">{msg.text}</span>
              </p>
            </div>
            <button
              onClick={() => setReplyTo(msg)}
              className="opacity-0 transition group-hover:opacity-100"
              title="Responder"
            >
              <Reply className="h-3.5 w-3.5 text-white/40 hover:text-white" />
            </button>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="flex items-center justify-between border-t border-white/10 bg-purple-500/10 px-3 py-1.5 text-xs">
          <span className="text-white/70">
            Respondendo a <span className="font-medium text-purple-300">@{replyTo.userName}</span>
          </span>
          <button onClick={() => setReplyTo(null)}>
            <X className="h-3.5 w-3.5 text-white/50" />
          </button>
        </div>
      )}

      <div className="space-y-2 border-t border-white/10 p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 24))}
          placeholder="Seu nome"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Enviar mensagem..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={send}
            className="rounded-lg bg-purple-600 p-2 text-white transition hover:bg-purple-500"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
