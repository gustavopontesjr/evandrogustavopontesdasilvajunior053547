import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, PlusCircle, Bug } from 'lucide-react';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { petService } from '../services/petService';
import type { PetRequest } from '../types/pet';

export function PetForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PetRequest>();

  async function handleSave(data: PetRequest) {
    try {
      setIsLoading(true);
      await petService.create(data);
      navigate('/pets');
    } catch (error) {
      console.error('Erro ao criar pet', error);
      alert('Erro ao cadastrar pet.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/pets')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para lista</span>
        </button>

        <div className="bg-surface border border-gray-800 rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PlusCircle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Novo Pet</h1>
          </div>

          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            <Input
              label="Nome do Pet"
              placeholder="Ex: Rex"
              error={errors.nome?.message}
              {...register('nome', { required: 'Nome é obrigatório' })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CAMPO DE TEXTO AQUI TAMBÉM */}
              <div>
                <Input
                  label="Espécie"
                  placeholder="Ex: Cachorro, Gato..."
                  error={errors.especie?.message}
                  {...register('especie', { required: 'Espécie é obrigatória' })}
                />
                 <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 opacity-70">
                    <Bug className="w-3 h-3" /> Campo exigido no layout, não persistido pela API.
                 </p>
              </div>

              <Input
                label="Raça"
                placeholder="Ex: Labrador"
                error={errors.raca?.message}
                {...register('raca', { required: 'Raça é obrigatória' })}
              />
            </div>

            <Input
              label="Idade (anos)"
              type="number"
              placeholder="Ex: 5"
              error={errors.idade?.message}
              {...register('idade', { 
                required: 'Idade é obrigatória',
                min: { value: 0, message: 'Idade inválida' }
              })}
            />

            <div className="pt-4">
              <Button type="submit" isLoading={isLoading} className="w-full gap-2 text-black font-bold">
                <Save className="w-4 h-4" />
                CADASTRAR PET
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}