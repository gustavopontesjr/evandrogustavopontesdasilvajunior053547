import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { tutorService } from '../services/tutorService';

// Interface local para o Formulário (aceita máscaras como string)
interface TutorFormSchema {
  nome: string;
  email: string;
  cpf: string;       // String aqui para aceitar pontos e traços
  telefone: string;  // String aqui para aceitar parenteses
  endereco: string;
}

export function TutorForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Usamos o Schema local para o formulário não reclamar
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TutorFormSchema>();

  // --- MÁSCARAS ---
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2');
  };

  async function handleSave(data: TutorFormSchema) {
    try {
      setIsLoading(true);
      // Limpeza: Remove a máscara antes de enviar para a API
      const payload = { 
        ...data, 
        cpf: Number(data.cpf.replace(/\D/g, '')), // Vira número puro
        telefone: data.telefone.replace(/\D/g, '') // Vira string de números pura
      };
      
      await tutorService.create(payload);
      navigate('/tutores');
    } catch (error) {
      console.error('Erro ao salvar tutor', error);
      alert('Erro ao salvar. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/tutores')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para lista</span>
        </button>

        <div className="bg-surface border border-gray-800 rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Novo Tutor</h1>
          </div>

          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            <Input
              label="Nome Completo"
              placeholder="Ex: João da Silva"
              maxLength={80}
              error={errors.nome?.message}
              {...register('nome', { required: 'Nome é obrigatório' })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                maxLength={14}
                error={errors.cpf?.message}
                {...register('cpf', { 
                  required: 'CPF é obrigatório',
                  onChange: (e) => setValue('cpf', maskCPF(e.target.value))
                })}
              />
              
              <Input
                label="Telefone"
                placeholder="(99) 99999-9999"
                maxLength={15}
                error={errors.telefone?.message}
                {...register('telefone', { 
                  required: 'Telefone é obrigatório',
                  onChange: (e) => setValue('telefone', maskPhone(e.target.value))
                })}
              />
            </div>

            <Input
              label="E-mail"
              type="email"
              maxLength={100}
              placeholder="Ex: joao@email.com"
              error={errors.email?.message}
              {...register('email', { required: 'E-mail é obrigatório' })}
            />

            <Input
              label="Endereço"
              maxLength={150}
              placeholder="Ex: Rua das Flores, 123"
              error={errors.endereco?.message}
              {...register('endereco', { required: 'Endereço é obrigatório' })}
            />

            <div className="pt-4">
              <Button type="submit" isLoading={isLoading} className="w-full gap-2 text-black font-bold">
                <Save className="w-4 h-4" />
                CADASTRAR TUTOR
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}