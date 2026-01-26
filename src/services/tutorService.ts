import { api } from './api';
import type { PaginatedResponse } from '../types/pagination';
import type { Tutor, TutorRequest } from '../types/tutor';

const BASE_URL = 'https://pet-manager-api.geia.vip';

export const tutorService = {
  getAll: async (page = 0, size = 10, nome = '') => {
    const params = { page, size, nome };
    const response = await api.get<PaginatedResponse<Tutor>>('/v1/tutores', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Tutor>(`/v1/tutores/${id}`);
    return response.data;
  },

  create: async (data: TutorRequest) => {
    const response = await api.post<Tutor>('/v1/tutores', data);
    return response.data;
  },

  update: async (id: number, data: TutorRequest) => {
    const response = await api.put<Tutor>(`/v1/tutores/${id}`, data);
    return response.data;
  },

  // --- NOVO: FUNÇÃO DELETAR ---
  delete: async (id: number) => {
    const response = await api.delete(`/v1/tutores/${id}`);
    return response.data;
  },

  // --- FUNÇÕES DE VÍNCULO ---
  linkPet: async (tutorId: number, petId: number) => {
    const response = await api.post(`/v1/tutores/${tutorId}/pets/${petId}`);
    return response.data;
  },

  unlinkPet: async (tutorId: number, petId: number) => {
    const response = await api.delete(`/v1/tutores/${tutorId}/pets/${petId}`);
    return response.data;
  },

  uploadPhoto: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('foto', file); 
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${BASE_URL}/v1/tutores/${id}/fotos`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error('Falha ao enviar foto');
    return response.json();
  }
};