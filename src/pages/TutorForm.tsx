import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus, Camera, Upload, User } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { tutorService } from '../services/tutorService';

interface TutorFormSchema {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
}

export function TutorForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TutorFormSchema>();

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

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }

  async function handleSave(data: TutorFormSchema) {
    try {
      setIsLoading(true);
      
      const payload = { 
        ...data, 
        cpf: Number(data.cpf.replace(/\D/g, '')),
        telefone: data.telefone.replace(/\D/g, '')
      };
      
      const newTutor = await tutorService.create(payload);

      if (selectedFile && newTutor && newTutor.id) {
        await tutorService.uploadPhoto(newTutor.id, selectedFile);
      }

      navigate('/tutores');
    } catch (error) {
      console.error('Erro ao salvar tutor', error);
      alert('Erro ao salvar. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <button 
        onClick={() => navigate('/tutores')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-200 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Voltar para lista</span>
      </button>

      <div className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(0,230,184,0.1)]">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <div>
             <h1 className="text-2xl font-bold text-white">Novo Tutor</h1>
             <p className="text-gray-300 text-sm">Preencha os dados para cadastrar um cliente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleSave)} className="space-y-8 relative">
          
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative group">
              <div className={`w-40 h-40 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all duration-300 ${preview ? 'border-primary shadow-[0_0_20px_rgba(0,230,184,0.3)]' : 'border-dashed border-gray-600 hover:border-primary/50 bg-black/20'}`}>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400 group-hover:text-primary/80 transition-colors" />
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <span className="text-sm text-gray-300 font-medium">
              {preview ? 'Clique na imagem para alterar' : 'Adicionar foto (Opcional)'}
            </span>
          </div>

          <div className="space-y-6">
            <Input
              label="Nome Completo"
              placeholder="Ex: João da Silva"
              maxLength={80}
              error={errors.nome?.message}
              {...register('nome', { required: 'Nome é obrigatório' })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="pt-4">
            <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full h-12 gap-2 text-black font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-base"
            >
              <Save className="w-5 h-5" />
              CADASTRAR TUTOR
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}