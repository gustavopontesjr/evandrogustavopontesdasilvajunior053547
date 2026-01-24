import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { tutorService } from '../services/tutorService';
import type { Tutor } from '../types/tutor';
import { Search, Plus, User, MapPin, Phone, ChevronLeft, ChevronRight, ChevronRightCircle } from 'lucide-react';
import { Button } from '../components/Button';

export function Tutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTutors();
  }, [page, searchTerm]);

  async function fetchTutors() {
    try {
      setLoading(true);
      const data = await tutorService.getAll(page, 10, searchTerm);
      setTutors(data.content);
      setTotalPages(data.pageCount || 1);
    } catch (error) {
      console.error('Erro ao buscar tutores', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(newPage: number) {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tutores</h1>
            <p className="text-white">Gerenciamento de Tutores</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input 
                type="text"
                placeholder="Buscar por nome..."
                className="w-full pl-10 pr-4 py-3 bg-surface border border-gray-800 rounded-lg text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder-gray-600"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            
            <Button 
              onClick={() => navigate('/tutores/novo')}
              className="flex items-center justify-center gap-2 px-6 py-3 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              <Plus className="w-5 h-5 text-black" />
              <span className="text-black">NOVO TUTOR</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Carregando dados...</div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-8">
              {tutors.map((tutor) => (
                <div 
                  key={tutor.id} 
                  className="bg-surface rounded-xl border border-gray-800 p-4 sm:p-6 hover:border-primary/50 transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-6 relative"
                >
                  {/* Foto */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 overflow-hidden flex-shrink-0 border-2 border-gray-700 group-hover:border-primary transition-colors">
                    {tutor.foto ? (
                      <img src={tutor.foto.url} alt={tutor.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <User className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-xl font-bold text-white truncate">{tutor.nome}</h3>
                       {/* NOVO ID NEON AQUI */}
                       <span className="text-xs text-cyan-400 font-bold bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-400/20">
                         #{tutor.id}
                       </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 text-sm">
                      <p className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-primary" /> 
                        {tutor.telefone}
                      </p>
                      <p className="flex items-center gap-2 text-gray-300 truncate" title={tutor.endereco}>
                        <MapPin className="w-4 h-4 text-primary" /> 
                        {tutor.endereco}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/tutores/${tutor.id}`)}
                    className="w-full sm:w-auto px-6 py-2 rounded-lg bg-black/40 border border-gray-700 hover:border-primary hover:text-white text-primary font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    Ver Perfil
                    <ChevronRightCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-800 pt-6">
              <span className="text-sm text-gray-400">
                Página <span className="text-white font-bold">{page + 1}</span> de <span className="text-white font-bold">{totalPages}</span>
              </span>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <Button 
                  variant="outline" 
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(page + 1)}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}