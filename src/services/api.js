import axios from 'axios';

// A API pública continua sendo usada nas operações existentes.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://netstatus.duckdns.org/api';

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
      throw new Error('A API não respondeu ou bloqueou a requisição pelo CORS. Verifique o endereço e a configuração do servidor.');
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

  atualizarConferencia: async (conferencia) => {
    const response = await api.put('/conferencias', conferencia);
    return response.data;
  },

  // 1. NOVO MÉTODO: Buscar conferências PAGINADAS (Para a listagem completa)
  buscarConferenciasPaginado: async (page = 0, size = 10, caixa = '') => {
    const response = await api.get('/conferencias/listar', {
      params: {
        page,
        size,
        ...(caixa.trim() && { caixa: caixa.trim() }),
      },
    });
    return response.data;
  },

  // 2. AJUSTADO: Buscar as 5 mais recentes (Para o Dashboard)
  // Mantemos o endpoint /ultimas, mas garantimos que retorne um array
  buscarUltimasConferencias: async () => {
    const response = await api.get('/conferencias/ultimas');
    return Array.isArray(response.data) ? response.data : (response.data.content || []);
  },

  // 3. AJUSTADO: Buscar conferências por nome da caixa (Para duplicidade)
  // Agora usa o método paginado com um tamanho maior para garantir a busca
  buscarPorCaixa: async (caixa) => {
    const caixaNormalizada = caixa.trim().toLowerCase();
    const data = await conferenciasService.buscarConferenciasPaginado(0, 100, caixa.trim());
    const lista = data.content || [];
    return lista.filter(
      (conferencia) => conferencia.caixa?.trim().toLowerCase() === caixaNormalizada
    );
  },

  // Método legado (opcional, para evitar quebras em outros lugares)
  buscarConferencias: async () => {
    const data = await conferenciasService.buscarConferenciasPaginado(0, 1000);
    return data.content || [];
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
    const usuarios = await usuariosService.buscarTodos();
    return usuarios.filter(usuario =>
      usuario.funcao?.toLowerCase() === funcao.toLowerCase()
    );
  },

  buscarUsuariosPorTermo: async (termo = '') => {
    const response = await api.get('/usuarios/buscar', { params: { termo } });
    return response.data;
  },

  // Mantém os outros métodos para compatibilidade
  buscarOperadores: async () => {
    const response = await api.get('/usuarios');
    return response.data.filter(u => u.funcao?.toLowerCase() === 'operador');
  },

  buscarTecnicos: async () => {
    const response = await api.get('/usuarios');
    return response.data.filter(u => u.funcao?.toLowerCase() === 'técnico');
  }
};

export default api;
