export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  image: string;
  cover?: string;
  bio?: string;
  followers: number;
  following: number;
  isLive?: boolean;
}

export interface Stream {
  id: string;
  title: string;
  streamer: User;
  thumbnail: string;
  viewers: number;
  category: string;
  tags: string[];
  isLive: boolean;
  startedAt?: string;
  streamKey?: string;
  playbackUrl?: string;
  likes: number;
}

export interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  streamer: User;
  createdAt: string;
}

export interface ScheduledVideo {
  id: string;
  title: string;
  youtubeId: string;
  thumbnail: string;
  scheduledAt: string;
  duration: string;
  channel: string;
}

export interface ChatMessage {
  id: string;
  user: Pick<User, "id" | "name" | "username" | "image">;
  text: string;
  createdAt: string;
  replyTo?: {
    id: string;
    username: string;
    text: string;
  };
}

export interface LiveHistory {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  peakViewers: number;
  totalViews: number;
  startedAt: string;
  endedAt: string;
}
