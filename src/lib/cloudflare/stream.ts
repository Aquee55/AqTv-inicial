/**
 * Cloudflare Stream – Live Inputs API (produção)
 * Docs: https://developers.cloudflare.com/stream/stream-live/
 *
 * ATIVAÇÃO OBRIGATÓRIA:
 * 1. dash.cloudflare.com → Stream → ative o produto
 * 2. API Tokens → Create Token → permissão "Account - Stream - Edit"
 * 3. Account ID + Token + Customer subdomain no .env
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const CUSTOMER = process.env.CLOUDFLARE_CUSTOMER_CODE || "";

function assertConfig() {
  if (!ACCOUNT_ID || !API_TOKEN) {
    throw new Error(
      "Cloudflare Stream não configurado. Defina CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN no .env (veja README)."
    );
  }
}

const base = () =>
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`;

async function cf<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  assertConfig();
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg =
      json?.errors?.[0]?.message ||
      json?.messages?.[0] ||
      `HTTP ${res.status}`;
    throw new Error(`Cloudflare Stream: ${msg}`);
  }
  return json.result as T;
}

export type LiveInput = {
  uid: string;
  rtmps?: { url: string; streamKey: string };
  rtmp?: { url: string; streamKey: string };
  status?: { current?: { state?: string }; state?: string };
  meta?: Record<string, string>;
  created?: string;
  modified?: string;
  recording?: { mode: string; timeoutSeconds?: number };
};

export async function createLiveInput(name: string): Promise<LiveInput> {
  return cf<LiveInput>("/live_inputs", {
    method: "POST",
    body: JSON.stringify({
      meta: { name },
      recording: {
        mode: "automatic",
        timeoutSeconds: 7200,
      },
      deleteRecordingAfterDays: 1,
    }),
  });
}

export async function getLiveInput(uid: string): Promise<LiveInput> {
  return cf<LiveInput>(`/live_inputs/${uid}`);
}

export async function listLiveInputs(): Promise<LiveInput[]> {
  const result = await cf<LiveInput[] | { liveInputs?: LiveInput[] }>("/live_inputs");
  if (Array.isArray(result)) return result;
  return (result as any).liveInputs || [];
}

export async function deleteLiveInput(uid: string): Promise<void> {
  await cf(`/live_inputs/${uid}`, { method: "DELETE" });
}

export async function updateLiveInputMeta(
  uid: string,
  meta: Record<string, string>
): Promise<LiveInput> {
  return cf<LiveInput>(`/live_inputs/${uid}`, {
    method: "PUT",
    body: JSON.stringify({ meta }),
  });
}

export function getPlaybackUrl(uid: string): string {
  const code = CUSTOMER || "customer";
  return `https://${code}.cloudflarestream.com/${uid}/manifest/video.m3u8`;
}

export function extractRtmp(input: LiveInput) {
  const url = input.rtmps?.url || input.rtmp?.url || "";
  const streamKey = input.rtmps?.streamKey || input.rtmp?.streamKey || "";
  return { rtmpUrl: url, streamKey };
}

export function isObsConnected(input: LiveInput): boolean {
  const state =
    input.status?.current?.state ||
    (input.status as any)?.state ||
    "";
  return String(state).toLowerCase() === "connected";
}

export function isCloudflareConfigured(): boolean {
  return Boolean(ACCOUNT_ID && API_TOKEN);
}
