import { useState } from 'react';
import { AlertCircle, Plus, Save, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { PORTA_PADRAO, STATUS_OPTIONS } from '../lib/constants';
import { validarConferencia } from '../lib/utils';
import { conferenciasService } from '../services/api';
import UsuarioCombobox from './UsuarioCombobox';

const obterIdUsuario = (conferencia, tipo) => {
  const objeto = conferencia[tipo];
  return conferencia[`${tipo}Id`]
    ?? conferencia[`${tipo}_id`]
    ?? objeto?.id
    ?? objeto?.idUsuario
    ?? 0;
};

const paraDataHoraLocal = (data) => (data ? String(data).slice(0, 16) : '');

const criarEstadoEdicao = (conferencia) => ({
  idConferencia: conferencia.idConferencia,
  caixa: conferencia.caixa || '',
  cidade: conferencia.cidade || '',
  dataConferencia: paraDataHoraLocal(conferencia.dataConferencia),
  observacao: conferencia.observacao || '',
  tecInterno_id: obterIdUsuario(conferencia, 'tecInterno'),
  tecExterno_id: obterIdUsuario(conferencia, 'tecExterno'),
  portas: (conferencia.portas || []).map((porta) => ({
    portaId: porta.portaId ?? porta.idPorta ?? porta.id,
    nrPorta: porta.nrPorta,
    cliente: porta.cliente || '',
    status: porta.status || PORTA_PADRAO.status,
    plotado: porta.plotado === true || porta.plotado === 'true',
    observacao: porta.observacao || '',
  })),
});

export default function ConferenciaEditForm({ conferencia, onCancel, onSuccess }) {
  const [dados, setDados] = useState(() => criarEstadoEdicao(conferencia));
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [salvando, setSalvando] = useState(false);

  const atualizarCampo = (campo, valor) => {
    setDados((anterior) => ({ ...anterior, [campo]: valor }));
    setErros((anteriores) => {
      if (!anteriores[campo]) return anteriores;
      const atualizados = { ...anteriores };
      delete atualizados[campo];
      return atualizados;
    });
  };

  const atualizarPorta = (index, campo, valor) => {
    setDados((anterior) => ({
      ...anterior,
      portas: anterior.portas.map((porta, posicao) => (
        posicao === index ? { ...porta, [campo]: valor } : porta
      )),
    }));
  };

  const adicionarPortas = (quantidade) => {
    setDados((anterior) => {
      const maiorNumero = anterior.portas.reduce(
        (maior, porta) => Math.max(maior, Number(porta.nrPorta) || 0),
        0
      );
      const novasPortas = Array.from({ length: quantidade }, (_, index) => ({
        ...PORTA_PADRAO,
        nrPorta: maiorNumero + index + 1,
      }));
      return { ...anterior, portas: [...anterior.portas, ...novasPortas] };
    });
  };

  const removerPorta = (index) => {
    setDados((anterior) => ({
      ...anterior,
      portas: anterior.portas.filter((_, posicao) => posicao !== index),
    }));
  };

  const salvar = async (event) => {
    event.preventDefault();
    const validacao = validarConferencia(dados);

    if (!validacao.valido) {
      setErros(validacao.erros);
      setMensagem({ tipo: 'erro', texto: 'Corrija os campos indicados antes de salvar.' });
      return;
    }

    const payload = {
      idConferencia: dados.idConferencia,
      caixa: dados.caixa.trim(),
      cidade: dados.cidade.trim(),
      dataConferencia: dados.dataConferencia.length === 16
        ? `${dados.dataConferencia}:00`
        : dados.dataConferencia,
      observacao: dados.observacao.trim(),
      tecInternoId: Number(dados.tecInterno_id),
      tecExternoId: Number(dados.tecExterno_id),
      portas: dados.portas.map((porta) => ({
        ...(porta.portaId != null && { portaId: porta.portaId }),
        nrPorta: Number(porta.nrPorta),
        cliente: porta.cliente.trim(),
        status: porta.status,
        plotado: Boolean(porta.plotado),
        observacao: porta.observacao.trim(),
      })),
    };

    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await conferenciasService.atualizarConferencia(payload);
      setMensagem({ tipo: 'sucesso', texto: 'Conferência atualizada com sucesso.' });
      setTimeout(onSuccess, 700);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível atualizar a conferência.' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={salvar} className="space-y-6">
      {mensagem.texto && (
        <Alert className={mensagem.tipo === 'sucesso' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={mensagem.tipo === 'sucesso' ? 'text-green-800' : 'text-red-800'}>
            {mensagem.texto}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="editar-caixa">Caixa *</Label>
          <Input
            id="editar-caixa"
            value={dados.caixa}
            onChange={(event) => atualizarCampo('caixa', event.target.value)}
            className={erros.caixa ? 'border-red-500' : ''}
          />
          {erros.caixa && <p className="mt-1 text-xs text-red-500">{erros.caixa}</p>}
        </div>

        <div>
          <Label htmlFor="editar-cidade">Cidade *</Label>
          <Input
            id="editar-cidade"
            value={dados.cidade}
            onChange={(event) => atualizarCampo('cidade', event.target.value)}
            className={erros.cidade ? 'border-red-500' : ''}
          />
          {erros.cidade && <p className="mt-1 text-xs text-red-500">{erros.cidade}</p>}
        </div>

        <div>
          <Label htmlFor="editar-data">Data da conferência *</Label>
          <Input
            id="editar-data"
            type="datetime-local"
            value={dados.dataConferencia}
            onChange={(event) => atualizarCampo('dataConferencia', event.target.value)}
            className={erros.dataConferencia ? 'border-red-500' : ''}
          />
          {erros.dataConferencia && <p className="mt-1 text-xs text-red-500">{erros.dataConferencia}</p>}
        </div>

        <div>
          <Label>Técnico interno *</Label>
          <UsuarioCombobox
            value={dados.tecInterno_id}
            onChange={(id) => atualizarCampo('tecInterno_id', id)}
            placeholder="Buscar técnico interno..."
            funcaoFiltro="Operador"
            nomeInicial={conferencia.tecInterno?.nome || ''}
          />
          {erros.tecInterno_id && <p className="mt-1 text-xs text-red-500">{erros.tecInterno_id}</p>}
        </div>

        <div>
          <Label>Técnico externo *</Label>
          <UsuarioCombobox
            value={dados.tecExterno_id}
            onChange={(id) => atualizarCampo('tecExterno_id', id)}
            placeholder="Buscar técnico externo..."
            funcaoFiltro="Técnico"
            nomeInicial={conferencia.tecExterno?.nome || ''}
          />
          {erros.tecExterno_id && <p className="mt-1 text-xs text-red-500">{erros.tecExterno_id}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="editar-observacao">Observação</Label>
          <Textarea
            id="editar-observacao"
            value={dados.observacao}
            onChange={(event) => atualizarCampo('observacao', event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Portas</h3>
          <div className="flex flex-wrap gap-2">
            {[1, 8, 16, 24].map((quantidade) => (
              <Button key={quantidade} type="button" variant="outline" size="sm" onClick={() => adicionarPortas(quantidade)}>
                <Plus className="mr-1 h-4 w-4" /> +{quantidade}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="w-44">Status</TableHead>
                <TableHead className="w-24 text-center">Plotado</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.portas.map((porta, index) => (
                <TableRow key={porta.portaId ?? `nova-${index}`}>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={porta.nrPorta}
                      onChange={(event) => atualizarPorta(index, 'nrPorta', event.target.value)}
                      className={erros[`porta_${index}_nrPorta`] ? 'border-red-500' : ''}
                    />
                  </TableCell>
                  <TableCell>
                    <Input value={porta.cliente} onChange={(event) => atualizarPorta(index, 'cliente', event.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Select value={porta.status} onValueChange={(valor) => atualizarPorta(index, 'status', valor)}>
                      <SelectTrigger className={erros[`porta_${index}_status`] ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value}>{opcao.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={porta.plotado}
                      onChange={(event) => atualizarPorta(index, 'plotado', event.target.checked)}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    <Input value={porta.observacao} onChange={(event) => atualizarPorta(index, 'observacao', event.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removerPorta(index)} aria-label={`Remover porta ${porta.nrPorta}`}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {erros.portas && <p className="mt-2 text-sm text-red-500">{erros.portas}</p>}
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={salvando}>Cancelar</Button>
        <Button type="submit" disabled={salvando}>
          <Save className="mr-2 h-4 w-4" />
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
