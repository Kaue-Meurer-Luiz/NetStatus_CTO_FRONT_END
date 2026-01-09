import axios from 'axios';

// URL base da API
const API_BASE_URL = 'http://191.243.48.49:8080/api';

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

  // 1. NOVO MÉTODO: Buscar conferências PAGINADAS (Para a listagem completa)
  buscarConferenciasPaginado: async (page = 0, size = 10) => {
    try {
      const res = await api.get(`/conferencias/listar?page=${page}&size=${size}`);
      return res.data; // Retorna o objeto Page (content, totalPages, etc.)
    } catch (error) {
      console.error('Erro ao buscar conferências paginadas:', error);
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  },

  // 2. AJUSTADO: Buscar as 5 mais recentes (Para o Dashboard)
  // Mantemos o endpoint /ultimas, mas garantimos que retorne um array
  buscarUltimasConferencias: async () => {
    try {
      const response = await api.get('/conferencias/ultimas');
      // Se a API retornar um Page, extraímos o content. Se for lista, usamos direto.
      return Array.isArray(response.data) ? response.data : (response.data.content || []);
    } catch (error) {
      console.error('Erro ao buscar últimas conferências:', error);
      return [];
    }
  },

  // 3. AJUSTADO: Buscar conferências por nome da caixa (Para duplicidade)
  // Agora usa o método paginado com um tamanho maior para garantir a busca
  buscarPorCaixa: async (caixa) => {
    try {
      const data = await conferenciasService.buscarConferenciasPaginado(0, 100);
      const lista = data.content || [];
      return lista.filter(c => c.caixa && c.caixa.toLowerCase().trim() === caixa.toLowerCase().trim());
    } catch (error) {
      console.error('Erro ao buscar conferências por caixa:', error);
      return [];
    }
  },

  // Método legado (opcional, para evitar quebras em outros lugares)
  buscarConferencias: async () => {
    try {
      const data = await conferenciasService.buscarConferenciasPaginado(0, 1000);
      return data.content || [];
    } catch (error) {
      return [];
    }
  }
};

// Serviço de Usuários
export const usuariosService = {
  buscarTodos: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  buscarPorFuncao: async (funcao) => {
    try {
      const usuarios = await usuariosService.buscarTodos();
      return usuarios.filter(usuario =>
        usuario.funcao?.toLowerCase() === funcao.toLowerCase()
      );
    } catch (error) {
      console.error(`Erro ao buscar usuários com função ${funcao}:`, error);
      return [];
    }
  },

  buscarOperadores: async () => {
    return usuariosService.buscarPorFuncao('Operador');
  },

  buscarTecnicos: async () => {
    return usuariosService.buscarPorFuncao('Técnico');
  },

  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/usuarios/id/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${id}:`, error);
      return null;
    }
  }
};

export default api;