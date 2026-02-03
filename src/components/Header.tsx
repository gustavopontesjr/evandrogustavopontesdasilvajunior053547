import { LogOut, PawPrint, Users, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return `
      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
      ${isActive 
        ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-[0_0_15px_rgba(0,230,184,0.1)]" 
        : "text-gray-400 hover:text-white hover:bg-white/5"}
    `;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-primary to-emerald-600 p-2 rounded-lg shadow-lg shadow-primary/20">
            <PawPrint className="w-5 h-5 text-black fill-current" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide hidden sm:block">
            Pet<span className="text-primary">Manager</span>
          </span>
        </div>

        <nav className="flex items-center gap-2 bg-surface/50 p-1 rounded-full border border-white/5">
          <button 
            onClick={() => navigate('/pets')}
            className={getLinkClass('/pets')}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Pets</span>
          </button>

          <button 
            onClick={() => navigate('/tutores')}
            className={getLinkClass('/tutores')}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Tutores</span>
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors group"
          >
            <span className="hidden sm:inline group-hover:underline decoration-red-400/30 underline-offset-4">Sair</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}