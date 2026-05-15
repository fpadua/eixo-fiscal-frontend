'use client';

import { useState } from 'react';
import { nfseApi } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Search, 
  FileText, 
  XCircle, 
  ListFilter, 
  ClipboardCheck, 
  Info, 
  FileSearch, 
  ArrowUpDown, 
  ArrowDownToLine, 
  User, 
  Replace, 
  Hash, 
  Layers, 
  Package,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConsultarPage() {
  const { settings } = useSettings();
  const nfseVersion = settings?.nfseVersion === 'v2' ? 'v2' : 'v1';
  const [tab, setTab] = useState('rps');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const [numeroRps, setNumeroRps] = useState('');
  const [serie, setSerie] = useState('A1');

  const [faixaInicial, setFaixaInicial] = useState('');
  const [faixaFinal, setFaixaFinal] = useState('');
  const [pagina, setPagina] = useState(1);

  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  const [numeroDps, setNumeroDps] = useState('');
  const [serieDps, setSerieDps] = useState('00001');

  const [protocolo, setProtocolo] = useState('');
  const [numeroNfseUrl, setNumeroNfseUrl] = useState('');

  const buscarPorRps = async () => {
    if (!numeroRps) return;
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.consultarPorRps(numeroRps, serie);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const buscarPorFaixa = async () => {
    if (!faixaInicial || !faixaFinal) return;
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.consultarPorFaixa(faixaInicial, faixaFinal, pagina);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const buscarPrestadas = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.consultarPrestadas(pagina, dataInicial, dataFinal);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const buscarTomados = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.consultarTomados(pagina, dataInicial, dataFinal);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const buscarPorDps = async () => {
    if (!numeroDps) return;
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.consultarPorDps(numeroDps, serieDps);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const buscarDadosCadastrais = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.dadosCadastrais();
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const buscarDpsDisponivel = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.dpsDisponivel(pagina);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const consultarLote = async () => {
    if (!protocolo) return;
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.consultarLote(protocolo);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const consultarSituacaoLote = async () => {
    if (!protocolo) return;
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.consultarSituacaoLote(protocolo);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const consultarUrlNfse = async () => {
    if (!numeroNfseUrl) return;
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.consultarUrlNfse(numeroNfseUrl);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'rps', label: 'RPS', icon: ClipboardCheck },
    { id: 'faixa', label: 'Faixa', icon: ListFilter },
    { id: 'prestadas', label: 'Prestadas', icon: ArrowUpDown },
    { id: 'tomados', label: 'Tomadas', icon: ArrowDownToLine },
    ...(nfseVersion === 'v2' ? [{ id: 'dps', label: 'DPS', icon: Hash }] : []),
    { id: 'dados', label: 'Dados', icon: User },
    { id: 'disponivel', label: 'Disponível', icon: Package },
    { id: 'lote', label: 'Lote', icon: Layers },
    { id: 'situacao-lote', label: 'Situação Lote', icon: Layers },
    ...(nfseVersion === 'v2' ? [{ id: 'url-nfse', label: 'URL NFS-e', icon: Replace }] : []),
  ];

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
          <Search size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Consultar NFS-e</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Rastreamento e auditoria de documentos</p>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide md:bg-gray-100/50 md:p-1 md:rounded-2xl">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button 
              key={t.id}
              onClick={() => { setTab(t.id); setResultado(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 md:border-none'
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 3 : 2} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form Card */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-indigo-50/20 border-b border-indigo-100/30">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-900 uppercase tracking-widest">
              <Zap size={16} /> Parâmetros de Busca
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {tab === 'rps' 
                ? 'Localize a nota pelo número do RPS original.' 
                : tab === 'faixa'
                ? 'Busque um intervalo sequencial de notas.'
                : tab === 'prestadas'
                ? 'Serviços emitidos por você no período.'
                : tab === 'tomados'
                ? 'Serviços contratados por você no período.'
                : tab === 'dps'
                ? 'Busca técnica pelo número do DPS Nacional.'
                : tab === 'dados'
                ? 'Verificar situação cadastral do prestador.'
                : tab === 'disponivel'
                ? 'Checar próxima numeração disponível.'
                : tab === 'situacao-lote'
                ? 'Consultar apenas o status de processamento do lote.'
                : tab === 'url-nfse'
                ? 'Consultar URL oficial da NFS-e para visualização/compartilhamento.'
                : 'Auditar processamento de lote enviado.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {tab === 'rps' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Número do RPS *</Label>
                    <Input 
                      type="number" 
                      min="1"
                      className="h-12 bg-gray-50 border-none"
                      value={numeroRps} 
                      onChange={e => setNumeroRps(e.target.value)}
                      placeholder="Ex: 370" 
                    />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Série</Label>
                    <Input 
                      maxLength={5}
                      className="h-12 bg-gray-50 border-none"
                      value={serie} 
                      onChange={e => setSerie(e.target.value)} 
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl" 
                  onClick={buscarPorRps} 
                  disabled={loading || !numeroRps}
                >
                  {loading ? 'Processando...' : 'Consultar Documento'}
                </Button>
              </div>
            )}

            {tab === 'faixa' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Inicial</Label>
                    <Input 
                      type="number" 
                      className="h-12 bg-gray-50 border-none"
                      value={faixaInicial} 
                      onChange={e => setFaixaInicial(e.target.value)} 
                      placeholder="Ex: 1" 
                    />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Final</Label>
                    <Input 
                      type="number" 
                      className="h-12 bg-gray-50 border-none"
                      value={faixaFinal} 
                      onChange={e => setFaixaFinal(e.target.value)} 
                      placeholder="Ex: 100" 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Página</Label>
                  <Input 
                    type="number" 
                    min="1"
                    className="h-12 bg-gray-50 border-none"
                    value={pagina} 
                    onChange={e => setPagina(Number(e.target.value))} 
                  />
                </div>
                <Button 
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl" 
                  onClick={buscarPorFaixa} 
                  disabled={loading || !faixaInicial || !faixaFinal}
                >
                  {loading ? 'Processando...' : 'Consultar por Faixa'}
                </Button>
              </div>
            )}

            {(tab === 'prestadas' || tab === 'tomados') && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Data Inicial</Label>
                    <Input 
                      type="date" 
                      className="h-12 bg-gray-50 border-none"
                      value={dataInicial} 
                      onChange={e => setDataInicial(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Data Final</Label>
                    <Input 
                      type="date" 
                      className="h-12 bg-gray-50 border-none"
                      value={dataFinal} 
                      onChange={e => setDataFinal(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Página</Label>
                  <Input 
                    type="number" 
                    min="1"
                    className="h-12 bg-gray-50 border-none"
                    value={pagina} 
                    onChange={e => setPagina(Number(e.target.value))} 
                  />
                </div>
                <Button 
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl" 
                  onClick={tab === 'prestadas' ? buscarPrestadas : buscarTomados} 
                  disabled={loading}
                >
                  {loading ? 'Processando...' : tab === 'prestadas' ? 'Listar Prestadas' : 'Listar Tomadas'}
                </Button>
              </div>
            )}

            {tab === 'dps' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Número DPS *</Label>
                    <Input 
                      type="number" 
                      min="1"
                      className="h-12 bg-gray-50 border-none"
                      value={numeroDps} 
                      onChange={e => setNumeroDps(e.target.value)}
                      placeholder="Ex: 1" 
                    />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Série</Label>
                    <Input 
                      maxLength={5}
                      className="h-12 bg-gray-50 border-none"
                      value={serieDps} 
                      onChange={e => setSerieDps(e.target.value)} 
                      placeholder="00001"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl" 
                  onClick={buscarPorDps} 
                  disabled={loading || !numeroDps}
                >
                  {loading ? 'Processando...' : 'Consultar por DPS'}
                </Button>
              </div>
            )}

            {tab === 'dados' && (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-700 text-xs font-medium leading-relaxed">
                  Esta consulta retorna as informações cadastrais completas do prestador ativo, incluindo regimes de tributação e permissões de emissão.
                </div>
                <Button 
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl" 
                  onClick={buscarDadosCadastrais} 
                  disabled={loading}
                >
                  {loading ? 'Consultando...' : 'Ver Dados Cadastrais'}
                </Button>
              </div>
            )}

            {tab === 'disponivel' && (
              <div className="space-y-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Página</Label>
                  <Input 
                    type="number" 
                    min="1"
                    className="h-12 bg-gray-50 border-none"
                    value={pagina} 
                    onChange={e => setPagina(Number(e.target.value))} 
                  />
                </div>
                <Button 
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl" 
                  onClick={buscarDpsDisponivel} 
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Verificar Numeração'}
                </Button>
              </div>
            )}

            {tab === 'lote' && (
              <div className="space-y-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Protocolo do Lote *</Label>
                  <Input 
                    className="h-12 bg-gray-50 border-none font-mono"
                    value={protocolo} 
                    onChange={e => setProtocolo(e.target.value)}
                    placeholder="Ex: 5208707123..." 
                  />
                </div>
                <Button 
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl" 
                  onClick={consultarLote} 
                  disabled={loading || !protocolo}
                >
                  {loading ? 'Processando...' : 'Consultar Lote'}
                </Button>
              </div>
            )}

            {tab === 'situacao-lote' && (
              <div className="space-y-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Protocolo do Lote *</Label>
                  <Input
                    className="h-12 bg-gray-50 border-none font-mono"
                    value={protocolo}
                    onChange={e => setProtocolo(e.target.value)}
                    placeholder="Ex: 5208707123..."
                  />
                </div>
                <Button
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl"
                  onClick={consultarSituacaoLote}
                  disabled={loading || !protocolo}
                >
                  {loading ? 'Processando...' : 'Consultar Situação do Lote'}
                </Button>
              </div>
            )}

            {tab === 'url-nfse' && nfseVersion === 'v2' && (
              <div className="space-y-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Número da NFS-e *</Label>
                  <Input
                    type="number"
                    min="1"
                    className="h-12 bg-gray-50 border-none"
                    value={numeroNfseUrl}
                    onChange={e => setNumeroNfseUrl(e.target.value)}
                    placeholder="Ex: 370"
                  />
                </div>
                <Button
                  className="w-full h-14 font-bold shadow-lg shadow-indigo-100 rounded-xl"
                  onClick={consultarUrlNfse}
                  disabled={loading || !numeroNfseUrl}
                >
                  {loading ? 'Processando...' : 'Consultar URL da NFS-e'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info & Results Section */}
        <div className="space-y-6">
          <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-black text-[10px] uppercase tracking-widest">
              <Info size={14} /> Dica de Auditoria
            </div>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Diferente da consulta por número de nota, a consulta por **RPS** permite verificar documentos que acabaram de ser enviados e ainda estão sendo processados pela prefeitura de Goiânia.
            </p>
          </div>

          {resultado ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className={`border-none shadow-xl ${resultado.ok ? 'bg-white' : 'bg-red-50 text-red-900 border-red-100'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    {resultado.ok ? <FileText size={18} className="text-indigo-600" /> : <XCircle size={18} className="text-red-500" />}
                    {resultado.ok ? 'Resultado Encontrado' : 'Erro na Consulta'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resultado.ok ? (
                    <div className="bg-gray-900 rounded-xl p-4 overflow-hidden">
                      <pre className="text-[10px] md:text-xs text-emerald-400 font-mono overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10">
                        {JSON.stringify(resultado.dados, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold">{resultado.erro}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6 opacity-30 select-none">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-dashed border-gray-200">
                <FileSearch size={40} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Aguardando Parâmetros</h3>
              <p className="text-xs text-gray-500 mt-2 max-w-[180px] leading-relaxed font-medium">
                Escolha uma aba e preencha os campos para iniciar a busca.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="h-12 md:hidden" />
    </div>
  );
}
