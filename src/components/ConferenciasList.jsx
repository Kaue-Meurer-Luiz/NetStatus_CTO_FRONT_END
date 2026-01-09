import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Calendar, MapPin, User, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { conferenciasService } from '../services/api';
import { formatarDataHora, formatarData, getCorStatus, filtrarConferencias, debounce, formatarBooleano } from '../lib/utils';
import { MENSAGENS } from '../lib/constants';

export default function ConferenciasList({ limite = null, titulo = "Conferências" }) {
  const [conferencias, setConferencias] = useState([]);
  const [conferenciasFiltradas, setConferenciasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [conferenciaSelecionada, setConferenciaSelecionada] = useState(null);

  // Estados da Paginação (usados apenas quando não há limite)
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  // Debounced search function
  const buscarDebounced = debounce((termo) => {
    const filtradas = filtrarConferencias(conferencias, termo);
    setConferenciasFiltradas(filtradas);
  }, 300);

  // Carregar conferências
  const carregarConferencias = async () => {
    setLoading(true);
    setErro('');
    
    try {
      if (limite) {
        // LÓGICA PARA O DASHBOARD (Lista Simples)
        const dados = await conferenciasService.buscarUltimasConferencias();
        // O Dashboard já pede as últimas 5, mas garantimos o slice por segurança
        const final = dados.slice(0, limite);
        setConferencias(final);
        setConferenciasFiltradas(final);
      } else {
        // LÓGICA PARA LISTAGEM COMPLETA (Paginada)
        const data = await conferenciasService.buscarConferenciasPaginado(paginaAtual, 10);
        const lista = data.content || [];
        setConferencias(lista);
        setConferenciasFiltradas(lista);
        setTotalPaginas(data.totalPages || 0);
        setTotalElementos(data.totalElements || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar conferências:', error);
      setErro(MENSAGENS.ERRO_CARREGAR);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar dados na inicialização e quando a página muda
  useEffect(() => {
    carregarConferencias();
  }, [limite, paginaAtual]);

  // Efeito para busca
  useEffect(() => {
    buscarDebounced(termoBusca);
  }, [termoBusca, conferencias]);

  const visualizarDetalhes = (conferencia) => {
    setConferenciaSelecionada(conferencia);
  };

  const fecharDetalhes = () => {
    setConferenciaSelecionada(null);
  };

  const obterNomeTecnico = (tecnico) => {
    if (!tecnico) return 'N/A';
    return typeof tecnico === 'object' && tecnico.nome ? tecnico.nome : (tecnico.id ? `ID: ${tecnico.id}` : 'N/A');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando conferências...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {titulo}
            {limite && <Badge variant="secondary">Últimas {limite}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {erro && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{erro}</AlertDescription>
            </Alert>
          )}

          {!limite && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por caixa, cidade, cliente, status..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {conferenciasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {conferencias.length === 0 
                ? 'Nenhuma conferência encontrada.'
                : 'Nenhuma conferência encontrada para os critérios de busca.'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {conferenciasFiltradas.map((conferencia, index) => (
                <Card key={conferencia.idConferencia || index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{conferencia.caixa}</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {conferencia.cidade}
                          </Badge>
                          <Badge variant="secondary">
                            {formatarDataHora(conferencia.dataConferencia)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Téc. Interno: {obterNomeTecnico(conferencia.tecInterno)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Téc. Externo: {obterNomeTecnico(conferencia.tecExterno)}
                          </span>
                          <span>Portas: {conferencia.portas?.length || 0}</span>
                        </div>

                        {conferencia.observacao && (
                          <p className="text-sm text-gray-600 italic">
                            "{conferencia.observacao}"
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => visualizarDetalhes(conferencia)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {conferencia.portas?.slice(0, 5).map((porta, portaIndex) => (
                        <Badge
                          key={portaIndex}
                          className={`text-xs ${getCorStatus(porta.status)}`}
                          variant="outline"
                        >
                          P{porta.nrPorta}: {porta.status}
                        </Badge>
                      ))}
                      {conferencia.portas?.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{conferencia.portas.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CONTROLES DE PAGINAÇÃO (Apenas se não houver limite) */}
          {!limite && totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Total de <strong>{totalElementos}</strong> conferências
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Página {paginaAtual + 1} de {totalPaginas}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(prev => Math.max(0, prev - 1))}
                    disabled={paginaAtual === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(prev => prev + 1)}
                    disabled={paginaAtual >= totalPaginas - 1}
                  >
                    Próxima <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Botão para recarregar (Apenas no Dashboard) */}
          {limite && (
            <div className="flex justify-center mt-6">
              <Button onClick={carregarConferencias} variant="outline">
                Atualizar Lista
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {conferenciaSelecionada && (
        <ConferenciaDetalhes
          conferencia={conferenciaSelecionada}
          onClose={fecharDetalhes}
          obterNomeTecnico={obterNomeTecnico}
        />
      )}
    </div>
  );
}

function ConferenciaDetalhes({ conferencia, onClose, obterNomeTecnico }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                Detalhes da Conferência - {conferencia.caixa}
              </CardTitle>
              <Button onClick={onClose} variant="outline" size="sm">
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Caixa</label>
                <p className="text-lg font-semibold">{conferencia.caixa}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cidade</label>
                <p className="text-lg">{conferencia.cidade}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data da Conferência</label>
                <p className="text-lg">{formatarDataHora(conferencia.dataConferencia)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Técnicos</label>
                <p className="text-lg">
                  Interno: {obterNomeTecnico(conferencia.tecInterno)} | Externo: {obterNomeTecnico(conferencia.tecExterno)}
                </p>
              </div>
              {conferencia.observacao && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Observação</label>
                  <p className="text-lg italic">"{conferencia.observacao}"</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Portas ({conferencia.portas?.length || 0})
              </h3>
              
              {conferencia.portas && conferencia.portas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Porta</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plotado</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conferencia.portas.map((porta, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{porta.nrPorta}</TableCell>
                        <TableCell>{porta.cliente || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getCorStatus(porta.status)} variant="outline">
                            {porta.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatarBooleano(porta.plotado)}</TableCell>
                        <TableCell>{porta.observacao || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma porta cadastrada para esta conferência.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}