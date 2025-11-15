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

import { Checkbox } from "@/components/ui/checkbox"



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

  // Adicionar nova porta
  const adicionarPorta = () => {
    const proximoNumero = conferencia.portas.length + 1;
    setConferencia(prev => ({
      ...prev,
      portas: [...prev.portas, { ...PORTA_PADRAO, nrPorta: proximoNumero }]
    }));
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="caixa">Caixa *</Label>
                <Input
                  id="caixa"
                  value={conferencia.caixa}
                  onChange={(e) => atualizarCampo('caixa', e.target.value)}
                  placeholder="Ex: A0139PRA"
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
                  placeholder="Ex: Salto do Lontra"
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


              <div className="md:col-span-2">
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Portas</h3>
                <Button
                  type="button"
                  onClick={adicionarPorta}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Porta
                </Button>
              </div>

              {erros.portas && <p className="text-red-500 text-sm mb-4">{erros.portas}</p>}

              <div className="space-y-4">
                {conferencia.portas.map((porta, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`porta-${index}-numero`} className="mb-1">Nº Porta</Label>
                        <Input
                          id={`porta-${index}-numero`}
                          type="number"
                          value={porta.nrPorta}
                          onChange={(e) => atualizarPorta(index, 'nrPorta', parseInt(e.target.value) || '')}
                          className={erros[`porta_${index}_nrPorta`] ? 'border-red-500' : ''}
                        />
                        {erros[`porta_${index}_nrPorta`] && (
                          <p className="text-red-500 text-sm mt-1">{erros[`porta_${index}_nrPorta`]}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`porta-${index}-cliente`} className="mb-1">Cliente</Label>
                        <Input
                          id={`porta-${index}-cliente`}
                          value={porta.cliente}
                          onChange={(e) => atualizarPorta(index, 'cliente', e.target.value)}
                          placeholder="Ex: 21920"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`porta-${index}-status`} className="mb-1">Status</Label>
                        <Select
                          value={porta.status}
                          onValueChange={(value) => atualizarPorta(index, 'status', value)}
                        >
                          <SelectTrigger className={erros[`porta_${index}_status`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {erros[`porta_${index}_status`] && (
                          <p className="text-red-500 text-sm mt-1">{erros[`porta_${index}_status`]}</p>
                        )}
                      </div>



                      <div className="flex items-end">
                        <div className="flex flex-col gap-1">
                          <Label className="mb-1">Plotado</Label>

                          <Select
                            value={String(porta.plotado)}
                            onValueChange={(value) => atualizarPorta (index, "plotado", value === "true")}>

                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="true">Sim</SelectItem>
                              <SelectItem value="false">Não</SelectItem>
                            </SelectContent>

                          </Select>
                        </div>
                      </div>



                      <div className="flex items-end">
                        {conferencia.portas.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removerPorta(index)}
                            variant="destructive"
                            size="sm"
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`porta-${index}-observacao`}>Observação</Label>
                      <Textarea
                        id={`porta-${index}-observacao`}
                        value={porta.observacao}
                        onChange={(e) => atualizarPorta(index, 'observacao', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>
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
