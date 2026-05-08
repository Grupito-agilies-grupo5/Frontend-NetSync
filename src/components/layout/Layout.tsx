import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Film, BarChart3, Home, ArrowLeft } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isRoom = location.pathname.startsWith('/room/');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">NetSync</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-2">
              {isRoom && (
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-dark-300 hover:text-white transition-colors rounded-lg hover:bg-dark-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </Link>
              )}
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-dark-300 hover:text-white transition-colors rounded-lg hover:bg-dark-800"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Inicio</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-dark-300 hover:text-white transition-colors rounded-lg hover:bg-dark-800"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      {!isRoom && (
        <footer className="border-t border-dark-800/50 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-dark-500 text-sm">
            <p>NetSync — Prototipo Académico · No conectado a servicios de streaming reales</p>
          </div>
        </footer>
      )}
    </div>
  );
};
