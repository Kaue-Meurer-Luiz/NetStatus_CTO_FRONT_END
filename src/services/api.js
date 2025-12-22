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

  // Buscar as 5 mais recentes
  buscarUltimasConferencias: async () => {
  try {
    const response = await api.get('/conferencias/ultimas');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar últimas conferências:', error);
    return [];
  }
},
// Buscar conferências por nome da caixa
  buscarPorCaixa: async (caixa) => {
    try {
      const conferencias = await conferenciasService.buscarConferencias();
      return conferencias.filter(c => c.caixa && c.caixa.toLowerCase() === caixa.toLowerCase());
    } catch (error) {
      console.error('Erro ao buscar conferências por caixa:', error);
      return [];
    }
  }


};

// Serviço de Usuários
export const usuariosService = {
  // Buscar todos os usuários
  buscarTodos: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // Buscar usuários por função (Operador ou Técnico)
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

// Buscar operadores (técnicos internos)
buscarOperadores: async () => {
  return usuariosService.buscarPorFuncao('Operador');
},

// Buscar técnicos (técnicos externos)
buscarTecnicos: async () => {
  return usuariosService.buscarPorFuncao('Técnico');
},

// Buscar usuário por ID
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