import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useRoom } from '../hooks/useRoom';
import { useChat } from '../hooks/useChat';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { Chat } from '../components/room/Chat';
import { Reactions } from '../components/room/Reactions';
import { UserList } from '../components/room/UserList';
import { disconnectSocket } from '../services/socket';
import { Room } from '../types';
import { Copy, Check, Star, X, Loader2, MessageSquare, Users as UsersIcon } from 'lucide-react';

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { userName: string; isHost: boolean } | null;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const userName = state?.userName || 'Anónimo';
  const isHost = state?.isHost || false;

  const socket = useSocket();
  const { users, joinRoom } = useRoom(socket);
  const { messages, sendMessage } = useChat(socket);

  // Fetch room data and join via socket
  useEffect(() => {
    if (!roomId) return;

    const init = async () => {
      try {
        const roomData = await api.getRoom(roomId);
        setRoom(roomData);
        joinRoom(roomId, userName, isHost);
      } catch (err) {
        console.error('Failed to load room:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      disconnectSocket();
    };
  }, [roomId]);

  const handleCopyCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = useCallback(
    (text: string) => {
      if (roomId) sendMessage(roomId, userName, text);
    },
    [roomId, userName, sendMessage]
  );

  const handleLeave = () => {
    setShowRating(true);
  };

  const handleSubmitRating = async () => {
    if (roomId && rating > 0) {
      try {
        await api.addRating(roomId, userName, rating, comment || undefined);
        setRatingSubmitted(true);
        setTimeout(() => {
          disconnectSocket();
          navigate('/');
        }, 1500);
      } catch (err) {
        console.error('Rating error:', err);
        disconnectSocket();
        navigate('/');
      }
    }
  };

  const handleSkipRating = () => {
    disconnectSocket();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 p-3 lg:p-4">
        {/* Room Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-bold truncate">{room.contentTitle}</h1>
            <button
              onClick={handleCopyCode}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-dark-800 border border-dark-700 rounded-lg text-xs hover:border-primary-500/50 transition-colors"
              title="Copiar código de sala"
            >
              <span className="font-mono font-bold text-primary-400">{room.code}</span>
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-dark-400" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile toggles */}
            <button
              onClick={() => setShowMobileChat(!showMobileChat)}
              className="lg:hidden p-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors relative"
            >
              <MessageSquare className="w-4 h-4" />
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full text-[10px] flex items-center justify-center">
                  {messages.length}
                </span>
              )}
            </button>
            <button
              onClick={handleLeave}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-shrink-0">
          <VideoPlayer roomId={roomId!} isHost={isHost} socket={socket} imdbId={room.imdbId} contentTitle={room.contentTitle} videoUrl={room.videoUrl} />
        </div>

        {/* Reactions */}
        <div className="mt-3">
          <Reactions roomId={roomId!} userName={userName} socket={socket} />
        </div>
      </div>

      {/* Sidebar (desktop) or overlay (mobile) */}
      <div
        className={`
          ${showMobileChat ? 'fixed inset-0 z-50 bg-dark-950/90' : 'hidden'}
          lg:relative lg:block lg:w-80 xl:w-96 lg:bg-transparent
          border-l border-dark-800/50 flex flex-col
        `}
      >
        <div className="flex flex-col h-full bg-dark-900/50 lg:bg-transparent">
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-dark-700/50">
            <span className="font-semibold text-sm">Chat y Usuarios</span>
            <button onClick={() => setShowMobileChat(false)} className="p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Users */}
          <div className="border-b border-dark-700/50">
            <UserList users={users} currentUser={userName} />
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={userName}
            />
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 animate-bounce-in">
            {ratingSubmitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-lg font-bold">¡Gracias!</p>
                <p className="text-dark-400 text-sm mt-1">Tu calificación fue registrada</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2 text-center">¿Cómo fue tu experiencia?</h2>
                <p className="text-dark-400 text-sm text-center mb-6">
                  Califica tu sesión de {room.contentTitle}
                </p>

                {/* Stars */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className="transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          s <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-dark-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comentario opcional..."
                  className="input-field resize-none h-20 mb-4 text-sm"
                  maxLength={200}
                />

                <div className="flex gap-3">
                  <button onClick={handleSkipRating} className="btn-secondary flex-1 text-sm">
                    Omitir
                  </button>
                  <button
                    onClick={handleSubmitRating}
                    disabled={rating === 0}
                    className="btn-primary flex-1 text-sm"
                  >
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
