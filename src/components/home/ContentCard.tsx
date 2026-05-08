import React, { useState } from 'react';
import { ContentItem } from '../../types';
import { Clock, Star } from 'lucide-react';
import { api } from '../../services/api';

interface ContentCardProps {
  content: ContentItem;
  onSelect?: (content: ContentItem) => void;
  selected?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content, onSelect, selected }) => {
  const [imgError, setImgError] = useState(false);
  // Use direct posterUrl if available, otherwise try proxy, otherwise null
  const posterUrl = content.posterUrl || (content.imdbId ? api.getMoviePosterUrl(content.imdbId, 300, 450) : null);

  return (
    <button
      onClick={() => onSelect?.(content)}
      className={`group relative overflow-hidden rounded-xl transition-all duration-300 text-left w-full
        ${selected
          ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/20 scale-[1.02]'
          : 'hover:scale-105 hover:shadow-xl hover:shadow-dark-900/50'
        }`}
    >
      {/* Poster - real image or gradient fallback */}
      <div className={`aspect-[2/3] relative overflow-hidden ${!posterUrl || imgError ? `bg-gradient-to-br ${content.gradient}` : 'bg-dark-800'}`}>
        {posterUrl && !imgError && (
          <img
            src={posterUrl}
            alt={content.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs font-medium flex items-center gap-1 z-10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          {content.rating}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2 drop-shadow-lg">{content.title}</h3>
          <div className="flex items-center gap-2 text-xs text-dark-300">
            <span className="bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5">{content.genre}</span>
            <span>{content.year}</span>
          </div>
          {content.actors && (
            <p className="text-[10px] text-dark-400 mt-1 truncate">{content.actors}</p>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[5]" />
      </div>

      {/* Bottom description */}
      <div className="bg-dark-800 p-2.5">
        <p className="text-xs text-dark-400 line-clamp-2 mb-1.5">{content.description}</p>
        <div className="flex items-center gap-1 text-xs text-dark-500">
          <Clock className="w-3 h-3" />
          {content.duration}
        </div>
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center animate-bounce-in z-20">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
