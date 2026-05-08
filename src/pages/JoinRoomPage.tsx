import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Users, ArrowRight, Loader2 } from 'lucide-react';

export const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!code.trim()) {
      setError('Ingresa el código de sala');
      return;
    }
    if (userName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const room = await api.joinRoom(code.trim().toUpperCase(), userName.trim());
      navigate(`/room/${room.id}`, { state: { userName: userName.trim(), isHost: false } });
    } catch (err: any) {
      setError(err.message || 'No se encontró la sala');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Unirse a Sala</h1>
        <p className="text-dark-400">Ingresa el código que te compartieron</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        {/* Room Code */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Código de sala
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Ej: ABC123"
            className="input-field text-center text-2xl font-mono tracking-[0.3em] uppercase"
            maxLength={6}
          />
        </div>

        {/* User Name */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Tu nombre
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingresa tu nombre..."
            className="input-field"
            maxLength={30}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={loading}
          className="btn-accent w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
          {loading ? 'Conectando...' : 'Unirse a la Sala'}
        </button>
      </div>
    </div>
  );
};
