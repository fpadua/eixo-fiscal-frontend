'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nfseApi } from '@/lib/api';
import { 
  FileText, 
  Search, 
  Filter, 
  XCircle, 
  Eye, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Printer,
  DollarSign,
  EyeOff,
  History,
  MoreVertical,
  Download,
  Copy,
  Layers,
  Building2,
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const NOTAS_MOCK = [
  { Nfse: { InfNfse: { nNFSe: '000001', CodigoVerificacao: 'ABCD1234EFGH', dhEmi: '2026-05-08T10:30:00' } }, Tomador: { xNome: 'Empresa ABC Ltda' }, valor: 15000 },
  { Nfse: { InfNfse: { nNFSe: '000002', CodigoVerificacao: 'IJKL5678MNOP', dhEmi: '2026-05-07T14:20:00' } }, Tomador: { xNome: 'Corporação XYZ S/A' }, valor: 8500 },
  { Nfse: { InfNfse: { nNFSe: '000003', CodigoVerificacao: 'QRST9012UVWX', dhEmi: '2026-05-06T09:15:00', status: 'C' } }, Tomador: { xNome: 'Industries DEF' }, valor: 5200 },
  { Nfse: { InfNfse: { nNFSe: '000004', CodigoVerificacao: 'YZAB3456CDEF', dhEmi: '2026-05-05T16:45:00' } }, Tomador: { xNome: 'GHI Solutions' }, valor: 12000 },
  { Nfse: { InfNfse: { nNFSe: '000005', CodigoVerificacao: 'GHIJ7890KLMN', dhEmi: '2026-05-04T11:00:00', status: 'S' } }, Tomador: { xNome: 'Tech Labs' }, valor: 9500 },
  { Nfse: { InfNfse: { nNFSe: '000006', CodigoVerificacao: 'NOPQ1234RSTU', dhEmi: '2026-05-03T13:30:00' } }, Tomador: { xNome: 'Contabilidade Beta' }, valor: 3500 },
  { Nfse: { InfNfse: { nNFSe: '000007', CodigoVerificacao: 'VWXY5678ZABC', dhEmi: '2026-05-02T10:00:00' } }, Tomador: { xNome: 'DataCorp' }, valor: 6800 },
  { Nfse: { InfNfse: { nNFSe: '000008', CodigoVerificacao: 'DEFG9012HIJK', dhEmi: '2026-05-01T15:20:00' } }, Tomador: { xNome: 'Software House' }, valor: 18000 },
  { Nfse: { InfNfse: { nNFSe: '000009', CodigoVerificacao: 'LMNO3456PQRS', dhEmi: '2026-04-30T09:45:00' } }, Tomador: { xNome: 'Prestadora Service' }, valor: 4200 },
  { Nfse: { InfNfse: { nNFSe: '000010', CodigoVerificacao: 'TUVW7890XYZA', dhEmi: '2026-04-29T14:10:00' } }, Tomador: { xNome: 'Gestão Total' }, valor: 7500 },
];

export default function NotasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState([]);
  const [notasFiltradas, setNotasFiltradas] = useState([]);
  const [mostrarValores, setMostrarValores] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicial: '',
    dataFinal: '',
    tomador: '',
    status: 'todas',
  });
  const [tipoConsulta, setTipoConsulta] = useState('prestadas'); // 'prestadas' ou 'tomadas'

  const buscarNotasPrestadas = async () => {
    setLoading(true);
    try {
      const [soapResponse, dbResponse] = await Promise.all([
        nfseApi.consultarPrestadas(1, filtros.dataInicial, filtros.dataFinal).catch(() => ({ data: {} })),
        nfseApi.invoices.listar({
          page: 1,
          limit: 500,
          status: filtros.status !== 'todas' ? filtros.status : undefined,
          dataInicio: filtros.dataInicial || undefined,
          dataFim: filtros.dataFinal || undefined,
        }).catch(() => ({ data: { invoices: [] } })),
      ]);

      const dados = soapResponse.data;
      const soapNotas = Array.isArray(dados?.ListaNfse?.CompNfse)
        ? dados.ListaNfse.CompNfse.map(comp => ({
            Nfse: comp.Nfse,
            valor: comp.Nfse.InfNfse?.ValorTotalNfse || 0,
            origem: 'soap',
          }))
        : [];

      const dbNotas = (dbResponse.data?.invoices || []).map(inv => ({
        id: inv.id,
        Nfse: {
          InfNfse: {
            nNFSe: String(inv.numeroNota || ''),
            CodigoVerificacao: inv.chaveAcesso || '',
            dhEmi: inv.dataEmissao,
            status: inv.status === 'cancelada' ? 'C' : 'N',
          },
        },
        Tomador: { xNome: inv.client?.nomeRazaoSocial || '' },
        valor: inv.valorTotal || 0,
        origem: 'db',
      }));

      const todasNotas = [...soapNotas, ...dbNotas];
      setNotas(todasNotas);
      setNotasFiltradas(todasNotas);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      setNotas([]);
      setNotasFiltradas([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarNotasTomadas = async () => {
    setLoading(true);
    try {
      const response = await nfseApi.consultarTomados(1, filtros.dataInicial, filtros.dataFinal);
      const dados = response.data;
      const notasFormatadas = Array.isArray(dados?.ListaNfse?.CompNfse)
        ? dados.ListaNfse.CompNfse.map(comp => ({
            Nfse: comp.Nfse,
            valor: comp.Nfse.InfNfse?.ValorTotalNfse || 0,
            origem: 'soap',
          }))
        : [];
      setNotas(notasFormatadas);
      setNotasFiltradas(notasFormatadas);
    } catch (error) {
      console.error('Erro ao buscar notas tomadas:', error);
      setNotas([]);
      setNotasFiltradas([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarNotas = async () => {
    // por padrão carrega notas prestadas; pode ser ajustado futuramente
    await buscarNotasPrestadas();
  };

  useEffect(() => {
    buscarNotas();
  }, []);

  useEffect(() => {
    let resultado = [...notas];
    
    if (filtros.dataInicial) {
      resultado = resultado.filter(n => {
        const inf = n.Nfse?.InfNfse || n;
        const data = new Date(inf.dhEmi);
        return data >= new Date(filtros.dataInicial);
      });
    }
    
    if (filtros.dataFinal) {
      resultado = resultado.filter(n => {
        const inf = n.Nfse?.InfNfse || n;
        const data = new Date(inf.dhEmi);
        return data <= new Date(filtros.dataFinal + 'T23:59:59');
      });
    }
    
    if (filtros.tomador) {
      const busca = filtros.tomador.toLowerCase();
      resultado = resultado.filter(n => 
        (n.Tomador?.xNome || '').toLowerCase().includes(busca)
      );
    }
    
    if (filtros.status && filtros.status !== 'todas') {
      resultado = resultado.filter(n => {
        const status = n.Nfse?.InfNfse?.status || 'N';
        return status === filtros.status;
      });
    }
    
    setNotasFiltradas(resultado);
  }, [filtros, notas]);

  const formatarData = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return new Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'N': { label: 'Emitida', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      'C': { label: 'Cancelada', color: 'bg-red-50 text-red-700 border-red-100' },
      'S': { label: 'Substituída', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    };
    return badges[status] || badges['N'];
  };

  const verNota = (nota) => {
    const codigo = nota?.Nfse?.InfNfse?.CodigoVerificacao;
    const numero = nota?.Nfse?.InfNfse?.nNFSe;
    if (codigo && numero) {
      const safeNumero = String(numero).replace(/[^0-9]/g, '');
      const safeCodigo = String(codigo).replace(/[^a-zA-Z0-9]/g, '');
      window.open(`https://nfse.goiania.go.gov.br/secure/nfse/visualizarNotaFiscal.jsp?numeroNota=${safeNumero}&codigoVerificacao=${safeCodigo}`, '_blank', 'noopener,noreferrer');
    }
  };

  const duplicarNota = (nota) => {
    const inf = nota?.Nfse?.InfNfse || nota;
    const tomador = nota?.Tomador || {};
    
    const dadosParaDuplicar = {
      valorServicos: nota.valor || '',
      discriminacao: inf.xServ || '',
      itemListaServico: inf.itemListaServico || '01.01',
      cnpjCpfTomador: tomador.CNPJ || tomador.CPF || '',
      razaoSocialTomador: tomador.xNome || '',
    };

    sessionStorage.setItem('duplicarNota', JSON.stringify(dadosParaDuplicar));
    router.push('/emitir?duplicar=true');
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Minhas Notas</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Histórico de emissões</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarValores(!mostrarValores)}
            className="h-10 rounded-xl font-bold border-gray-100 bg-white"
          >
            {mostrarValores ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
            {mostrarValores ? 'Ocultar' : 'Valores'}
          </Button>
          <Button variant="default" size="sm" className="h-10 rounded-xl font-bold shadow-md">
            <Download size={16} className="mr-2" /> Exportar
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-indigo-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Filtros Avançados</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <Label className="text-[10px] font-bold text-gray-400 uppercase">Período</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="date" 
                  className="h-11 md:h-12 bg-gray-50 border-none text-xs"
                  value={filtros.dataInicial}
                  onChange={e => setFiltros({...filtros, dataInicial: e.target.value})}
                />
                <Input 
                  type="date" 
                  className="h-11 md:h-12 bg-gray-50 border-none text-xs"
                  value={filtros.dataFinal}
                  onChange={e => setFiltros({...filtros, dataFinal: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group md:col-span-2">
              <Label className="text-[10px] font-bold text-gray-400 uppercase">Tomador (Nome / Razão Social)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  className="h-11 md:h-12 pl-10 bg-gray-50 border-none"
                  placeholder="Ex: Empresa Ltda"
                  value={filtros.tomador}
                  onChange={e => setFiltros({...filtros, tomador: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <Label className="text-[10px] font-bold text-gray-400 uppercase">Status</Label>
              <Select value={filtros.status} onValueChange={val => setFiltros({...filtros, status: val})}>
                <SelectTrigger className="h-11 md:h-12 bg-gray-50 border-none">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos</SelectItem>
                  <SelectItem value="N">Normal</SelectItem>
                  <SelectItem value="C">Cancelada</SelectItem>
                  <SelectItem value="S">Substituída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {Object.values(filtros).some(v => v !== '' && v !== 'todas') && (
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setFiltros({ dataInicial: '', dataFinal: '', tomador: '', status: 'todas' })}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Buscando histórico...</p>
            </div>
          </div>
        ) : notasFiltradas.length === 0 ? (
          <Card className="border-none shadow-sm bg-white p-20 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-2">
                <AlertCircle size={32} />
              </div>
              <p className="text-gray-900 font-bold">Nenhuma nota encontrada</p>
              <p className="text-xs text-gray-400 font-medium">Ajuste os filtros e tente novamente.</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Card className="border-none shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 font-bold text-[10px] uppercase text-gray-400">Nº NFS-e</th>
                        <th className="px-6 py-4 font-bold text-[10px] uppercase text-gray-400">Data</th>
                        <th className="px-6 py-4 font-bold text-[10px] uppercase text-gray-400">Tomador</th>
                        <th className="px-6 py-4 font-bold text-[10px] uppercase text-gray-400 text-center">Status</th>
                        {mostrarValores && (
                          <th className="px-6 py-4 font-bold text-[10px] uppercase text-gray-400 text-right">Valor</th>
                        )}
                        <th className="px-6 py-4 font-bold text-[10px] uppercase text-gray-400 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {notasFiltradas.map((nota, index) => {
                        const inf = nota?.Nfse?.InfNfse || nota;
                        const tomador = nota?.Tomador?.xNome || '-';
                        const status = inf?.status || 'N';
                        const badge = getStatusBadge(status);
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50/30 transition-all group">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-indigo-600 font-bold text-base">#{inf.nNFSe}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{inf.CodigoVerificacao?.slice(0, 12)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-medium">
                              {formatarData(inf.dhEmi)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-gray-900 truncate max-w-[250px]">{tomador}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
                                {badge.label}
                              </span>
                            </td>
                            {mostrarValores && (
                              <td className="px-6 py-4 text-right font-black text-gray-900">
                                {formatarValor(nota.valor)}
                              </td>
                            )}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="outline" size="sm" className="h-9 px-3 text-indigo-600 border-indigo-100 hover:bg-indigo-50 font-bold" onClick={() => verNota(nota)}>
                                  <Printer size={16} className="mr-2" />
                                  Visualizar
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 px-3 text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-bold" onClick={() => duplicarNota(nota)}>
                                  <Layers size={16} className="mr-2" />
                                  Duplicar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-4">
              {notasFiltradas.map((nota, index) => {
                const inf = nota?.Nfse?.InfNfse || nota;
                const tomador = nota?.Tomador?.xNome || '-';
                const status = inf?.status || 'N';
                const badge = getStatusBadge(status);
                
                return (
                  <Card key={index} className="border border-gray-50 shadow-sm bg-white rounded-3xl overflow-hidden p-0">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Nº NFS-e</span>
                          <span className="text-xl font-black text-indigo-600 leading-none">#{inf.nNFSe}</span>
                        </div>
                        <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase border shadow-sm ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> Data Emissão
                          </span>
                          <span className="text-sm font-bold text-gray-600">{formatarData(inf.dhEmi)}</span>
                        </div>
                        {mostrarValores && (
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Valor Bruto</span>
                            <span className="text-sm font-black text-gray-900">{formatarValor(nota.valor)}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-50">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1 mb-1">
                          <Building2 size={10} /> Tomador do Serviço
                        </span>
                        <div className="text-sm font-bold text-gray-800 break-words line-clamp-2">{tomador}</div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <Button variant="outline" className="w-full h-12 text-indigo-600 border-indigo-100 hover:bg-indigo-50 font-black uppercase text-xs flex items-center justify-center gap-2 rounded-2xl shadow-sm" onClick={() => verNota(nota)}>
                          <Printer size={16} />
                          Visualizar NFS-e
                        </Button>
                        <Button variant="outline" className="w-full h-12 text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-black uppercase text-xs flex items-center justify-center gap-2 rounded-2xl shadow-sm" onClick={() => duplicarNota(nota)}>
                          <Layers size={16} />
                          Duplicar Nota
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div className="h-10 md:hidden" />
    </div>
  );
}