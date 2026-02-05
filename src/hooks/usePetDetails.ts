import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { petService } from '../services/petService';
import type { Pet, PetRequest } from '../types/pet';
import type { Tutor } from '../types/tutor';

interface ModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  variant: 'danger' | 'success';
  singleButton: boolean;
  onConfirm: () => void;
}

export function usePetDetails(petId: string | undefined) {
  const navigate = useNavigate();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const loadPet = useCallback(async () => {
    if (!petId) return;
    try {
      const data = await petService.getById(Number(petId));
      setPet(data);
      if (data.tutores) setTutors(data.tutores);
    } catch (error) {
      navigate('/pets');
    }
  }, [petId, navigate]);

  useEffect(() => {
    loadPet();
  }, [loadPet]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCopyId = () => {
    if (!pet) return;
    navigator.clipboard.writeText(String(pet.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const updatePet = async (data: PetRequest) => {
    if (!petId) return;
    try {
      setIsLoading(true);

      const payload = {
        ...data,
        idade: Number(data.idade)
      };
      
      await petService.update(Number(petId), payload);

      if (selectedFile) {
        await petService.uploadPhoto(Number(petId), selectedFile);
      }
      
      setModalConfig({
        isOpen: true,
        title: 'Sucesso!',
        description: 'Os dados do pet foram atualizados.',
        variant: 'success',
        singleButton: true,
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          setIsEditing(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          loadPet();
        }
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar dados. Verifique os campos.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestDelete = () => {
    setModalConfig({
      isOpen: true,
      title: 'Excluir Pet?',
      description: `Tem certeza que deseja remover "${pet?.nome}"? Essa ação é irreversível.`,
      variant: 'danger',
      singleButton: false,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await petService.delete(Number(petId));
          navigate('/pets');
        } catch (error) {
          alert('Erro ao excluir pet.');
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  return {
    pet,
    tutors,
    isLoading,
    isEditing,
    isZoomOpen,
    copied,
    previewUrl,
    modalConfig,
    setIsEditing,
    setIsZoomOpen,
    setModalConfig,
    handleCopyId,
    handlePhotoSelect,
    cancelEdit,
    updatePet,
    requestDelete
  };
}