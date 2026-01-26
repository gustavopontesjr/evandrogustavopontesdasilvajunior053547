import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Upload, Camera, Trash2, Link as LinkIcon, PawPrint, Pencil, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { tutorService } from '../services/tutorService';
import type { Tutor } from '../types/tutor';

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
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [petIdToLink, setPetIdToLink] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    variant: 'danger' as 'danger' | 'success',
    singleButton: false,
    onConfirm: () => {}
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TutorFormSchema>();

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
    if (id) loadTutor(Number(id));
  }, [id]);

  async function loadTutor(tutorId: number) {
    try {
      const data = await tutorService.getById(tutorId);
      setTutor(data);
      
      setValue('nome', data.nome);
      setValue('email', data.email);
      setValue('telefone', maskPhone(data.telefone));
      setValue('cpf', maskCPF(data.cpf));
      setValue('endereco', data.endereco);
    } catch (error) {
      console.error('Erro ao carregar', error);
      navigate('/tutores');
    }
  }

  async function handleUpdate(data: TutorFormSchema) {
    if (!id) return;
    try {
      setIsLoading(true);
      const payload = { 
        ...data, 
        cpf: Number(data.cpf.replace(/\D/g, '')),
        telefone: data.telefone.replace(/\D/g, '')
      };

      await tutorService.update(Number(id), payload);
      
      setModalConfig({
        isOpen: true,
        title: 'Sucesso!',
        description: 'Dados do tutor atualizados corretamente.',
        variant: 'success',
        singleButton: true,
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          setIsEditing(false);
          loadTutor(Number(id));
        }
      });
    } catch (error) {
      alert('Erro ao atualizar.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDeleteTutorRequest() {
    setModalConfig({
      isOpen: true,
      title: 'Excluir Tutor?',
      description: `Tem certeza que deseja remover "${tutor?.nome}"? Isso removerá o acesso dele e desvinculará todos os pets.`,
      variant: 'danger',
      singleButton: false,
      onConfirm: confirmDeleteTutor
    });
  }

  async function confirmDeleteTutor() {
    if (!id) return;
    try {
      setIsLoading(true);
      await tutorService.delete(Number(id));
      navigate('/tutores');
    } catch (error) {
      alert('Erro ao excluir tutor.');
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } finally {
      setIsLoading(false);
    }
  }

  function handleUnlinkPetRequest(petId: number) {
    setModalConfig({
      isOpen: true,
      title: 'Desvincular Pet?',
      description: 'Tem certeza que deseja remover este pet da lista do tutor?',
      variant: 'danger',
      singleButton: false,
      onConfirm: () => confirmUnlinkPet(petId)
    });
  }

  async function confirmUnlinkPet(petId: number) {
    if (!id) return;
    try {
      setIsLoading(true);
      await tutorService.unlinkPet(Number(id), petId);
      
      setModalConfig(prev => ({ ...prev, isOpen: false }));
      await loadTutor(Number(id));
    } catch (error) {
      alert('Erro ao desvincular.');
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length || !id) return;
    try {
      setIsLoading(true);
      await tutorService.uploadPhoto(Number(id), event.target.files[0]);
      await loadTutor(Number(id));
      
      setModalConfig({
        isOpen: true,
        title: 'Foto Atualizada',
        description: 'A nova foto do tutor foi salva!',
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

  async function handleLinkPet() {
    if (!id || !petIdToLink) return;
    try {
      setIsLoading(true);
      await tutorService.linkPet(Number(id), Number(petIdToLink));
      setPetIdToLink('');
      await loadTutor(Number(id));
      
      setModalConfig({
        isOpen: true,
        title: 'Pet Vinculado!',
        description: 'O pet foi adicionado à família com sucesso.',
        variant: 'success',
        singleButton: true,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      alert('Erro ao vincular. Verifique o ID.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    if (tutor) {
      setValue('nome', tutor.nome);
      setValue('telefone', maskPhone(tutor.telefone));
      setValue('cpf', maskCPF(tutor.cpf));
      setValue('endereco', tutor.endereco);
    }
  }

  if (!tutor) return <div className="text-center py-20 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* CORRIGIDO: Botão Voltar agora é branco */}
        <button onClick={() => navigate('/tutores')} className="flex items-center gap-2 text-white hover:text-gray-200 mb-6">
          <ArrowLeft className="w-4 h-4" /> <span>Voltar</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-gray-800 rounded-xl p-6 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-black/50 overflow-hidden mb-4 relative group border-4 border-gray-800">
                {tutor.foto ? (
                  <img src={tutor.foto.url} alt={tutor.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600"><Camera className="w-10 h-10" /></div>
                )}
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <h2 className="text-xl font-bold text-white text-center">{tutor.nome}</h2>
              <p className="text-gray-400 text-sm mt-1 mb-2">{tutor.email}</p>
              
              <p className="text-xs text-cyan-400 font-bold bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-400/20">
                ID: #{tutor.id}
              </p>
            </div>

            <div className="bg-surface border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" /> Vincular Novo Pet
              </h3>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="ID do Pet" 
                  className="w-full bg-black/20 border border-gray-700 rounded px-3 text-white focus:border-primary outline-none"
                  value={petIdToLink}
                  onChange={e => setPetIdToLink(e.target.value)}
                />
                <Button onClick={handleLinkPet} disabled={!petIdToLink || isLoading} className="whitespace-nowrap">
                  Vincular
                </Button>
              </div>
              {/* CORRIGIDO: Mensagem de ajuda agora é branca */}
              <p className="text-xs text-white mt-2">
                Digite o ID de um pet existente para adicioná-lo a este tutor.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-surface border border-gray-800 rounded-xl p-8 relative">
              
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-white">Editar Informações</h2>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={handleDeleteTutorRequest}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Excluir Tutor"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-sm transition-all"
                      >
                        <Pencil className="w-4 h-4" /> EDITAR
                      </button>
                    </>
                  ) : (
                    <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold animate-pulse">
                      Editando...
                    </span>
                  )}
                </div>
              </div>
              
              <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
                <Input 
                  label="Nome" 
                  maxLength={80} 
                  {...register('nome', { required: true })} 
                  error={errors.nome?.message} 
                  disabled={!isEditing}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Telefone" 
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
                  label="Endereço" 
                  maxLength={150}
                  {...register('endereco')} 
                  error={errors.endereco?.message} 
                  disabled={!isEditing}
                />
                
                {isEditing && (
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-800 mt-6 animate-in fade-in slide-in-from-bottom-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit} 
                      className="gap-2 border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
                    >
                      <X className="w-4 h-4" /> CANCELAR
                    </Button>

                    <Button type="submit" isLoading={isLoading} className="gap-2 min-w-[140px]">
                      <Save className="w-4 h-4" /> SALVAR
                    </Button>
                  </div>
                )}
              </form>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-primary" /> Pets da Família
              </h2>
              
              {!tutor.pets || tutor.pets.length === 0 ? (
                /* CORRIGIDO: Mensagem de "sem pets" agora é branca */
                <div className="bg-surface border border-dashed border-gray-800 rounded-xl p-8 text-center text-white">
                  Este tutor ainda não tem pets vinculados.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tutor.pets.map((pet) => (
                    <div key={pet.id} className="bg-surface border border-gray-800 rounded-lg p-4 flex items-center justify-between group hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-black/50 overflow-hidden">
                           {pet.foto ? <img src={pet.foto.url} className="w-full h-full object-cover"/> : <PawPrint className="w-6 h-6 m-3 text-gray-700"/>}
                        </div>
                        <div>
                          <p className="text-white font-bold">{pet.nome}</p>
                          <p className="text-xs text-primary uppercase">{pet.raca}</p>
                          <p className="text-xs text-cyan-400 font-bold">ID: {pet.id}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleUnlinkPetRequest(pet.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Desvincular Pet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}