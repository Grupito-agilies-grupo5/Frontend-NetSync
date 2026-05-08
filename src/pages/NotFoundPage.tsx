import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Film } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <Film className="w-24 h-24 text-dark-700" />
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-red-400 font-bold text-lg">?</span>
          </div>
        </div>
        <h1 className="text-6xl font-extrabold gradient-text mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-2">Página no encontrada</h2>
        <p className="text-dark-400 mb-8 max-w-md">
          La página que buscas no existe o la sala ha expirado.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-5 h-5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};
