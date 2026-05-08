import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Metrics } from '../types';
import { MetricCard } from '../components/dashboard/MetricCard';
import {
  Monitor, Users, Star, Film, Smile, Clock, BarChart3, Loader2, RefreshCw,
} from 'lucide-react';
import { REACTION_EMOJIS } from '../types';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchMetrics} className="btn-primary">Reintentar</button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <p className="text-dark-400">Métricas generales de la plataforma NetSync</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="p-2.5 bg-dark-800 border border-dark-700 rounded-xl hover:border-primary-500/50 transition-colors"
          title="Actualizar"
        >
          <RefreshCw className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <MetricCard
          title="Salas Creadas"
          value={metrics.totalRooms}
          subtitle={`${metrics.activeRooms} activas`}
          icon={Monitor}
          gradient="from-primary-600 to-primary-400"
        />
        <MetricCard
          title="Usuarios Totales"
          value={metrics.totalUsers}
          icon={Users}
          gradient="from-accent-600 to-accent-400"
        />
        <MetricCard
          title="Calificación Promedio"
          value={metrics.averageRating > 0 ? `${metrics.averageRating} ⭐` : 'N/A'}
          subtitle={`${metrics.totalRatings} calificaciones`}
          icon={Star}
          gradient="from-yellow-500 to-amber-600"
        />
        <MetricCard
          title="Tiempo Promedio"
          value={metrics.averageSessionMinutes > 0 ? `${metrics.averageSessionMinutes} min` : 'N/A'}
          subtitle="por sesión"
          icon={Clock}
          gradient="from-green-500 to-emerald-600"
        />
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Content */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Film className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold">Contenido Más Usado</h2>
          </div>
          {metrics.mostUsedContent.length > 0 ? (
            <div className="space-y-3">
              {metrics.mostUsedContent.map((item, index) => (
                <div key={item.title} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm">{item.title}</span>
                  </div>
                  <span className="text-sm text-dark-400">{item.count} salas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-500 text-sm">Sin datos aún</p>
          )}
        </div>

        {/* Reaction Stats */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5 text-accent-400" />
            <h2 className="text-lg font-semibold">Reacciones</h2>
          </div>
          {metrics.reactionCounts.length > 0 ? (
            <div className="space-y-3">
              {metrics.reactionCounts.map((item) => {
                const emoji = REACTION_EMOJIS[item.type as keyof typeof REACTION_EMOJIS];
                const maxCount = Math.max(...metrics.reactionCounts.map((r) => r.count), 1);
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">
                        {emoji?.emoji || '❓'} {emoji?.label || item.type}
                      </span>
                      <span className="text-sm text-dark-400">{item.count}</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-dark-500 text-sm">Sin reacciones aún</p>
          )}
        </div>
      </div>
    </div>
  );
};
