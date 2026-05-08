import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-sm text-primary-300 font-medium">Prototipo Académico</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
          Mira contenido{' '}
          <span className="gradient-text">juntos</span>
          <br />
          en tiempo real
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Crea salas virtuales, sincroniza la reproducción con amigos, chatea y
          reacciona en tiempo real. La experiencia de streaming social.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/create')}
            className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
          >
            <Play className="w-5 h-5" />
            Crear Sala
          </button>
          <button
            onClick={() => navigate('/join')}
            className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"
          >
            <Users className="w-5 h-5" />
            Unirse a Sala
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[
            { value: 'Real-time', label: 'Sincronización' },
            { value: 'Chat', label: 'En vivo' },
            { value: '😂 👍', label: 'Reacciones' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-dark-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
