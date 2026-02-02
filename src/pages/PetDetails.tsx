import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Upload, Camera, User, Phone, AlertCircle, ChevronRight, Trash2, Pencil, X, MapPin, MessageCircle } from 'lucide-react';

import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { petService } from '../services/petService';
import type { Pet, PetRequest } from '../types/pet';
import type { Tutor } from '../types/tutor';

export function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    variant: 'danger' as 'danger' | 'success',
    singleButton: false,
    onConfirm: () => {}
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PetRequest>();
  const currentSpecies = watch('especie');

  const getMapLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const getPhoneLink = (phone: string) => `tel:${phone.replace(/\D/g,'')}`;
  const getWhatsAppLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g,'')}`;

  useEffect(() => {
    if (id) loadPet(Number(id));
  }, [id]);

  async function loadPet(petId: number) {
    try {
      const data = await petService.getById(petId);
      setPet(data);
      setValue('nome', data.nome);
      setValue('raca', data.raca);
      setValue('idade', data.idade);
      if (data.especie) setValue('especie', data.especie);
      if (data.tutores) setTutors(data.tutores);
    } catch (error) {
      console.error('Erro ao carregar pet', error);
      navigate('/pets');
    }
  }

  async function handleUpdate(data: PetRequest) {
    if (!id) return;
    try {
      setIsLoading(true);
      await petService.update(Number(id), data);
      
      setModalConfig({
        isOpen: true,
        title: 'Sucesso!',
        description: 'Os dados do pet foram atualizados corretamente.',
        variant: 'success',
        singleButton: true,
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          setIsEditing(false);
          loadPet(Number(id));
        }
      });

    } catch (error) {
      alert('Erro ao atualizar.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDeleteRequest() {
    setModalConfig({
      isOpen: true,
      title: 'Excluir Pet?',
      description: `Tem certeza que deseja remover "${pet?.nome}"? Essa ação é irreversível.`,
      variant: 'danger',
      singleButton: false,
      onConfirm: confirmDelete
    });
  }

  async function confirmDelete() {
    if (!id) return;
    try {
      setIsLoading(true);
      await petService.delete(Number(id));
      navigate('/pets');
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir pet.');
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    if (pet) {
      setValue('nome', pet.nome);
      setValue('raca', pet.raca);
      setValue('idade', pet.idade);
      if (pet.especie) setValue('especie', pet.especie);
    }
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length || !id) return;
    try {
      setIsLoading(true);
      await petService.uploadPhoto(Number(id), event.target.files[0]);
      await loadPet(Number(id));
      
      setModalConfig({
        isOpen: true,
        title: 'Foto Atualizada',
        description: 'A nova foto do pet foi salva com sucesso!',
        variant: 'success',
        singleButton: true,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });

    } catch (error) {
      alert('Falha ao enviar foto.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!pet) return <div className="text-center py-20 text-white animate-pulse">Carregando dados do pet...</div>;

  return (
    <div className="space-y-6">
      
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        singleButton={modalConfig.singleButton}
        isLoading={isLoading}
      />

      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <button 
          onClick={() => navigate('/pets')} 
          className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-white">Prontuário do Pet</h1>
           <p className="text-gray-400 text-sm">Gerencie informações clínicas e cadastrais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg">
            <div className="w-48 h-48 rounded-2xl bg-black/40 overflow-hidden mb-6 relative group border-2 border-white/5 shadow-2xl">
              {pet.foto ? (
                <img src={pet.foto.url} alt={pet.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600"><Camera className="w-12 h-12 opacity-50" /></div>
              )}
              <label className="absolute inset-0 bg-black/60 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all backdrop-blur-[2px]">
                <Upload className="w-8 h-8 text-primary" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">Alterar Foto</span>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-1">{pet.nome}</h2>
            <p className="text-primary text-sm font-bold uppercase tracking-wider mb-4">
              {currentSpecies ? `${currentSpecies} • ` : ''}{pet.raca}
            </p>
            <span className="text-xs text-cyan-400 font-bold bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-400/20">
              ID: #{pet.id}
            </span>
          </div>

          <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                <User className="w-4 h-4 text-primary" /> Tutores Responsáveis
              </h3>
              <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{tutors.length}</span>
            </div>
            
            {tutors.length > 0 ? (
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <div key={tutor.id} className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                         {tutor.foto ? <img src={tutor.foto.url} className="w-full h-full object-cover"/> : <User className="w-5 h-5 text-gray-400"/>}
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="text-white font-bold text-sm truncate" title={tutor.nome}>{tutor.nome}</p>
                        <p className="text-xs text-gray-400">{tutor.telefone}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                        <a href={getWhatsAppLink(tutor.telefone)} target="_blank" rel="noopener noreferrer" className="col-span-1 p-2 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors" title="WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                        </a>
                        <a href={getPhoneLink(tutor.telefone)} className="col-span-1 p-2 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors" title="Ligar">
                            <Phone className="w-4 h-4" />
                        </a>
                        <a href={getMapLink(tutor.endereco)} target="_blank" rel="noopener noreferrer" className="col-span-1 p-2 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title="Endereço">
                            <MapPin className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => navigate(`/tutores/${tutor.id}`)}
                          className="col-span-1 p-2 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Ver Perfil"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                <p className="text-gray-400 text-sm font-medium">Sem tutor vinculado</p>
                <p className="text-xs text-gray-500 mt-1">Vincule através da tela de Tutores</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <div>
                 <h2 className="text-xl font-bold text-white">Dados Cadastrais</h2>
                 <p className="text-xs text-gray-500 mt-1">Informações detalhadas do animal</p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={handleDeleteRequest}
                      className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                      title="Excluir Pet"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary hover:text-black text-primary border border-primary/20 hover:border-primary rounded-lg font-bold text-xs uppercase tracking-wide transition-all"
                    >
                      <Pencil className="w-4 h-4" /> Editar
                    </button>
                  </>
                ) : (
                  <span className="flex items-center gap-2 text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full font-bold border border-yellow-500/20 animate-pulse">
                    <Pencil className="w-3 h-3" /> Modo Edição
                  </span>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
              <Input label="Nome do Pet" {...register('nome')} error={errors.nome?.message} disabled={!isEditing} />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Input label="Espécie" placeholder="Ex: Cachorro, Gato..." {...register('especie')} disabled={!isEditing} />
                  {isEditing && (
                    <div className="flex items-start gap-2 mt-2 opacity-60 bg-yellow-500/5 p-2 rounded">
                      <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-gray-400 leading-tight">Campo informativo (não persistido na API atual).</p>
                    </div>
                  )}
                </div>
                <Input label="Raça" {...register('raca')} error={errors.raca?.message} disabled={!isEditing} />
              </div>
              <Input label="Idade (anos)" type="number" {...register('idade')} error={errors.idade?.message} disabled={!isEditing} />
              
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5 mt-8 animate-in fade-in slide-in-from-bottom-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit} 
                    className="gap-2 border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <X className="w-4 h-4" /> CANCELAR
                  </Button>
                  <Button type="submit" isLoading={isLoading} className="gap-2 min-w-[140px] shadow-lg shadow-primary/20">
                    <Save className="w-4 h-4" /> SALVAR
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}