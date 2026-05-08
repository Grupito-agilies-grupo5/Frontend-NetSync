import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { FmdbSearchResult } from '../../types';
import { Search, X, Loader2, Star, ExternalLink } from 'lucide-react';

export const MovieSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const data = await api.searchMovies(q);
      if (data.ok && data.description) {
        setResults(data.description.slice(0, 8));
        setShowResults(true);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSelect = (movie: FmdbSearchResult) => {
    // Navigate to create room with this movie's info
    navigate('/create', {
      state: {
        fmdbMovie: {
          title: movie['#TITLE'],
          year: movie['#YEAR'],
          imdbId: movie['#IMDB_ID'],
          actors: movie['#ACTORS'],
          posterUrl: movie['#IMG_POSTER'],
        },
      },
    });
    setShowResults(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative max-w-2xl mx-auto mb-10">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Buscar películas reales (powered by FM-DB)..."
          className="w-full pl-12 pr-12 py-3.5 bg-dark-800/80 border border-dark-700 rounded-2xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
        />
        {loading && (
          <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />
        )}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-dark-400" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800/95 backdrop-blur-xl border border-dark-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden max-h-[420px] overflow-y-auto">
          <div className="px-3 py-2 border-b border-dark-700/50 text-xs text-dark-500">
            {results.length} resultados — Selecciona uno para crear sala
          </div>
          {results.map((movie) => (
            <button
              key={movie['#IMDB_ID']}
              onClick={() => handleSelect(movie)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-dark-700/60 transition-colors text-left"
            >
              {/* Poster thumbnail */}
              {movie['#IMG_POSTER'] ? (
                <img
                  src={movie['#IMG_POSTER']}
                  alt={movie['#TITLE']}
                  className="w-10 h-14 object-cover rounded-md flex-shrink-0 bg-dark-700"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-14 bg-gradient-to-br from-dark-600 to-dark-700 rounded-md flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{movie['#TITLE']}</span>
                  <span className="text-xs text-dark-500 flex-shrink-0">({movie['#YEAR']})</span>
                </div>
                {movie['#ACTORS'] && (
                  <p className="text-xs text-dark-400 truncate mt-0.5">{movie['#ACTORS']}</p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-dark-600 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Click-away handler */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
