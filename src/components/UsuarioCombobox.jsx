import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usuariosService } from '../services/api';

const obterUsuarioId = (usuario) => usuario.id ?? usuario.idUsuario ?? usuario.usuarioId;

const correspondeFuncao = (funcaoUsuario, funcaoFiltro) => {
  if (!funcaoFiltro) return true;

  const funcao = String(funcaoUsuario || '').trim().toLowerCase();
  const filtro = funcaoFiltro.trim().toLowerCase();

  if (filtro.includes('operador')) return funcao.includes('operador');
  if (filtro.includes('cnico')) return funcao.includes('cnico');
  return funcao === filtro;
};

export default function UsuarioCombobox({
  value,
  onChange,
  placeholder = 'Selecione um usuário...',
  funcaoFiltro = null,
  nomeInicial = '',
}) {
  const [open, setOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [nomeSelecionado, setNomeSelecionado] = useState(nomeInicial);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setNomeSelecionado(nomeInicial);
  }, [nomeInicial]);

  useEffect(() => {
    if (!open) return undefined;

    const fecharAoClicarFora = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', fecharAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharAoClicarFora);
  }, [open]);

  const carregarUsuarios = useCallback(async (termo = '') => {
    setLoading(true);
    setErro('');

    try {
      const resposta = await usuariosService.buscarUsuariosPorTermo(termo);
      const lista = Array.isArray(resposta) ? resposta : (resposta?.content || []);
      const filtrados = lista.filter((usuario) => correspondeFuncao(usuario.funcao, funcaoFiltro));

      // Se o backend usar outra nomenclatura de função, ainda permite selecionar o usuário.
      setUsuarios(filtrados.length > 0 ? filtrados : lista);
    } catch {
      setUsuarios([]);
      setErro('Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }, [funcaoFiltro]);

  useEffect(() => {
    if (!open) return undefined;

    const timer = setTimeout(
      () => carregarUsuarios(termoBusca),
      termoBusca ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [termoBusca, open, carregarUsuarios]);

  const abrirOuFechar = () => {
    setOpen((aberto) => {
      const proximoEstado = !aberto;
      if (proximoEstado) {
        setTermoBusca('');
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return proximoEstado;
    });
  };

  const selecionarUsuario = (usuario) => {
    const usuarioId = obterUsuarioId(usuario);

    if (usuarioId == null) {
      setErro('O usuário selecionado não possui um identificador válido.');
      return;
    }

    setNomeSelecionado(usuario.nome);
    onChange(usuarioId, usuario);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={abrirOuFechar}
        className="w-full justify-between bg-white font-normal"
      >
        <span className={cn('truncate', !nomeSelecionado && 'text-muted-foreground')}>
          {nomeSelecionado || placeholder}
        </span>
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <ChevronDown className="h-4 w-4 opacity-50" />}
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-[100] mt-1 w-full min-w-72 rounded-md border bg-white text-gray-900 shadow-xl dark:bg-slate-800 dark:text-slate-100">
          <div className="flex items-center gap-2 border-b p-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              value={termoBusca}
              onChange={(event) => setTermoBusca(event.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent px-1 py-1 text-sm outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            {loading && <div className="p-4 text-center text-sm text-gray-500">Carregando usuários...</div>}
            {erro && <div className="p-4 text-center text-sm text-red-600">{erro}</div>}
            {!loading && !erro && usuarios.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">Nenhum usuário encontrado.</div>
            )}

            {!loading && usuarios.map((usuario) => {
              const usuarioId = obterUsuarioId(usuario);
              const selecionado = String(value) === String(usuarioId);

              return (
                <button
                  key={usuarioId ?? usuario.nome}
                  type="button"
                  onClick={() => selecionarUsuario(usuario)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Check className={cn('h-4 w-4 shrink-0', selecionado ? 'opacity-100' : 'opacity-0')} />
                  <span className="font-medium">{usuario.nome}</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{usuario.funcao}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
