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
      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${isActive 
        ? "bg-primary text-black shadow-[0_0_15px_rgba(0,230,184,0.25)] font-bold" 
        : "text-gray-400 hover:text-white hover:bg-white/5"}
    `;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
            <PawPrint className="w-6 h-6 text-primary" />
          </div>
          <div className="hidden sm:flex flex-col">
             <span className="text-lg font-bold text-white leading-none tracking-tight">
               SigPet MT
             </span>
             <span className="text-[10px] font-bold text-gray-200 tracking-[0.2em] uppercase mt-1.5">
               Governo de Mato Grosso
             </span>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-surface/50 p-1.5 rounded-xl border border-white/5 shadow-lg shadow-black/20">
          <button 
            onClick={() => navigate('/pets')}
            className={getLinkClass('/pets')}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Gestão de Pets</span>
          </button>

          <button 
            onClick={() => navigate('/tutores')}
            className={getLinkClass('/tutores')}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Tutores</span>
          </button>
        </nav>

        <div className="flex items-center gap-6">
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors group"
          >
            <span className="hidden sm:inline group-hover:underline decoration-red-400/30 underline-offset-4">Sair</span>
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </header>
  );
}