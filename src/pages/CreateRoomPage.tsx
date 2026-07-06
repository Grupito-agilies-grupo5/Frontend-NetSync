import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ContentCard } from '../components/home/ContentCard';
import { api } from '../services/api';
import { ContentItem } from '../types';
import { Copy, Check, ArrowRight, Loader2, Film } from 'lucide-react';

interface FmdbMovieState {
  title: string;
  year: number;
  imdbId: string;
  actors?: string;
  posterUrl?: string;
}

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as any;
  const preselectedId = locState?.contentId || '';
  const fmdbMovie = locState?.fmdbMovie as FmdbMovieState | undefined;

  const [catalog, setCatalog] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    fmdbMovie
      ? {
          id: `fmdb-${fmdbMovie.imdbId}`,
          title: fmdbMovie.title,
          genre: 'Movie',
          year: fmdbMovie.year,
          duration: '--',
          description: fmdbMovie.actors || '',
          gradient: 'from-primary-600 to-accent-600',
          rating: '--',
          imdbId: fmdbMovie.imdbId,
          posterUrl: fmdbMovie.posterUrl,
          actors: fmdbMovie.actors,
        }
      : null
  );
  const [hostName, setHostName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isFmdbContent = selectedContent?.id.startsWith('fmdb-');

  useEffect(() => {
    api.getContent().then((data) => {
      setCatalog(data);
      if (!fmdbMovie && preselectedId) {
        const found = data.find((c) => c.id === preselectedId);
        if (found) setSelectedContent(found);
      }
    }).catch(() => setCatalog([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!selectedContent) {
      setError('Selecciona un contenido');
      return;
    }
    if (hostName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let room;
      if (isFmdbContent && selectedContent.imdbId) {
        // Create room from FM-DB movie
        room = await api.createRoomFromFmdb(selectedContent.title, selectedContent.imdbId, hostName.trim(), selectedContent.posterUrl);
      } else {
        // Create room from catalog
        room = await api.createRoom(selectedContent.id, hostName.trim());
      }
      setRoomCode(room.code);
      setRoomId(room.id);
    } catch (err: any) {
      setError(err.message || 'Error al crear la sala');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterRoom = () => {
    navigate(`/room/${roomId}`, { state: { userName: hostName.trim(), isHost: true } });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Crear Sala</h1>
      <p className="text-dark-400 mb-8">Selecciona un contenido e invita a tus amigos</p>

      {!roomCode ? (
        <>
          {/* Show selected FM-DB movie if any */}
          {fmdbMovie && selectedContent && (
            <div className="mb-8 glass-card p-4">
              <div className="flex items-center gap-4">
                {selectedContent.imdbId && (
                  <img
                    src={api.getMoviePosterUrl(selectedContent.imdbId, 120, 180)}
                    alt={selectedContent.title}
                    className="w-20 h-28 object-cover rounded-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Film className="w-4 h-4 text-primary-400" />
                    <span className="text-xs text-primary-400 font-medium">Película de FM-DB</span>
                  </div>
                  <h3 className="text-xl font-bold">{selectedContent.title}</h3>
                  <p className="text-dark-400 text-sm">{selectedContent.year} {selectedContent.actors && `• ${selectedContent.actors}`}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedContent(null);
                    navigate('/create', { replace: true });
                  }}
                  className="ml-auto text-xs text-dark-500 hover:text-white transition-colors"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Select content (show catalog if no FM-DB movie selected) */}
          {!fmdbMovie && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">1. Elige el contenido</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {catalog.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onSelect={setSelectedContent}
                    selected={selectedContent?.id === content.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enter name */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{fmdbMovie ? '2' : '2'}. Tu nombre</h2>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Ingresa tu nombre..."
              className="input-field max-w-sm"
              maxLength={30}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
            {loading ? 'Creando...' : 'Crear Sala'}
          </button>
        </>
      ) : (
        /* Room Created Success */
        <div className="max-w-md mx-auto text-center">
          <div className="glass-card p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Sala Creada!</h2>
            <p className="text-dark-400 text-sm mb-6">
              Comparte este código con tus amigos para que se unan
            </p>

            {/* Room Code Display */}
            <div className="bg-dark-900 rounded-xl p-4 mb-4">
              <div className="text-xs text-dark-500 mb-2">Código de sala</div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-bold tracking-[0.3em] gradient-text">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                  title="Copiar código"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-dark-400" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-dark-500 mb-6">
              Contenido: <span className="text-dark-300">{selectedContent?.title}</span>
            </p>

            <button onClick={handleEnterRoom} className="btn-primary w-full flex items-center justify-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Entrar a la Sala
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
