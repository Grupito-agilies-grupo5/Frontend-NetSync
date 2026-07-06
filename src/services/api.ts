// ============================================
// NetSync Frontend - API Client
// ============================================

import { Room, Metrics, ContentItem } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Create a new room from catalog
  createRoom: (contentId: string, hostName: string) =>
    request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ contentId, hostName }),
    }),

  // Create a new room from FM-DB movie
  createRoomFromFmdb: (contentTitle: string, imdbId: string, hostName: string, posterUrl?: string) =>
    request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ contentTitle, imdbId, hostName, posterUrl }),
    }),

  // Get room by ID
  getRoom: (id: string) => request<Room>(`/rooms/${id}`),

  // Join room by code
  joinRoom: (code: string, userName: string) =>
    request<Room>(`/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ userName }),
    }),

  // Submit rating
  addRating: (roomId: string, userName: string, score: number, comment?: string) =>
    request<any>(`/rooms/${roomId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ userName, score, comment }),
    }),

  // Get metrics
  getMetrics: () => request<Metrics>('/metrics'),

  // Get content catalog
  getContent: () => request<ContentItem[]>('/content'),

  // ---- FM-DB (Free Movie Database) ----

  // Search movies on FM-DB
  searchMovies: (query: string) =>
    request<any>(`/fmdb/search?q=${encodeURIComponent(query)}`),

  // Get detailed movie info by IMDb ID
  getMovieDetails: (tt: string) =>
    request<any>(`/fmdb/details/${tt}`),

  // Get trailer/media URL for a movie
  getMovieMedia: (tt: string) =>
    request<any>(`/fmdb/media/${tt}`),

  // Get poster photo URL (proxied through backend)
  getMoviePosterUrl: (tt: string, w = 300, h = 450) =>
    `/api/fmdb/photo/${tt}?w=${w}&h=${h}`,
};
