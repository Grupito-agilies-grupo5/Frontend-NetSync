import React, { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Reaction as ReactionType, REACTION_EMOJIS } from '../../types';

interface ReactionsProps {
  roomId: string;
  userName: string;
  socket: Socket;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

export const Reactions: React.FC<ReactionsProps> = ({ roomId, userName, socket }) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    like: 0,
    surprised: 0,
    laugh: 0,
    bored: 0,
  });
  const [floating, setFloating] = useState<FloatingReaction[]>([]);

  useEffect(() => {
    const handleReaction = (reaction: ReactionType) => {
      setCounts((prev) => ({
        ...prev,
        [reaction.type]: (prev[reaction.type] || 0) + 1,
      }));

      // Create floating animation
      const id = reaction.id;
      const emoji = REACTION_EMOJIS[reaction.type as keyof typeof REACTION_EMOJIS]?.emoji || '👍';
      const x = Math.random() * 80 + 10; // 10-90% of container width
      setFloating((prev) => [...prev, { id, emoji, x }]);

      // Remove after animation
      setTimeout(() => {
        setFloating((prev) => prev.filter((f) => f.id !== id));
      }, 1500);
    };

    const handleHistory = (reactions: ReactionType[]) => {
      const newCounts: Record<string, number> = { like: 0, surprised: 0, laugh: 0, bored: 0 };
      reactions.forEach((r) => {
        newCounts[r.type] = (newCounts[r.type] || 0) + 1;
      });
      setCounts(newCounts);
    };

    socket.on('reaction:send', handleReaction);
    socket.on('reaction:history', handleHistory);

    return () => {
      socket.off('reaction:send', handleReaction);
      socket.off('reaction:history', handleHistory);
    };
  }, [socket]);

  const sendReaction = useCallback(
    (type: string) => {
      socket.emit('reaction:send', { roomId, userName, type });
    },
    [socket, roomId, userName]
  );

  return (
    <div className="relative">
      {/* Floating reactions */}
      <div className="absolute -top-16 left-0 right-0 h-16 pointer-events-none overflow-hidden">
        {floating.map((f) => (
          <span
            key={f.id}
            className="reaction-float text-2xl"
            style={{ left: `${f.x}%` }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      {/* Reaction buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.entries(REACTION_EMOJIS) as [string, { emoji: string; label: string }][]).map(
          ([type, { emoji, label }]) => (
            <button
              key={type}
              onClick={() => sendReaction(type)}
              className="flex items-center gap-1.5 px-3 py-2 bg-dark-800/80 border border-dark-700 rounded-full
                         hover:border-primary-500/50 hover:bg-dark-700 active:scale-95 transition-all duration-200 group"
              title={label}
            >
              <span className="text-lg group-hover:scale-125 transition-transform">{emoji}</span>
              <span className="text-xs text-dark-400 font-medium">{counts[type] || 0}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
