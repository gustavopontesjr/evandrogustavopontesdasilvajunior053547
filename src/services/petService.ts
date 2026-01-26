import { api } from './api';
import type { PaginatedResponse } from '../types/pagination';
import type { Pet, PetRequest } from '../types/pet';

const BASE_URL = 'https://pet-manager-api.geia.vip';

export const petService = {
  getAll: async (page = 0, size = 10, nome = '') => {
    const params = { page, size, nome };
    const response = await api.get<PaginatedResponse<Pet>>('/v1/pets', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Pet>(`/v1/pets/${id}`);
    return response.data;
  },

  create: async (data: PetRequest) => {
    const response = await api.post<Pet>('/v1/pets', data);
    return response.data;
  },

  update: async (id: number, data: PetRequest) => {
    const response = await api.put<Pet>(`/v1/pets/${id}`, data);
    return response.data;
  },

  // --- NOVO: FUNÇÃO DE DELETAR ---
  delete: async (id: number) => {
    const response = await api.delete(`/v1/pets/${id}`);
    return response.data;
  },

  uploadPhoto: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('foto', file); 

    const token = localStorage.getItem('access_token');

    const response = await fetch(`${BASE_URL}/v1/pets/${id}/fotos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar foto');
    }

    return response.json();
  }
};