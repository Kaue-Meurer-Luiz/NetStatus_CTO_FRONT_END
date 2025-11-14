// Status possíveis para as portas
export const STATUS_PORTA = {
  ATIVO: 'ATIVO',
  CANCELADO: 'CANCELADO',
  MUDOU_SE: 'MUDOU-SE',
  NAO_IDENTIFICADO: 'Ñ IDENTIFICADO',
  NAO_CAIU_NGM: 'Ñ CAIU NGM'
};

// Lista de status para seleção
export const STATUS_OPTIONS = [
  { value: STATUS_PORTA.ATIVO, label: 'Ativo' },
  { value: STATUS_PORTA.CANCELADO, label: 'Cancelado' },
  { value: STATUS_PORTA.MUDOU_SE, label: 'Mudou-se' },
  { value: STATUS_PORTA.NAO_CAIU_NGM, label: 'Não Caiu Ninguém' }
];

// Estrutura padrão de uma porta
export const PORTA_PADRAO = {
  nrPorta: 1,
  cliente: '',
  status: STATUS_PORTA.ATIVO,
  plotado: false,
  observacao: ''
};

// Estrutura padrão de uma conferência
export const CONFERENCIA_PADRAO = {
  caixa: '',
  cidade: '',
  dataConferencia: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
  observacao: '',
  tecInterno_id: 1,
  tecExterno_id: 1,
  portas: [{ ...PORTA_PADRAO }]
};

// Validação de campos obrigatórios
export const CAMPOS_OBRIGATORIOS = {
  caixa: 'Caixa é obrigatória',
  cidade: 'Cidade é obrigatória',
  dataConferencia: 'Data da conferência é obrigatória',
  tecInterno_id: 'Técnico interno é obrigatório',
  tecExterno_id: 'Técnico externo é obrigatório'
};

// Mensagens de sucesso e erro
export const MENSAGENS = {
  SUCESSO_CRIAR: 'Conferência criada com sucesso!',
  ERRO_CRIAR: 'Erro ao criar conferência. Tente novamente.',
  ERRO_CARREGAR: 'Erro ao carregar conferências.',
  CONFIRMACAO_EXCLUIR: 'Tem certeza que deseja excluir esta conferência?'
};
