// ============================================
// NetSync Frontend - Shared Type Definitions
// ============================================

export interface Room {
  id: string;
  code: string;
  contentId: string;
  contentTitle: string;
  imdbId?: string;
  hostName: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'paused' | 'ended';
  currentTime: number;
  createdAt: string;
  endedAt?: string;
  users?: RoomUser[];
  videoUrl?: string;
}

export interface RoomUser {
  id: string;
  roomId: string;
  name: string;
  socketId: string;
  isHost: boolean;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface Reaction {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  type: 'like' | 'surprised' | 'laugh' | 'bored';
  timestamp: string;
}

export interface Rating {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  score: number;
  comment?: string;
  timestamp: string;
}

export interface ContentItem {
  id: string;
  title: string;
  genre: string;
  year: number;
  duration: string;
  description: string;
  gradient: string;
  rating: string;
  imdbId?: string;
  posterUrl?: string;
  actors?: string;
  videoUrl?: string;
}

// FM-DB API response types
export interface FmdbSearchResult {
  '#TITLE': string;
  '#YEAR': number;
  '#IMDB_ID': string;
  '#RANK': number;
  '#ACTORS': string;
  '#AKA': string;
  '#IMDB_URL': string;
  '#IMG_POSTER': string;
  photo_width?: number;
  photo_height?: number;
}

export interface FmdbSearchResponse {
  ok: boolean;
  description: FmdbSearchResult[];
  error_code: number;
}

export interface Metrics {
  totalRooms: number;
  activeRooms: number;
  totalUsers: number;
  averageRating: number;
  totalRatings: number;
  mostUsedContent: { title: string; count: number }[];
  reactionCounts: { type: string; count: number }[];
  averageSessionMinutes: number;
}

export type ReactionType = 'like' | 'surprised' | 'laugh' | 'bored';

export const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Me gusta' },
  surprised: { emoji: '😮', label: 'Me sorprendió' },
  laugh: { emoji: '😂', label: 'Me dio risa' },
  bored: { emoji: '😴', label: 'Me aburrió' },
};
