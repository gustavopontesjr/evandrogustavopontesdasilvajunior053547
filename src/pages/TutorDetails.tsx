import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Upload, Camera, Trash2, Link as LinkIcon, PawPrint, Pencil, X, Phone, MapPin, MessageCircle, Maximize2 } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useTutorDetails } from '../hooks/useTutorDetails';

interface TutorFormSchema {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
}

export function TutorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tutor, isLoading, petIdToLink, setPetIdToLink, isEditing, setIsEditing, 
    isZoomOpen, setIsZoomOpen, previewUrl, modalConfig, setModalConfig,
    handlePhotoSelect, cancelEdit, updateTutor, requestDeleteTutor, linkPet, requestUnlinkPet
  } = useTutorDetails(id);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TutorFormSchema>();

  const getMapLink = (address: string) => `http://maps.google.com/?q=${encodeURIComponent(address)}`;
  const getPhoneLink = (phone: string) => `tel:${phone.replace(/\D/g,'')}`;
  const getWhatsAppLink = (phone: string) => `https://wa.me/55${phone.replace(/\D/g,'')}`;

  const maskCPF = (value: string | number) => {
    const stringValue = String(value);
    return stringValue
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    return String(value)
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2');
  };

  useEffect(() => {
    if (tutor && !isEditing) {
      setValue('nome', tutor.nome);
      setValue('email', tutor.email);
      setValue('telefone', maskPhone(tutor.telefone));
      setValue('cpf', maskCPF(tutor.cpf));
      setValue('endereco', tutor.endereco);
    }
  }, [tutor, isEditing, setValue]);

  if (!tutor) return <div className="text-center py-20 text-white animate-pulse">Carregando perfil...</div>;

  const displayImage = previewUrl || tutor.foto?.url;

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
              alt={tutor.nome} 
              className="w-full h-full object-contain rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <button 
          onClick={() => navigate('/tutores')} 
          className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-white">Perfil do Tutor</h1>
           <p className="text-gray-200 text-base">Gerencie informações e vínculos</p>
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
                <img src={displayImage} alt={tutor.nome} className="w-full h-full object-cover" />
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

            <h2 className="text-2xl font-bold text-white text-center mb-1">{tutor.nome}</h2>
            
            <div className="flex items-center gap-2 mb-6 mt-2">
                <span className="text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20 tracking-wider">
                  ID #{tutor.id}
                </span>
            </div>

            <div className="w-full grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
                <a href={getWhatsAppLink(tutor.telefone)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-[#25D366]/20 hover:text-[#25D366] text-gray-400 transition-all group">
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Whats</span>
                </a>
                <a href={getPhoneLink(tutor.telefone)} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary text-gray-400 transition-all group">
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Ligar</span>
                </a>
                <a href={getMapLink(tutor.endereco)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-blue-500/20 hover:text-blue-500 text-gray-400 transition-all group">
                    <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Mapa</span>
                </a>
            </div>
          </div>

          <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <LinkIcon className="w-4 h-4 text-primary" /> Vincular Novo Pet
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="ID do Pet" 
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary/50 outline-none text-sm"
                value={petIdToLink}
                onChange={e => setPetIdToLink(e.target.value)}
              />
              <Button onClick={linkPet} disabled={!petIdToLink || isLoading} className="whitespace-nowrap px-4 py-2">
                Vincular
              </Button>
            </div>
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">
              Digite o número de identificação (ID) de um pet já cadastrado no sistema para adicioná-lo à família deste tutor.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative">
            
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
              <div>
                  <h2 className="text-xl font-bold text-white">Dados Pessoais</h2>
                  <p className="text-sm text-gray-200 mt-1">Informações cadastrais e de contato</p>
              </div>
              
              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={requestDeleteTutor}
                      className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                      title="Excluir Tutor"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary hover:text-black text-primary border border-primary/20 hover:border-primary rounded-lg font-bold text-xs uppercase tracking-wide transition-all"
                    >
                      <Pencil className="w-4 h-4" /> Editar Dados
                    </button>
                  </>
                ) : (
                  <span className="flex items-center gap-2 text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full font-bold border border-yellow-500/20 animate-pulse">
                    <Pencil className="w-3 h-3" /> Modo Edição Ativo
                  </span>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit(updateTutor)} className="space-y-5">
              <Input 
                label="Nome Completo" 
                maxLength={80} 
                {...register('nome', { required: true })} 
                error={errors.nome?.message} 
                disabled={!isEditing}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input 
                  label="Telefone (Celular)" 
                  maxLength={15}
                  {...register('telefone', { 
                      required: true,
                      onChange: (e) => setValue('telefone', maskPhone(e.target.value))
                  })} 
                  error={errors.telefone?.message} 
                  disabled={!isEditing}
                />
                <Input 
                  label="CPF" 
                  maxLength={14}
                  {...register('cpf', { 
                      required: true,
                      onChange: (e) => setValue('cpf', maskCPF(e.target.value))
                  })} 
                  error={errors.cpf?.message} 
                  disabled={!isEditing}
                />
              </div>

              <Input 
                  label="E-mail" 
                  type="email"
                  maxLength={100}
                  {...register('email', { required: true })} 
                  error={errors.email?.message} 
                  disabled={!isEditing}
              />

              <Input 
                label="Endereço Completo" 
                maxLength={150}
                {...register('endereco')} 
                error={errors.endereco?.message} 
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
                    <Save className="w-4 h-4" /> SALVAR ALTERAÇÕES
                  </Button>
                </div>
              )}
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                  <PawPrint className="w-5 h-5 text-primary" /> 
              </div>
              Pets da Família
            </h2>
            
            {!tutor.pets || tutor.pets.length === 0 ? (
              <div className="bg-surface/30 border border-dashed border-white/10 rounded-xl p-10 text-center flex flex-col items-center gap-3">
                <PawPrint className="w-12 h-12 text-gray-700" />
                <p className="text-gray-200 font-medium">Este tutor ainda não tem pets vinculados.</p>
                <p className="text-sm text-gray-400">Use o painel à esquerda para adicionar um pet existente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tutor.pets.map((pet) => (
                  <div key={pet.id} className="bg-surface/50 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 hover:bg-surface/80 transition-all cursor-pointer" onClick={() => navigate(`/pets/${pet.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-black/40 overflow-hidden border border-white/5 group-hover:border-primary/50 transition-colors">
                          {pet.foto ? <img src={pet.foto.url} className="w-full h-full object-cover" alt={pet.nome}/> : <PawPrint className="w-6 h-6 m-4 text-gray-700"/>}
                      </div>
                      <div>
                        <p className="text-white font-bold group-hover:text-primary transition-colors">{pet.nome}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{pet.raca}</p>
                        <span className="text-[10px] bg-black/40 text-gray-300 px-2 py-0.5 rounded border border-white/5">ID: {pet.id}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          requestUnlinkPet(pet.id);
                      }}
                      className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Desvincular Pet"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}