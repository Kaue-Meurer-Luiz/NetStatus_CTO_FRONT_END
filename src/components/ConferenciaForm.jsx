import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, AlertCircle, AlertTriangle, Info, Eye, Loader, Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from "@/lib/utils"
import { Command, CommandGroup, CommandItem, CommandList, } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { conferenciasService, usuariosService } from '../services/api';
import { validarConferencia, debounce, formatarData } from '../lib/utils';
import { CONFERENCIA_PADRAO, PORTA_PADRAO, STATUS_OPTIONS, MENSAGENS } from '../lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Componente Combobox com Busca via API (Backend)
function ComboboxUsuarioAPI({
  value,
  onChange,
  placeholder = "Selecione um usuário...",
  funcaoFiltro = null // 'Operador' ou 'Técnico'
}) {
  const [open, setOpen] = useState(false)
  const [termo, setTermo] = useState("")
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const inputRef = useRef(null)
  const handleInputChange = (e) => {
    const novoValor = e.target.value;
    setTermo(novoValor);
    setUsuarioSelecionado(null);
  };

  // Carregar usuários por termo via API
  const carregarUsuarios = useCallback(async (termoBusca = "") => {
    setLoading(true)
    try {
      // Usa o novo endpoint /usuarios/buscar?termo=...
      const data = await usuariosService.buscarUsuariosPorTermo(termoBusca)

      // Filtra pela função no Front-end (caso o Backend retorne todos)
      const filtrados = funcaoFiltro
        ? data.filter(u => u.funcao?.toLowerCase() === funcaoFiltro.toLowerCase())
        : data

      setUsuarios(filtrados)

      // Se já houver um valor selecionado, tenta encontrar o objeto para exibir o nome
      if (value && !usuarioSelecionado) {
        const selecionado = filtrados.find(u => String(u.id) === String(value))
        if (selecionado) setUsuarioSelecionado(selecionado)
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setLoading(false)
    }
  }, [value, funcaoFiltro, usuarioSelecionado])

  // Efeito para busca com debounce manual
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) carregarUsuarios(termo)
    }, 300)
    return () => clearTimeout(timer)
  }, [termo, open, carregarUsuarios])

  // Carregar inicial para mostrar o nome do usuário já selecionado (se houver)
  useEffect(() => {
    if (value && !usuarioSelecionado) {
      carregarUsuarios("")
    }
  }, [value, usuarioSelecionado, carregarUsuarios])

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)

        if (isOpen) {
          setTimeout(() => {
            inputRef.current?.focus()
          }, 0)
        }
      }}
    >
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            value={termo}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pr-10 bg-white"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </PopoverTrigger>

      {/* O PopoverContent garante que a lista feche ao clicar fora */}
      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width] shadow-xl border border-gray-200 bg-white"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()} // Evita que o foco saia do input ao abrir
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-60 overflow-y-auto">
            {usuarios.length === 0 && !loading && (
              <div className="p-4 text-sm text-gray-500 text-center">Nenhum usuário encontrado.</div>
            )}
            <CommandGroup>
              {usuarios.map((usuario) => (
                <CommandItem
                  key={usuario.id}
                  value={usuario.nome}
                  onSelect={() => {
                    setUsuarioSelecionado(usuario)
                    setTermo(usuario.nome)
                    onChange(usuario.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer hover:bg-blue-50 py-2 px-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-blue-600",
                        String(value) === String(usuario.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-medium">{usuario.nome}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {usuario.funcao}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function ConferenciaForm({ onSuccess }) {
  const [conferencia, setConferencia] = useState(CONFERENCIA_PADRAO);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Estados para detecção de duplicidade
  const [verificandoDuplicidade, setVerificandoDuplicidade] = useState(false);
  const [conferenciaAnterior, setConferenciaAnterior] = useState(null);
  const [alertaDuplicidade, setAlertaDuplicidade] = useState(null);
  const [confirmadoDuplicidade, setConfirmadoDuplicidade] = useState(false);

  // Função de verificação robusta de duplicidade
  const executarVerificacao = async (nomeCaixa) => {
    if (!nomeCaixa || nomeCaixa.length < 3) {
      setConferenciaAnterior(null);
      setAlertaDuplicidade(null);
      return;
    }

    setVerificandoDuplicidade(true);
    try {
      const resultados = await conferenciasService.buscarPorCaixa(nomeCaixa);
      if (resultados && resultados.length > 0) {
        const ultima = resultados.sort((a, b) => new Date(b.dataConferencia) - new Date(a.dataConferencia))[0];
        setConferenciaAnterior(ultima);

        const dataUltima = new Date(ultima.dataConferencia);
        const hoje = new Date();
        const diffTime = Math.abs(hoje - dataUltima);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
          setAlertaDuplicidade('confirmacao');
          setConfirmadoDuplicidade(false);
        } else {
          setAlertaDuplicidade('aviso');
          setConfirmadoDuplicidade(true);
        }
      } else {
        setAlertaDuplicidade(null);
        setConferenciaAnterior(null);
      }
    } catch (error) {
      console.error('Erro na busca de duplicidade:', error);
    } finally {
      setVerificandoDuplicidade(false);
    }
  };

  // Debounce para digitação da caixa
  const verificarDebounced = useCallback(
    debounce((val) => executarVerificacao(val), 500),
    []
  );

  const atualizarCampoCaixa = (campo, valor) => {
    setConferencia(prev => ({ ...prev, [campo]: valor }));
    if (campo === 'caixa') verificarDebounced(valor);
    if (erros[campo]) {
      setErros(prev => {
        const novosErros = { ...prev };
        delete novosErros[campo];
        return novosErros;
      });
    }
  };

  const atualizarCampo = (campo, valor) => {
    setConferencia(prev => ({ ...prev, [campo]: valor }));
    if (erros[campo]) {
      setErros(prev => {
        const novosErros = { ...prev };
        delete novosErros[campo];
        return novosErros;
      });
    }
  };

  const atualizarPorta = (index, campo, valor) => {
    setConferencia(prev => ({
      ...prev,
      portas: prev.portas.map((porta, i) => i === index ? { ...porta, [campo]: valor } : porta)
    }));
  };

  const adicionarMultiplasPortas = (quantidade) => {
    setConferencia(prev => {
      const inicio = prev.portas.length + 1;
      const novasPortas = Array.from({ length: quantidade }, (_, i) => ({
        ...PORTA_PADRAO,
        nrPorta: inicio + i
      }));
      return { ...prev, portas: [...prev.portas, ...novasPortas] };
    });
  };

  const removerPorta = (index) => {
    if (conferencia.portas.length > 1) {
      setConferencia(prev => ({
        ...prev,
        portas: prev.portas.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (alertaDuplicidade === 'confirmacao' && !confirmadoDuplicidade) {
      setMensagem({ tipo: 'erro', texto: 'Confirme que deseja prosseguir com a conferência recente.' });
      return;
    }

    const { valido, erros: errosValidacao } = validarConferencia(conferencia);
    if (!valido) {
      setErros(errosValidacao);
      setMensagem({ tipo: 'erro', texto: 'Por favor, corrija os erros no formulário.' });
      return;
    }

    setLoading(true);
    try {
      await conferenciasService.criarConferencia(conferencia);
      setMensagem({ tipo: 'sucesso', texto: MENSAGENS.SUCESSO_CRIAR });
      setConferencia(CONFERENCIA_PADRAO);
      setAlertaDuplicidade(null);
      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (error) {
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

          {/* ALERTA DE DUPLICIDADE */}
          {alertaDuplicidade && conferenciaAnterior && (
            <Alert className={`mb-6 border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${alertaDuplicidade === 'confirmacao' ? 'border-orange-300 bg-orange-50' : 'border-blue-200 bg-blue-50'
              }`}>
              {alertaDuplicidade === 'confirmacao' ? <AlertTriangle className="h-5 w-5 text-orange-600" /> : <Info className="h-5 w-5 text-blue-600" />}
              <AlertTitle className={`font-bold ${alertaDuplicidade === 'confirmacao' ? 'text-orange-800' : 'text-blue-800'}`}>
                {alertaDuplicidade === 'confirmacao' ? 'Atenção: Caixa conferida recentemente!' : 'Informação: Caixa já conferida'}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="text-sm">
                  Esta caixa foi conferida em <strong>{formatarData(conferenciaAnterior.dataConferencia)}</strong>.
                </p>
                {alertaDuplicidade === 'confirmacao' && (
                  <div className="flex items-center gap-3 mt-3 p-2 bg-white rounded border border-orange-200">
                    <input
                      type="checkbox"
                      id="confirmar-dup"
                      checked={confirmadoDuplicidade}
                      onChange={(e) => setConfirmadoDuplicidade(e.target.checked)}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <Label htmlFor="confirmar-dup" className="text-orange-900 font-medium cursor-pointer">
                      Estou ciente e desejo realizar uma nova conferência.
                    </Label>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
              <div className="md:col-span-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Informações Gerais</h3>
              </div>
              <div className="relative">
                <Label htmlFor="caixa" className="font-semibold">Caixa *</Label>
                <div className="relative">
                  <Input
                    id="caixa"
                    value={conferencia.caixa}
                    onChange={(e) => atualizarCampo('caixa', e.target.value)}
                    onBlur={(e) => executarVerificacao(e.target.value)} // Verifica também ao sair do campo
                    className={erros.caixa ? 'border-red-500' : ''}
                  />
                  {verificandoDuplicidade && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
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

              {/* TÉCNICO INTERNO COM BUSCA VIA API */}
              <div>
                <Label className="font-semibold">Técnico Interno *</Label>
                <ComboboxUsuarioAPI
                  value={conferencia.tecInterno_id}
                  onChange={(v) => atualizarCampo('tecInterno_id', v)}
                  placeholder="Buscar técnico interno..."
                  funcaoFiltro="Operador"
                />
                {erros.tecInterno_id && <p className="text-xs text-red-500 mt-1">{erros.tecInterno_id}</p>}
              </div>

              {/* TÉCNICO EXTERNO COM BUSCA VIA API */}
              <div className="md:col-span-2">
                <Label className="font-semibold">Técnico Externo *</Label>
                <ComboboxUsuarioAPI
                  value={conferencia.tecExterno_id}
                  onChange={(v) => atualizarCampo('tecExterno_id', v)}
                  placeholder="Buscar técnico externo..."
                  funcaoFiltro="Técnico"
                />
                {erros.tecExterno_id && <p className="text-xs text-red-500 mt-1">{erros.tecExterno_id}</p>}
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
              <Button type="submit" disabled={loading || (alertaDuplicidade === 'confirmacao' && !confirmadoDuplicidade)} className="min-w-[150px]">
                {loading ? 'Salvando...' : 'Salvar Conferência'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}