import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Upload, Camera, User, AlertCircle, ChevronRight, Trash2, Pencil, X, Copy, Check, Maximize2 } from 'lucide-react';

import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { usePetDetails } from '../hooks/usePetDetails';
import type { PetRequest } from '../types/pet';

export function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    pet, tutors, isLoading, isEditing, isZoomOpen, copied, previewUrl, modalConfig,
    setIsEditing, setIsZoomOpen, setModalConfig, handleCopyId, handlePhotoSelect, cancelEdit, updatePet, requestDelete 
  } = usePetDetails(id);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PetRequest>();
  const currentSpecies = watch('especie');

  useEffect(() => {
    if (pet && !isEditing) {
      setValue('nome', pet.nome);
      setValue('raca', pet.raca);
      setValue('idade', pet.idade);
      if (pet.especie) setValue('especie', pet.especie);
    }
  }, [pet, isEditing, setValue]);

  if (!pet) return <div className="text-center py-20 text-white animate-pulse">Carregando dados do pet...</div>;

  const displayImage = previewUrl || pet.foto?.url;

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

      {isZoomOpen && displayImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={displayImage} 
              alt={pet.nome} 
              className="w-full h-full object-contain rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <button 
          onClick={() => navigate('/pets')} 
          className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-white">Prontuário do Pet</h1>
           <p className="text-gray-200 text-sm">Gerencie informações clínicas e cadastrais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg">
            
            <div 
              className={`w-48 h-48 rounded-2xl bg-black/40 overflow-hidden mb-6 relative group border-2 border-white/5 shadow-2xl transition-all ${!isEditing && displayImage ? 'cursor-zoom-in' : ''}`}
              onClick={() => {
                if (!isEditing && displayImage) setIsZoomOpen(true);
              }}
            >
              {displayImage ? (
                <img src={displayImage} alt={pet.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600"><Camera className="w-12 h-12 opacity-50" /></div>
              )}

              {isEditing ? (
                <label className="absolute inset-0 bg-black/60 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all backdrop-blur-[2px]">
                  <Upload className="w-8 h-8 text-primary" />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">Alterar Foto</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => e.target.files?.length && handlePhotoSelect(e.target.files[0])} 
                  />
                </label>
              ) : (
                displayImage && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]">
                    <Maximize2 className="w-8 h-8 text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">Ampliar</span>
                  </div>
                )
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-1">{pet.nome}</h2>
            <p className="text-primary text-sm font-bold uppercase tracking-wider mb-2">
              {currentSpecies ? `${currentSpecies} • ` : ''}{pet.raca}
            </p>
            
            <button 
              onClick={handleCopyId}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-950/50 transition-all cursor-pointer group active:scale-95 mb-4"
              title="Clique para copiar o ID"
            >
              <span className="font-bold text-xs">ID #{pet.id}</span>
              {copied ? <Check className="w-3 h-3 animate-in zoom-in" /> : <Copy className="w-3 h-3 group-hover:scale-110 transition-transform" />}
            </button>
            {copied && <span className="text-[10px] text-cyan-400 -mt-3 mb-2 animate-in fade-in">Copiado!</span>}
          </div>

          <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                <User className="w-4 h-4 text-primary" /> Tutores Responsáveis
              </h3>
              <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{tutors.length}</span>
            </div>
            
            {tutors.length > 0 ? (
              <div className="space-y-3">
                {tutors.map((tutor) => (
                  <div 
                    key={tutor.id} 
                    onClick={() => navigate(`/tutores/${tutor.id}`)}
                    className="bg-black/20 rounded-xl p-3 border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors">
                        {tutor.foto ? <img src={tutor.foto.url} className="w-full h-full object-cover" alt={tutor.nome}/> : <User className="w-6 h-6 text-gray-400"/>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-base truncate group-hover:text-primary transition-colors">{tutor.nome}</p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Ver perfil completo</p>
                    </div>

                    <div className="p-2 rounded-lg text-gray-500 group-hover:text-white group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                <p className="text-gray-300 text-sm font-medium">Sem tutor vinculado</p>
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
                 <p className="text-gray-300 text-sm mt-1">Informações detalhadas do animal</p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={requestDelete}
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
            
            <form onSubmit={handleSubmit(updatePet)} className="space-y-6">
              <Input label="Nome do Pet" {...register('nome')} error={errors.nome?.message} disabled={!isEditing} />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Input label="Espécie" placeholder="Ex: Cachorro, Gato..." {...register('especie')} disabled={!isEditing} />
                  {isEditing && (
                    <div className="flex items-start gap-2 mt-2 opacity-60 bg-yellow-500/5 p-2 rounded">
                      <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-gray-300 leading-tight">Campo informativo.</p>
                    </div>
                  )}
                </div>
                <Input label="Raça" {...register('raca')} error={errors.raca?.message} disabled={!isEditing} />
              </div>
              <Input 
                label="Idade (anos)" 
                type="number" 
                {...register('idade', { valueAsNumber: true })} 
                error={errors.idade?.message} 
                disabled={!isEditing} 
              />
              
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5 mt-8 animate-in fade-in slide-in-from-bottom-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={cancelEdit} 
                    className="gap-2 border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
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