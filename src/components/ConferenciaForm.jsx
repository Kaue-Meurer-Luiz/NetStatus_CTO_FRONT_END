import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { conferenciasService, usuariosService } from '../services/api';
import { validarConferencia } from '../lib/utils';
import { CONFERENCIA_PADRAO, PORTA_PADRAO, STATUS_OPTIONS, MENSAGENS } from '../lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';



export default function ConferenciaForm({ onSuccess }) {
  const [conferencia, setConferencia] = useState(CONFERENCIA_PADRAO);
  const [loading, setLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [operadores, setOperadores] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  // Carregar usuários ao montar o componente
  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Carregar usuários da API
  const carregarUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const [ops, tecns] = await Promise.all([
        usuariosService.buscarOperadores(),
        usuariosService.buscarTecnicos()
      ]);

      setOperadores(ops);
      setTecnicos(tecns);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setMensagem({
        tipo: 'aviso',
        texto: 'Aviso: Não foi possível carregar a lista de usuários. Você pode inserir os IDs manualmente.'
      });
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Atualizar campo da conferência
  const atualizarCampo = (campo, valor) => {
    setConferencia(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (erros[campo]) {
      setErros(prev => {
        const novosErros = { ...prev };
        delete novosErros[campo];
        return novosErros;
      });
    }
  };

  // Atualizar porta específica
  const atualizarPorta = (index, campo, valor) => {
    setConferencia(prev => ({
      ...prev,
      portas: prev.portas.map((porta, i) =>
        i === index ? { ...porta, [campo]: valor } : porta
      )
    }));

    // Limpar erro da porta quando o usuário começar a digitar
    const chaveErro = `porta_${index}_${campo}`;
    if (erros[chaveErro]) {
      setErros(prev => {
        const novosErros = { ...prev };
        delete novosErros[chaveErro];
        return novosErros;
      });
    }
  };


  const adicionarMultiplasPortas = (quantidade) => {
    setConferencia(prev => {
      const inicio = prev.portas.length + 1;

      const novasPortas = Array.from({ length: quantidade }, (_, i) => ({
        ...PORTA_PADRAO,
        nrPorta: inicio + i
      }));

      return {
        ...prev,
        portas: [...prev.portas, ...novasPortas]
      };
    });
  };



  // Remover porta
  const removerPorta = (index) => {
    if (conferencia.portas.length > 1) {
      setConferencia(prev => ({
        ...prev,
        portas: prev.portas.filter((_, i) => i !== index)
      }));
    }
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar dados
    const { valido, erros: errosValidacao } = validarConferencia(conferencia);

    if (!valido) {
      setErros(errosValidacao);
      setMensagem({ tipo: 'erro', texto: 'Por favor, corrija os erros no formulário.' });
      return;
    }

    setLoading(true);
    setErros({});
    setMensagem({ tipo: '', texto: '' });

    try {


      // DEBUG: Exibir o objeto da conferencia no console
      //console.log('Objeto da conferencia a ser enviado:', conferencia);
      //console.log('tecInterno_id:', conferencia.tecInterno_id, 'tipo:', typeof conferencia.tecInterno_id);
      //console.log('tecExterno_id:', conferencia.tecExterno_id, 'tipo:', typeof conferencia.tecExterno_id);

      // Tentar enviar para a API
      await conferenciasService.criarConferencia(conferencia);

      setMensagem({ tipo: 'sucesso', texto: MENSAGENS.SUCESSO_CRIAR });

      // Resetar formulário
      setConferencia(CONFERENCIA_PADRAO);

      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

    } catch (error) {
      console.error('Erro ao criar conferência:', error);
      setMensagem({ tipo: 'erro', texto: error.message || MENSAGENS.ERRO_CRIAR });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Nova Conferência
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mensagem.texto && (
            <Alert className={`mb-6 ${mensagem.tipo === 'sucesso'
              ? 'border-green-200 bg-green-50'
              : mensagem.tipo === 'aviso'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50'
              }`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className={`${mensagem.tipo === 'sucesso'
                ? 'text-green-800'
                : mensagem.tipo === 'aviso'
                  ? 'text-yellow-800'
                  : 'text-red-800'
                }`}>
                {mensagem.texto}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
              <div className="md:col-span-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Informações Gerais</h3>
              </div>
              <div>
                <Label htmlFor="caixa">Caixa *</Label>
                <Input
                  id="caixa"
                  value={conferencia.caixa}
                  onChange={(e) => atualizarCampo('caixa', e.target.value)}
                  placeholder=""
                  className={erros.caixa ? 'border-red-500' : ''}
                />
                {erros.caixa && <p className="text-red-500 text-sm mt-1">{erros.caixa}</p>}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={conferencia.cidade}
                  onChange={(e) => atualizarCampo('cidade', e.target.value)}
                  placeholder=""
                  className={erros.cidade ? 'border-red-500' : ''}
                />
                {erros.cidade && <p className="text-red-500 text-sm mt-1">{erros.cidade}</p>}
              </div>

              <div>
                <Label htmlFor="dataConferencia">Data da Conferência *</Label>
                <Input
                  id="dataConferencia"
                  type="datetime-local"
                  value={conferencia.dataConferencia}
                  onChange={(e) => atualizarCampo('dataConferencia', e.target.value)}
                  className={erros.dataConferencia ? 'border-red-500' : ''}
                />
                {erros.dataConferencia && <p className="text-red-500 text-sm mt-1">{erros.dataConferencia}</p>}
              </div>

              {/* Técnico Interno (Operador) */}
              <div>
                <Label htmlFor="tecInterno_id">Técnico Interno (Operador) *</Label>
                {loadingUsuarios ? (
                  <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Carregando operadores...</span>
                  </div>
                ) : (
                  <Select
                    value={conferencia.tecInterno_id ? conferencia.tecInterno_id.toString() : ''}
                    onValueChange={(value) => {
                      //console.log('Selecionado tecInterno:', value);
                      const numValue = parseInt(value, 10);
                      //console.log('Convertido para número:', numValue, 'isNaN:', isNaN(numValue));
                      if (!isNaN(numValue)) {
                        //console.log('Atualizando tecInterno_id para:', numValue);
                        atualizarCampo('tecInterno_id', numValue);
                      }
                    }}
                  >
                    <SelectTrigger className={erros.tecInterno_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um operador" />
                    </SelectTrigger>
                    <SelectContent>
                      {operadores.map((operador) => (
                        <SelectItem key={operador.id} value={operador.id.toString()}>
                          {operador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                )}
                {erros.tecInterno_id && (
                  <p className="text-red-500 text-sm mt-1">{erros.tecInterno_id}</p>
                )}
              </div>

              {/* Técnico Externo */}
              <div className="md:col-span-2">
                <Label htmlFor="tecExterno_id">Técnico Externo *</Label>
                {loadingUsuarios ? (
                  <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Carregando técnicos...</span>
                  </div>
                ) : (
                  <Select
                    value={conferencia.tecExterno_id ? conferencia.tecExterno_id.toString() : ''}
                    onValueChange={(value) => {
                      //console.log('Selecionado tecExterno:', value);
                      const numValue = parseInt(value, 10);
                      //console.log('Convertido para número:', numValue, 'isNaN:', isNaN(numValue));
                      if (!isNaN(numValue)) {
                        //console.log('Atualizando tecExterno_id para:', numValue);
                        atualizarCampo('tecExterno_id', numValue);
                      }
                    }}
                  >
                    <SelectTrigger className={erros.tecExterno_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      {tecnicos.map((tecnico) => (
                        <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                          {tecnico.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                )}
                {erros.tecExterno_id && (
                  <p className="text-red-500 text-sm mt-1">{erros.tecExterno_id}</p>
                )}
              </div>


              <div className="md:col-span-3">
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  value={conferencia.observacao}
                  onChange={(e) => atualizarCampo('observacao', e.target.value)}
                  placeholder="Ex: Conferência de caixa lotada"
                  rows={3}
                />
              </div>
            </div>

            {/* Portas */}
            <div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold">Portas</h3>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => adicionarMultiplasPortas(1)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    1 Porta
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => adicionarMultiplasPortas(8)}
                  >
                    +8 Portas
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => adicionarMultiplasPortas(16)}
                  >
                    +16 Portas
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => adicionarMultiplasPortas(24)}
                  >
                    +24 Portas
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-20 py-2">Nº Porta</TableHead>
                      <TableHead className="w-32 py-2">Cliente</TableHead>
                      <TableHead className="w-44 py-2">Status</TableHead>
                      <TableHead className="w-24 py-2 text-center">Plotado</TableHead>
                      <TableHead className="py-2">Observação</TableHead>
                      <TableHead className="w-12 py-2"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conferencia.portas.map((porta, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="py-1">
                          <Input
                            type="number"
                            value={porta.nrPorta}
                            onChange={(e) => atualizarPorta(index, 'nrPorta', parseInt(e.target.value) || '')}
                            className={`h-8 px-2 ${erros[`porta_${index}_nrPorta`] ? 'border-red-500' : ''}`}
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          <Input
                            value={porta.cliente}
                            onChange={(e) => atualizarPorta(index, 'cliente', e.target.value)}
                            placeholder=""
                            className="h-8 px-2"
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          <Select
                            value={porta.status}
                            onValueChange={(value) => atualizarPorta(index, 'status', value)}
                          >
                            <SelectTrigger className={`h-8 ${erros[`porta_${index}_status`] ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1 text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={porta.plotado === true || porta.plotado === 'true'}
                              onChange={(e) => atualizarPorta(index, 'plotado', e.target.checked)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-1">
                          <Input
                            value={porta.observacao}
                            onChange={(e) => atualizarPorta(index, 'observacao', e.target.value)}
                            placeholder="Obs. da porta"
                            className="h-8 px-2"
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          {conferencia.portas.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removerPorta(index)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {erros.portas && <p className="text-red-500 text-xs p-2 bg-red-50 border-t">{erros.portas}</p>}
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConferencia(CONFERENCIA_PADRAO)}
                disabled={loading}
              >
                Limpar
              </Button>
              <Button
                type="submit"
                disabled={loading || loadingUsuarios}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Conferência'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
