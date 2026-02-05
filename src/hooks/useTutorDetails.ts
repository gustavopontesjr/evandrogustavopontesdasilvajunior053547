import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorService } from '../services/tutorService';
import type { Tutor } from '../types/tutor';

interface TutorFormSchema {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
}

interface ModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  variant: 'danger' | 'success';
  singleButton: boolean;
  onConfirm: () => void;
}

export function useTutorDetails(tutorId: string | undefined) {
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [petIdToLink, setPetIdToLink] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'success',
    singleButton: false,
    onConfirm: () => {}
  });

  const loadTutor = useCallback(async () => {
    if (!tutorId) return;
    try {
      const data = await tutorService.getById(Number(tutorId));
      setTutor(data);
    } catch (error) {
      navigate('/tutores');
    }
  }, [tutorId, navigate]);

  useEffect(() => {
    loadTutor();
  }, [loadTutor]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePhotoSelect = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const updateTutor = async (data: TutorFormSchema) => {
    if (!tutorId) return;
    try {
      setIsLoading(true);
      
      const payload = { 
        ...data, 
        cpf: Number(data.cpf.replace(/\D/g, '')),
        telefone: data.telefone.replace(/\D/g, '')
      };

      await tutorService.update(Number(tutorId), payload);

      if (selectedFile) {
        await tutorService.uploadPhoto(Number(tutorId), selectedFile);
      }
      
      setModalConfig({
        isOpen: true,
        title: 'Sucesso!',
        description: 'Dados do tutor atualizados corretamente.',
        variant: 'success',
        singleButton: true,
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          setIsEditing(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          loadTutor();
        }
      });
    } catch (error) {
      alert('Erro ao atualizar.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestDeleteTutor = () => {
    setModalConfig({
      isOpen: true,
      title: 'Excluir Tutor?',
      description: `Tem certeza que deseja remover "${tutor?.nome}"? Isso removerá o acesso dele e desvinculará todos os pets.`,
      variant: 'danger',
      singleButton: false,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await tutorService.delete(Number(tutorId));
          navigate('/tutores');
        } catch (error) {
          alert('Erro ao excluir tutor.');
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const linkPet = async () => {
    if (!tutorId || !petIdToLink) return;
    try {
      setIsLoading(true);
      await tutorService.linkPet(Number(tutorId), Number(petIdToLink));
      setPetIdToLink('');
      await loadTutor();
      
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
  };

  const requestUnlinkPet = (petId: number) => {
    setModalConfig({
      isOpen: true,
      title: 'Desvincular Pet?',
      description: 'Tem certeza que deseja remover este pet da lista do tutor?',
      variant: 'danger',
      singleButton: false,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await tutorService.unlinkPet(Number(tutorId), petId);
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          await loadTutor();
        } catch (error) {
          alert('Erro ao desvincular.');
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  return {
    tutor,
    isLoading,
    petIdToLink,
    setPetIdToLink,
    isEditing,
    setIsEditing,
    isZoomOpen,
    setIsZoomOpen,
    previewUrl,
    modalConfig,
    setModalConfig,
    handlePhotoSelect,
    cancelEdit,
    updateTutor,
    requestDeleteTutor,
    linkPet,
    requestUnlinkPet
  };
}