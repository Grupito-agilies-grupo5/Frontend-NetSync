import React, { useEffect, useState } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ContentCard } from '../components/home/ContentCard';
import { MovieSearch } from '../components/home/MovieSearch';
import { api } from '../services/api';
import { ContentItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { AiAssistant } from '../components/dashboard/AiAssistant';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [contentCatalog, setContentCatalog] = useState<ContentItem[]>([]);

  useEffect(() => {
    api.getContent().then(setContentCatalog).catch(() => setContentCatalog([]));
  }, []);

  return (
    <div>
      <HeroSection />

      {/* Movie Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MovieSearch />
      </section>

      {/* Content Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Contenido Popular</h2>
            <p className="text-dark-400 text-sm mt-1">Películas reales con pósters de FM-DB — Selecciona para crear sala</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6">
          {contentCatalog.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onSelect={() => navigate('/create', { state: { contentId: content.id } })}
            />
          ))}
        </div>
      </section>

      {/* AI Assistant - SyncBot */}
      <AiAssistant />
    </div>
  );
};
