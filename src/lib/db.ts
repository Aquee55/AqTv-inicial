/**
 * Store em memória do processo Node.
 * Em produção (Vercel/Railway) troque por Supabase, Postgres ou Cloudflare D1.
 */

export interface StreamerProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  image?: string;
  cover?: string;
  bio?: string;
  youtubeChannelId?: string;
  youtubeHandle?: string;
  cloudflareLiveInputId?: string;
  streamKey?: string;
  rtmpUrl?: string;
  isLive: boolean;
  liveTitle?: string;
  liveCategory?: string;
  liveStartedAt?: string;
  viewers: number;
  likes: number;
  followers: number;
}

export interface ScheduledSlot {
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

export interface LiveSession {
  id: string;
  streamerId: string;
  title: string;
  category: string;
  startedAt: string;
  endedAt?: string;
  peakViewers: number;
  totalLikes: number;
  playbackUrl?: string;
}

export interface ChatMessage {
  id: string;
  streamerId: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: string;
  replyToId?: string;
  replyToName?: string;
  replyToText?: string;
}

const streamers = new Map<string, StreamerProfile>();
const schedules = new Map<string, ScheduledSlot[]>();
const sessions = new Map<string, LiveSession[]>();
const chats = new Map<string, ChatMessage[]>();

const BANNED = ["porra", "caralho", "merda", "fdp", "viado", "puta"];

export function filterBadWords(text: string): string {
  let out = text;
  for (const w of BANNED) {
    out = out.replace(new RegExp(w, "gi"), "***");
  }
  return out;
}

export const db = {
  getStreamer(id: string) {
    return streamers.get(id) ?? null;
  },
  getStreamerByEmail(email: string) {
    for (const s of streamers.values()) if (s.email === email) return s;
    return null;
  },
  getStreamerByUsername(username: string) {
    for (const s of streamers.values()) if (s.username === username) return s;
    return null;
  },
  upsertStreamer(data: Partial<StreamerProfile> & { id: string }) {
    const prev = streamers.get(data.id);
    const next: StreamerProfile = {
      id: data.id,
      email: data.email ?? prev?.email ?? "",
      name: data.name ?? prev?.name ?? "Streamer",
      username: data.username ?? prev?.username ?? data.id,
      image: data.image ?? prev?.image,
      cover: data.cover ?? prev?.cover,
      bio: data.bio ?? prev?.bio,
      youtubeChannelId: data.youtubeChannelId ?? prev?.youtubeChannelId,
      youtubeHandle: data.youtubeHandle ?? prev?.youtubeHandle,
      cloudflareLiveInputId:
        data.cloudflareLiveInputId ?? prev?.cloudflareLiveInputId,
      streamKey: data.streamKey ?? prev?.streamKey,
      rtmpUrl: data.rtmpUrl ?? prev?.rtmpUrl,
      isLive: data.isLive ?? prev?.isLive ?? false,
      liveTitle: data.liveTitle !== undefined ? data.liveTitle : prev?.liveTitle,
      liveCategory:
        data.liveCategory !== undefined ? data.liveCategory : prev?.liveCategory,
      liveStartedAt:
        data.liveStartedAt !== undefined ? data.liveStartedAt : prev?.liveStartedAt,
      viewers: data.viewers ?? prev?.viewers ?? 0,
      likes: data.likes ?? prev?.likes ?? 0,
      followers: data.followers ?? prev?.followers ?? 0,
    };
    streamers.set(data.id, next);
    return next;
  },
  ensureStreamer(id: string, defaults?: Partial<StreamerProfile>) {
    const existing = streamers.get(id);
    if (existing) return existing;
    return this.upsertStreamer({
      id,
      email: defaults?.email || `${id}@aqtv.local`,
      name: defaults?.name || "Meu Canal",
      username: defaults?.username || id,
      isLive: false,
      viewers: 0,
      likes: 0,
      followers: 0,
      ...defaults,
    });
  },
  listLiveStreamers() {
    return Array.from(streamers.values()).filter((s) => s.isLive);
  },
  listAllStreamers() {
    return Array.from(streamers.values());
  },
  getSchedule(streamerId: string) {
    return schedules.get(streamerId) || [];
  },
  setSchedule(streamerId: string, slots: ScheduledSlot[]) {
    schedules.set(streamerId, slots);
  },
  addSession(streamerId: string, session: LiveSession) {
    const list = sessions.get(streamerId) || [];
    list.unshift(session);
    sessions.set(streamerId, list.slice(0, 100));
  },
  endSession(streamerId: string) {
    const list = sessions.get(streamerId) || [];
    if (list[0] && !list[0].endedAt) {
      list[0].endedAt = new Date().toISOString();
    }
  },
  getSessions(streamerId: string) {
    return sessions.get(streamerId) || [];
  },
  getChat(streamerId: string) {
    return chats.get(streamerId) || [];
  },
  addChatMessage(msg: ChatMessage) {
    const list = chats.get(msg.streamerId) || [];
    list.push(msg);
    if (list.length > 200) list.shift();
    chats.set(msg.streamerId, list);
    return msg;
  },
  incrementLikes(streamerId: string) {
    const s = streamers.get(streamerId);
    if (!s) return 0;
    s.likes += 1;
    streamers.set(streamerId, s);
    return s.likes;
  },
};
