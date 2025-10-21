import axios from 'axios';

// URL base da API
const API_BASE_URL = 'http://localhost:8080/api';

// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);

    if (error.response) {
      const { status, data } = error.response;
      throw new Error(`Erro ${status}: ${data.message || 'Erro no servidor'}`);
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique se a API está rodando.');
    } else {
      throw new Error('Erro inesperado: ' + error.message);
    }
  }
);

// Serviços da API
export const conferenciasService = {
  // Criar nova conferência
  criarConferencia: async (conferencia) => {
    try {
      const response = await api.post('/conferencias', conferencia);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar conferência:', error);
      throw error;
    }
  },

  // Buscar todas as conferências
  buscarConferencias: async () => {
    try {
      const res = await api.get('/conferencias/listar');
      return res.data;
    } catch (error) {
      console.error('Erro ao buscar conferências:', error);
      return [];
    }
  },

  // Buscar as 10 mais recentes
  buscarUltimasConferencias: async () => {
    try {
      const conferencias = await conferenciasService.buscarConferencias();
      return conferencias
        .filter(c => c?.dataConferencia)
        .sort((a, b) => new Date(b.dataConferencia) - new Date(a.dataConferencia))
        .slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar últimas conferências:', error);
      return [];
    }
  },
};

export default api;