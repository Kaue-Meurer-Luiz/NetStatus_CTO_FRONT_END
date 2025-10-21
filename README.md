# Sistema de Conferências - Frontend

Um sistema web moderno para gestão de conferências de caixas, desenvolvido em React com interface profissional e responsiva.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard** - Visão geral com estatísticas e métricas
- **Cadastro de Conferências** - Formulário completo para nova conferência
- **Gestão de Portas** - Adicionar/remover portas dinamicamente
- **Listagem de Conferências** - Visualizar todas as conferências cadastradas
- **Busca e Filtros** - Pesquisar por caixa, cidade, cliente, status
- **Visualização de Detalhes** - Modal com informações completas
- **Armazenamento Local** - Persistência de dados no localStorage
- **Interface Responsiva** - Funciona em desktop e mobile
- **Validação de Formulários** - Validação completa dos dados
- **Tratamento de Erros** - Mensagens de erro apropriadas

### 🔄 Integração com API
- **Endpoint POST**: `http://localhost:8080/api/conferencias`
- **Fallback Local**: Dados salvos no localStorage quando API não disponível
- **Axios**: Biblioteca para requisições HTTP
- **Tratamento de Erros**: Mensagens informativas para problemas de conexão

## 🛠️ Tecnologias Utilizadas

- **React 19** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI profissionais
- **Lucide React** - Ícones
- **React Router DOM** - Navegação
- **Axios** - Requisições HTTP
- **JavaScript (JSX)** - Linguagem de programação

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes UI (shadcn/ui)
│   ├── ConferenciaForm.jsx    # Formulário de cadastro
│   ├── ConferenciasList.jsx   # Listagem de conferências
│   ├── Dashboard.jsx          # Dashboard principal
│   ├── Navigation.jsx         # Navegação
│   └── Layout.jsx            # Layout principal
├── services/            # Serviços e APIs
│   └── api.js          # Configuração Axios e serviços
├── lib/                # Utilitários
│   ├── constants.js    # Constantes e configurações
│   └── utils.js        # Funções utilitárias
├── App.jsx             # Componente principal
└── main.jsx           # Ponto de entrada
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- pnpm (ou npm/yarn)

### Instalação
```bash
# Clonar o repositório (se aplicável)
git clone <repository-url>

# Navegar para o diretório
cd conferencias-frontend

# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm run dev --host
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
# Gerar build otimizado
pnpm run build

# Visualizar build localmente
pnpm run preview
```

## 📊 Estrutura de Dados

### Conferência
```json
{
  "caixa": "A0139PRA",
  "cidade": "Pranchita", 
  "dataConferencia": "2025-09-06",
  "observacao": "Conferência de caixa lotada",
  "tecInterno_id": 1,
  "tecExterno_id": 8,
  "portas": [
    {
      "nrPorta": 1,
      "cliente": "21920",
      "status": "ATIVO",
      "plotado": "",
      "observacao": ""
    }
  ]
}
```

### Status de Porta Disponíveis
- **ATIVO** - Porta ativa
- **CANCELADO** - Porta cancelada
- **MUDOU-SE** - Cliente mudou-se
- **Ñ IDENTIFICADO** - Cliente não identificado
- **Ñ CAIU NGM** - Não caiu ninguém

## 🔧 Configuração da API

### Endpoint Principal
- **URL**: `http://localhost:8080/api/conferencias`
- **Método**: POST
- **Content-Type**: application/json

### Configuração no Código
```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';
```

Para alterar a URL da API, modifique a constante `API_BASE_URL` no arquivo `src/services/api.js`.

## 📱 Funcionalidades por Tela

### Dashboard (`/`)
- Estatísticas gerais (total, mês atual, portas, cidades)
- Últimas 10 conferências
- Ações rápidas
- Navegação para outras seções

### Nova Conferência (`/nova`)
- Formulário completo de cadastro
- Validação em tempo real
- Gestão dinâmica de portas
- Integração com API + fallback local

### Todas as Conferências (`/conferencias`)
- Listagem completa
- Campo de busca avançada
- Visualização de detalhes em modal
- Filtros por múltiplos campos

## 🎨 Design e UX

- **Design System**: Baseado em shadcn/ui
- **Cores**: Esquema profissional com suporte a dark mode
- **Tipografia**: Hierarquia clara e legível
- **Responsividade**: Mobile-first approach
- **Acessibilidade**: Componentes acessíveis por padrão
- **Micro-interações**: Hover states e transições suaves

## 🔍 Validações Implementadas

### Campos Obrigatórios
- Caixa
- Cidade  
- Data da Conferência
- ID Técnico Interno
- ID Técnico Externo
- Número da Porta (para cada porta)
- Status da Porta (para cada porta)

### Validações Específicas
- Números de porta únicos
- Formato de data válido
- IDs numéricos para técnicos
- Status válido da lista predefinida

## 🚨 Tratamento de Erros

- **Erro de Conexão**: Mensagem informativa quando API não disponível
- **Validação**: Destacar campos com erro e mensagens específicas
- **Timeout**: Configurado para 10 segundos
- **Fallback**: Salvamento local quando API falha

## 🔄 Próximas Melhorias Sugeridas

### Backend
- Implementar endpoints GET para consulta
- Adicionar paginação e filtros na API
- Autenticação e autorização
- Logs de auditoria

### Frontend
- Implementar dark mode completo
- Adicionar gráficos e relatórios
- Exportação de dados (PDF, Excel)
- Notificações push
- Cache inteligente
- Modo offline

### DevOps
- Docker para containerização
- CI/CD pipeline
- Testes automatizados
- Monitoramento e métricas

## 📄 Licença

Este projeto foi desenvolvido para gestão interna de conferências de caixas.

## 👥 Suporte

Para dúvidas ou sugestões sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0  
**Última Atualização**: Setembro 2025
