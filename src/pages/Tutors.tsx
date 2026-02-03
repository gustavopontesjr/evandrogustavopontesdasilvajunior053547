import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Phone, ChevronLeft, ChevronRight, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { tutorService } from '../services/tutorService';
import type { Tutor } from '../types/tutor';

export function Tutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchTutors();
  }, [page, searchTerm]);

  async function fetchTutors() {
    try {
      setLoading(true);
      const data = await tutorService.getAll(page, 10, searchTerm);
      setTutors(data.content);
      setTotalPages(data.pageCount || 1);
      setImgError({});
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

  function formatPhone(phone: string) {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (clean.length === 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  const getWhatsAppLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g,'')}`;

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Tutores</h1>
          <p className="text-gray-400 font-medium text-sm">Gerencie sua base de clientes</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500 z-10 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar tutor..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface/50 border border-white/10 rounded-lg text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all placeholder-gray-500 text-sm shadow-sm backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </div>
          
          <Button 
            onClick={() => navigate('/tutores/novo')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 font-bold bg-primary text-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">NOVO TUTOR</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-gray-500 text-sm animate-pulse">Carregando...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            
            <button 
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
                className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-surface/50 text-gray-400 hover:text-primary hover:border-primary hover:bg-surface transition-all disabled:opacity-0 disabled:cursor-not-allowed flex-shrink-0"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4">
                {tutors.map((tutor) => (
                <div 
                    key={tutor.id} 
                    className="group relative bg-surface/40 backdrop-blur-md border border-white/5 rounded-xl p-4 transition-all duration-300 hover:bg-surface/60 hover:border-white/10 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/tutores/${tutor.id}`)}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative flex items-center gap-5">
                        
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors bg-black/40 shadow-lg">
                                {tutor.foto && !imgError[tutor.id] ? (
                                    <img 
                                    src={tutor.foto.url} 
                                    alt={tutor.nome} 
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(prev => ({ ...prev, [tutor.id]: true }))}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <User className="w-10 h-10 opacity-50" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-center h-24">
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors truncate pr-2 leading-tight">
                                {tutor.nome}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="p-1.5 rounded bg-white/5 group-hover:bg-[#25D366]/10 transition-colors">
                                    <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                                </div>
                                <span className="font-mono tracking-wide text-sm">{formatPhone(tutor.telefone)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-32 shrink-0">
                            
                            <a 
                                href={getWhatsAppLink(tutor.telefone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-transparent border border-[#25D366]/50 rounded-lg text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold text-[10px] uppercase tracking-wide transition-all w-full shadow-sm group/whatsapp"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WHATSAPP
                            </a>

                            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-transparent border border-white/20 rounded-lg text-white hover:bg-white hover:text-black hover:border-white font-bold text-[10px] uppercase tracking-wide transition-all w-full group/btn shadow-sm">
                                VER PERFIL
                                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>

                        </div>

                    </div>
                </div>
                ))}
            </div>

            <button 
                disabled={page >= totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
                className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-surface/50 text-gray-400 hover:text-primary hover:border-primary hover:bg-surface transition-all disabled:opacity-0 disabled:cursor-not-allowed flex-shrink-0"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          <div className="flex items-center justify-center pt-4">
             <div className="flex items-center gap-4 lg:hidden">
                <Button 
                    variant="ghost" 
                    disabled={page === 0}
                    onClick={() => handlePageChange(page - 1)}
                    className="w-10 h-10 p-0 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="px-6 py-2 bg-black/40 rounded-lg border border-white/5 flex items-center min-w-[100px] justify-center">
                    <span className="text-sm font-medium text-gray-400">
                        <span className="text-white font-bold">{page + 1}</span> <span className="mx-1 text-gray-600">/</span> {totalPages}
                    </span>
                </div>

                <Button 
                    variant="ghost" 
                    disabled={page >= totalPages - 1}
                    onClick={() => handlePageChange(page + 1)}
                    className="w-10 h-10 p-0 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
             </div>

             <div className="hidden lg:flex px-6 py-2 bg-black/40 rounded-lg border border-white/5 items-center min-w-[100px] justify-center">
                <span className="text-sm font-medium text-gray-400">
                    <span className="text-white font-bold">{page + 1}</span> <span className="mx-1 text-gray-600">/</span> {totalPages}
                </span>
             </div>
          </div>
        </>
      )}
    </div>
  );
}