/**
 * YouTube Data API v3
 * Precisa de: YOUTUBE_API_KEY no .env
 * Para listar vídeos do canal do streamer.
 */

const API_KEY = process.env.YOUTUBE_API_KEY!;
const BASE = "https://www.googleapis.com/youtube/v3";

export interface YTVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration?: string;
  channelTitle: string;
}

/** Busca vídeos de um canal pelo channelId */
export async function getChannelVideos(channelId: string, maxResults = 20): Promise<YTVideo[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada");

  // 1. Pega uploads playlist do canal
  const chRes = await fetch(
    `${BASE}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
  );
  const chData = await chRes.json();
  const uploadsId = chData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) return [];

  // 2. Lista vídeos da playlist
  const plRes = await fetch(
    `${BASE}/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=${maxResults}&key=${API_KEY}`
  );
  const plData = await plRes.json();

  return (plData.items || []).map((item: any) => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  }));
}

/** Busca canal pelo username / handle (@aqtv) */
export async function getChannelByHandle(handle: string) {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada");
  const clean = handle.replace("@", "");
  const res = await fetch(
    `${BASE}/channels?part=snippet,contentDetails&forHandle=${clean}&key=${API_KEY}`
  );
  const data = await res.json();
  return data?.items?.[0] || null;
}

/** Busca canal pelo ID */
export async function getChannelById(channelId: string) {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada");
  const res = await fetch(
    `${BASE}/channels?part=snippet,contentDetails&id=${channelId}&key=${API_KEY}`
  );
  const data = await res.json();
  return data?.items?.[0] || null;
}
