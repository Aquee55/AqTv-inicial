import { NextRequest, NextResponse } from "next/server";
import {
  createLiveInput,
  extractRtmp,
  getPlaybackUrl,
  isCloudflareConfigured,
} from "@/lib/cloudflare/stream";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    if (!isCloudflareConfigured()) {
      return NextResponse.json(
        {
          error:
            "Cloudflare Stream não configurado. Defina CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN no ambiente de hospedagem.",
          code: "CF_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const streamerId = String(body.streamerId || "").trim();
    const name = String(body.name || `AqTv-${streamerId}`).slice(0, 120);

    if (!streamerId) {
      return NextResponse.json({ error: "streamerId obrigatório" }, { status: 400 });
    }

    db.ensureStreamer(streamerId, { name });

    const live = await createLiveInput(name);
    const { rtmpUrl, streamKey } = extractRtmp(live);

    if (!rtmpUrl || !streamKey) {
      return NextResponse.json(
        {
          error:
            "Cloudflare não retornou URL/chave RTMP. Verifique se o Stream Live está ativo na conta.",
        },
        { status: 502 }
      );
    }

    db.upsertStreamer({
      id: streamerId,
      name,
      cloudflareLiveInputId: live.uid,
      rtmpUrl,
      streamKey,
    });

    return NextResponse.json({
      uid: live.uid,
      rtmpUrl,
      streamKey,
      playbackUrl: getPlaybackUrl(live.uid),
      status: live.status,
    });
  } catch (err: any) {
    console.error("[stream/create]", err);
    return NextResponse.json(
      { error: err.message || "Erro ao criar live input" },
      { status: 500 }
    );
  }
}
