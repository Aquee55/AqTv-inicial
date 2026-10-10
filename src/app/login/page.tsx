"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Radio } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, register, configured, user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    router.replace("/studio");
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (password.length < 6) {
          throw new Error("A senha precisa ter no mínimo 6 caracteres");
        }
        await register(email, password, name);
      }
      router.push("/studio");
    } catch (err: any) {
      const code = err?.code || "";
      if (code.includes("user-not-found") || code.includes("invalid-credential")) {
        setError("E-mail ou senha incorretos");
      } else if (code.includes("email-already-in-use")) {
        setError("Este e-mail já está cadastrado. Faça login.");
      } else if (code.includes("weak-password")) {
        setError("Senha fraca. Use pelo menos 6 caracteres.");
      } else if (code.includes("invalid-email")) {
        setError("E-mail inválido");
      } else {
        setError(err?.message || "Erro ao autenticar");
      }
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-sm text-yellow-100">
          Firebase não configurado. Defina as variáveis{" "}
          <code className="text-yellow-200">NEXT_PUBLIC_FIREBASE_*</code> no
          painel da Vercel (veja README).
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181b] p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Radio className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === "login" ? "Entrar na AqTv" : "Criar conta"}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Use um e-mail real. Login com Firebase.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do canal"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha (mín. 6 caracteres)"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
          />
          {error && (
            <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
          >
            {busy
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="mt-4 w-full text-center text-sm text-purple-400 hover:underline"
        >
          {mode === "login"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Entrar"}
        </button>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-white/40 hover:text-white"
        >
          ← Voltar ao início
        </Link>
      </div>
    </div>
  );
}
