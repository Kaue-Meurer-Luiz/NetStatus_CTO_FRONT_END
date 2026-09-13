// Status possíveis para as portas
export const STATUS_PORTA = {
  ATIVO: 'ATIVO',
  CANCELADO: 'CANCELADO',
  MUDOU_SE: 'MUDOU-SE',
  NAO_IDENTIFICADO: 'Ñ IDENTIFICADO',
  NAO_CAIU_NGM: 'Não CAIU NGM',
  VAGA: 'VAGA'

};

// Lista de status para seleção
export const STATUS_OPTIONS = [
  { value: STATUS_PORTA.ATIVO, label: 'Ativo' },
  { value: STATUS_PORTA.CANCELADO, label: 'Cancelado' },
  { value: STATUS_PORTA.MUDOU_SE, label: 'Mudou-se' },
  { value: STATUS_PORTA.NAO_CAIU_NGM, label: 'Não Caiu Ninguém' },
  { value: STATUS_PORTA.VAGA, label: 'Vaga'}
];

// Estrutura padrão de uma porta
export const PORTA_PADRAO = {
  nrPorta: 1,
  cliente: '',
  status: STATUS_PORTA.ATIVO,
  plotado: false,
  observacao: ''
};

const formatarDataHoraLocal = (data = new Date()) => {
  const deslocamentoFuso = data.getTimezoneOffset() * 60 * 1000;
  return new Date(data.getTime() - deslocamentoFuso).toISOString().slice(0, 16);
};

// Cria uma nova estrutura para evitar uma data antiga e referências compartilhadas.
export const criarConferenciaPadrao = () => ({
  caixa: '',
  cidade: '',
  dataConferencia: formatarDataHoraLocal(),
  observacao: '',
  tecInterno_id: 0,
  tecExterno_id: 0,
  portas: []
});

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
