import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Upload, Camera, Trash2, Link as LinkIcon, PawPrint } from 'lucide-react';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { tutorService } from '../services/tutorService';
import type { Tutor } from '../types/tutor';

// Interface local para evitar conflito de tipos no formulário
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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TutorFormSchema>();

  // --- MÁSCARAS ---
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
      // Aplica máscara ao carregar
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
      // Limpeza das máscaras antes de enviar
      const payload = { 
        ...data, 
        cpf: Number(data.cpf.replace(/\D/g, '')),
        telefone: data.telefone.replace(/\D/g, '')
      };

      await tutorService.update(Number(id), payload);
      alert('Dados atualizados!');
      loadTutor(Number(id));
    } catch (error) {
      alert('Erro ao atualizar.');
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
      alert('Pet vinculado com sucesso!');
    } catch (error) {
      alert('Erro ao vincular. Verifique se o ID do Pet existe.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnlinkPet(petId: number) {
    if (!id || !confirm('Tem certeza que deseja remover este pet do tutor?')) return;
    try {
      setIsLoading(true);
      await tutorService.unlinkPet(Number(id), petId);
      await loadTutor(Number(id));
    } catch (error) {
      alert('Erro ao desvincular.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!tutor) return <div className="text-center py-20 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/tutores')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> <span>Voltar</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA */}
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
              
              {/* ID NEON */}
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
              <p className="text-xs text-gray-500 mt-2">
                Digite o ID de um pet existente para adicioná-lo a este tutor.
              </p>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-surface border border-gray-800 rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Editar Informações</h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Modo Edição</span>
              </div>
              
              <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
                <Input 
                  label="Nome" 
                  maxLength={80} 
                  {...register('nome', { required: true })} 
                  error={errors.nome?.message} 
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
                  />
                  <Input 
                    label="CPF" 
                    maxLength={14}
                    {...register('cpf', { 
                       required: true,
                       onChange: (e) => setValue('cpf', maskCPF(e.target.value))
                    })} 
                    error={errors.cpf?.message} 
                  />
                </div>
                <Input 
                  label="Endereço" 
                  maxLength={150}
                  {...register('endereco')} 
                  error={errors.endereco?.message} 
                />
                
                <div className="flex justify-end pt-2">
                   <Button type="submit" isLoading={isLoading} className="gap-2"><Save className="w-4 h-4" /> Salvar</Button>
                </div>
              </form>
            </div>

            {/* LISTA DE PETS DA FAMÍLIA */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-primary" /> Pets da Família
              </h2>
              
              {!tutor.pets || tutor.pets.length === 0 ? (
                <div className="bg-surface border border-dashed border-gray-800 rounded-xl p-8 text-center text-gray-500">
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
                        onClick={() => handleUnlinkPet(pet.id)}
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