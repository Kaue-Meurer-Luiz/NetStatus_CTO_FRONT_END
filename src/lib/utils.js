import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { CAMPOS_OBRIGATORIOS } from './constants';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Validar dados da conferência
export const validarConferencia = (conferencia) => {
  const erros = {};

  // Validar campos obrigatórios
  Object.keys(CAMPOS_OBRIGATORIOS).forEach(campo => {
    if (!conferencia[campo] || conferencia[campo].toString().trim() === '') {
      erros[campo] = CAMPOS_OBRIGATORIOS[campo];
    }
  });

  // Validar se há pelo menos uma porta
  if (!conferencia.portas || conferencia.portas.length === 0) {
    erros.portas = 'Deve haver pelo menos uma porta';
  } else {
    // Validar portas
    conferencia.portas.forEach((porta, index) => {
      if (!porta.nrPorta || porta.nrPorta < 1) {
        erros[`porta_${index}_nrPorta`] = `Número da porta ${index + 1} é obrigatório`;
      }
      if (!porta.status || porta.status.trim() === '') {
        erros[`porta_${index}_status`] = `Status da porta ${index + 1} é obrigatório`;
      }
    });
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros
  };
};

// Formatar data para exibição (só data)
export const formatarData = (data) => {
  if (!data) return '';
  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  } catch (error) {
    return data;
  }
};

// Formatar data e hora para exibição
export const formatarDataHora = (data) => {
  if (!data) return '';
  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  } catch (error) {
    return data;
  }
};


// Gerar cor baseada no status da porta
export const getCorStatus = (status) => {
  const cores = {
    'ATIVO': 'bg-green-100 text-green-800 border-green-200',
    'CANCELADO': 'bg-red-100 text-red-800 border-red-200',
    'MUDOU-SE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Ñ IDENTIFICADO': 'bg-gray-100 text-gray-800 border-gray-200',
    'Ñ CAIU NGM': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  return cores[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Debounce para otimizar pesquisas
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Filtrar conferências por termo de busca
export const filtrarConferencias = (conferencias, termoBusca) => {
  if (!termoBusca || termoBusca.trim() === '') {
    return conferencias;
  }

  const termo = termoBusca.toLowerCase().trim();
  
  return conferencias.filter(conferencia => {
    return (
      conferencia.caixa?.toLowerCase().includes(termo) ||
      conferencia.cidade?.toLowerCase().includes(termo) ||
      conferencia.observacao?.toLowerCase().includes(termo) ||
      conferencia.dataConferencia?.includes(termo) ||
      conferencia.portas?.some(porta => 
        porta.cliente?.toLowerCase().includes(termo) ||
        porta.status?.toLowerCase().includes(termo) ||
        porta.observacao?.toLowerCase().includes(termo)
      )
    );
  });
};
