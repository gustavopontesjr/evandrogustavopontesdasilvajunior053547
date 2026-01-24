import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Upload, Camera, User, Phone, AlertCircle, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { petService } from '../services/petService';
import type { Pet, PetRequest } from '../types/pet';
import type { Tutor } from '../types/tutor';

export function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PetRequest>();

  const currentSpecies = watch('especie');

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
      
      if (data.especie) {
        setValue('especie', data.especie);
      }

      if (data.tutores && data.tutores.length > 0) {
        setTutors(data.tutores);
      } else {
        setTutors([]);
      }

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
      alert('Dados salvos com sucesso!');
      loadPet(Number(id));
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
      await petService.uploadPhoto(Number(id), event.target.files[0]);
      await loadPet(Number(id));
    } catch (error) {
      alert('Falha ao enviar foto.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!pet) return <div className="text-center py-20 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/pets')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> <span>Voltar</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: FOTO E LISTA DE TUTORES */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-surface border border-gray-800 rounded-xl p-6 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-black/50 overflow-hidden mb-4 relative group border-4 border-gray-800">
                {pet.foto ? (
                  <img src={pet.foto.url} alt={pet.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600"><Camera className="w-10 h-10" /></div>
                )}
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <h2 className="text-xl font-bold text-white text-center">{pet.nome}</h2>
              <p className="text-primary text-sm font-bold uppercase">
                {currentSpecies ? `${currentSpecies} • ` : ''}{pet.raca}
              </p>
              
              {/* --- NOVO: ID DO PET AQUI --- */}
              <p className="text-xs text-cyan-400 font-bold mt-2 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-400/20">
                ID: #{pet.id}
              </p>
            </div>

            {/* CARD DE TUTORES */}
            <div className="bg-surface border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                  <User className="w-4 h-4 text-primary" /> Tutores ({tutors.length})
                </h3>
              </div>
              
              {tutors.length > 0 ? (
                <div className="space-y-4">
                  {tutors.map((tutor) => (
                    <div key={tutor.id} className="pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                           {tutor.foto ? <img src={tutor.foto.url} className="w-full h-full object-cover"/> : <User className="w-5 h-5 text-gray-400"/>}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-white font-bold text-sm truncate" title={tutor.nome}>{tutor.nome}</p>
                          <p className="text-xs text-cyan-400 font-bold">ID: {tutor.id}</p>
                        </div>
                      </div>
                      
                      <div className="pl-1">
                        <p className="text-xs text-gray-300 flex items-center gap-2 mb-2">
                           <Phone className="w-3 h-3 text-primary"/> {tutor.telefone}
                        </p>
                        <button 
                          onClick={() => navigate(`/tutores/${tutor.id}`)}
                          className="w-full text-[10px] font-bold text-primary border border-primary/30 rounded py-1.5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-1 uppercase tracking-wider"
                        >
                          VER PERFIL <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-black/20 rounded-lg">
                  <p className="text-gray-500 text-sm italic">Este pet não possui tutor vinculado.</p>
                  <p className="text-xs text-gray-600 mt-2">Vincule-o através da tela de Tutores.</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: FORMULÁRIO */}
          <div className="md:col-span-2">
            <div className="bg-surface border border-gray-800 rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Editar Dados</h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Modo Edição</span>
              </div>
              
              <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
                <Input label="Nome do Pet" {...register('nome')} error={errors.nome?.message} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input 
                      label="Espécie" 
                      placeholder="Ex: Cachorro, Gato..." 
                      {...register('especie')} 
                    />
                    <div className="flex items-start gap-1 mt-1.5 opacity-60">
                      <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Atenção: A API atual não persiste este campo.
                      </p>
                    </div>
                  </div>
                  
                  <Input label="Raça" {...register('raca')} error={errors.raca?.message} />
                </div>

                <Input label="Idade" type="number" {...register('idade')} error={errors.idade?.message} />
                
                <div className="flex justify-end pt-4">
                   <Button type="submit" isLoading={isLoading} className="gap-2 w-full sm:w-auto">
                     <Save className="w-4 h-4" /> SALVAR ALTERAÇÕES
                   </Button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}