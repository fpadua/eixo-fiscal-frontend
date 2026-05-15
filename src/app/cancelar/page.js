'use client';

import { useEffect, useMemo, useState } from 'react';
import { nfseApi } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  XCircle, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Trash2, 
  Replace, 
  Info, 
  Lock,
  ChevronRight,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const MOTIVOS = [
  { value: 1, label: '1 – Erro na emissão' },
  { value: 2, label: '2 – Serviço não prestado' },
  { value: 3, label: '3 – Duplicidade' },
  { value: 4, label: '4 – Outros' },
];

const SUBSTITUICAO_TEMPLATES = {
  v1: {
    rps: {
      numero: 123,
      serie: 'A1',
      tipo: 1,
      dataEmissao: new Date().toISOString(),
      status: 1,
    },
    servico: {
      valorServicos: 100,
      aliquota: 2,
      issRetido: false,
      valorIss: 2,
      valorLiquido: 100,
      itemListaServico: '01.01',
      discriminacao: 'Servicos prestados',
      exigibilidadeIss: 1,
    },
    tomador: {
      documento: '12345678000199',
      razaoSocial: 'Tomador Exemplo Ltda',
    },
    optanteSimplesNacional: false,
    incentivoFiscal: false,
  },
  v2: {
    numeroDps: 123,
    serieDps: '00001',
    servico: {
      valorServicos: 100,
      aliquota: 2,
      issRetido: false,
      discriminacao: 'Servicos prestados',
      cTribNac: '010100',
    },
    tomador: {
      cnpj: '12345678000199',
      razaoSocial: 'Tomador Exemplo Ltda',
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '100',
        bairro: 'Centro',
        codigoMunicipio: '5208707',
        municipio: 'Goiania',
        uf: 'GO',
        cep: '74000000',
      },
    },
    optanteSimplesNacional: false,
  },
};

const getTemplateJson = (version) =>
  JSON.stringify(SUBSTITUICAO_TEMPLATES[version] || SUBSTITUICAO_TEMPLATES.v1, null, 2);

export default function CancelarPage() {
  const { settings } = useSettings();
  const nfseVersion = settings?.nfseVersion === 'v2' ? 'v2' : 'v1';
  const [tab, setTab] = useState('cancelar');
  const [numeroNota, setNumeroNota] = useState('');
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [motivo, setMotivo] = useState(1);
  const [confirmar, setConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const [numeroNotaSub, setNumeroNotaSub] = useState('');
  const [codigoVerificacaoSub, setCodigoVerificacaoSub] = useState('');
  const [motivoSub, setMotivoSub] = useState(1);
  const [novaDps, setNovaDps] = useState('');
  const [confirmarSub, setConfirmarSub] = useState(false);
  const templateAtual = useMemo(() => getTemplateJson(nfseVersion), [nfseVersion]);

  useEffect(() => {
    if (tab === 'substituir' && !novaDps.trim()) {
      setNovaDps(templateAtual);
    }
  }, [tab, novaDps, templateAtual]);

  const handleCancelar = async () => {
    if (!confirmar) return;
    setLoading(true);
    setResultado(null);
    try {
      const resp = await nfseApi.cancelar({
        numeroNota: Number(numeroNota),
        codigoVerificacao,
        motivo: Number(motivo),
      });
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
      setConfirmar(false);
    }
  };

  const handleSubstituir = async () => {
    if (!confirmarSub) return;
    let novaDpsObj;
    try {
      novaDpsObj = JSON.parse(novaDps);
    } catch {
      setResultado({ ok: false, erro: 'JSON inválido no campo Nova DPS. Revise a estrutura e tente novamente.' });
      return;
    }

    setLoading(true);
    setResultado(null);
    try {
      const payload = nfseVersion === 'v1'
        ? {
            numeroNotaSubstituida: Number(numeroNotaSub),
            codigoVerificacao: codigoVerificacaoSub,
            motivoCancelamento: Number(motivoSub),
            dadosNovaNota: novaDpsObj,
          }
        : {
            numeroNota: Number(numeroNotaSub),
            codigoVerificacao: codigoVerificacaoSub,
            motivo: Number(motivoSub),
            novaDps: novaDpsObj,
          };

      const resp = await nfseApi.substituir(payload);
      setResultado({ ok: true, dados: resp.data });
    } catch (err) {
      setResultado({ ok: false, erro: err.response?.data?.erro || err.message });
    } finally {
      setLoading(false);
      setConfirmarSub(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-lg shadow-red-100">
          <XCircle size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Cancelar / Substituir</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Gestão de reversão de documentos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100/50 rounded-2xl gap-1">
        <button 
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            tab === 'cancelar' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={() => { setTab('cancelar'); setResultado(null); }}
        >
          <Trash2 size={16} /> Cancelar
        </button>
        <button 
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            tab === 'substituir' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={() => { setTab('substituir'); setResultado(null); }}
        >
          <Replace size={16} /> Substituir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {tab === 'cancelar' ? (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-red-50/30 border-b border-red-100/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-900 uppercase tracking-widest">
                  <FileText size={16} /> Identificação da Nota
                </CardTitle>
                <CardDescription className="text-xs font-medium text-red-700/60">
                  Preencha os dados exatos da nota que deseja invalidar.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Número da Nota *</Label>
                    <Input 
                      type="number" 
                      min="1"
                      className="h-12 bg-gray-50 border-none focus-visible:ring-red-500"
                      value={numeroNota} 
                      onChange={e => setNumeroNota(e.target.value)}
                      placeholder="Ex: 370" 
                    />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Código de Verificação *</Label>
                    <Input 
                      className="h-12 bg-gray-50 border-none font-mono focus-visible:ring-red-500 uppercase"
                      value={codigoVerificacao} 
                      onChange={e => setCodigoVerificacao(e.target.value)}
                      placeholder="AbC1-2dE3" 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Motivo do Cancelamento *</Label>
                  <Select value={String(motivo)} onValueChange={(value) => setMotivo(value)}>
                    <SelectTrigger className="h-12 bg-gray-50 border-none">
                      <SelectValue placeholder="Selecione o motivo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTIVOS.map(m => (
                        <SelectItem key={m.value} value={String(m.value)}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="bg-red-50/30 border-t border-red-100/50 p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-red-100 shadow-sm">
                  <Checkbox 
                    id="confirmar" 
                    checked={confirmar} 
                    onCheckedChange={setConfirmar}
                    className="mt-0.5 border-red-200 data-[state=checked]:bg-red-600"
                  />
                  <Label htmlFor="confirmar" className="text-xs font-semibold leading-relaxed text-red-900 cursor-pointer">
                    Estou ciente de que o cancelamento da nota <span className="font-black">#{numeroNota || '—'}</span> é irreversível e anula os efeitos fiscais deste documento.
                  </Label>
                </div>
                <Button 
                  variant="destructive"
                  onClick={handleCancelar}
                  disabled={loading || !confirmar || !numeroNota || !codigoVerificacao}
                  className="w-full h-14 font-black uppercase tracking-widest shadow-lg shadow-red-100 rounded-xl"
                >
                  {loading ? 'Transmitindo...' : 'Executar Cancelamento'}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-indigo-50/30 border-b border-indigo-100/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-900 uppercase tracking-widest">
                  <Replace size={16} /> Substituição de Documento
                </CardTitle>
                <CardDescription className="text-xs font-medium text-indigo-700/60">
                  Substitua uma nota incorreta por uma nova emissão.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Nota Original *</Label>
                    <Input 
                      type="number" 
                      className="h-12 bg-gray-50 border-none"
                      value={numeroNotaSub} 
                      onChange={e => setNumeroNotaSub(e.target.value)}
                      placeholder="Ex: 370" 
                    />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Cód. Verificação *</Label>
                    <Input 
                      className="h-12 bg-gray-50 border-none font-mono uppercase"
                      value={codigoVerificacaoSub} 
                      onChange={e => setCodigoVerificacaoSub(e.target.value)}
                      placeholder="AbC1-2dE3" 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Nova DPS (Payload JSON) *</Label>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold text-gray-500">
                      Template carregado automaticamente para: <span className="uppercase">{nfseVersion}</span>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-bold"
                      onClick={() => setNovaDps(templateAtual)}
                    >
                      Resetar template
                    </Button>
                  </div>
                  <textarea 
                    className="w-full h-32 p-4 bg-gray-900 text-emerald-400 font-mono text-[10px] rounded-xl outline-none focus:ring-2 ring-indigo-500"
                    value={novaDps} 
                    onChange={e => setNovaDps(e.target.value)}
                    placeholder='{ "rps": { "numero": 2, "serie": "A1" }, ... }' 
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-indigo-50/30 border-t border-indigo-100/50 p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                  <Checkbox 
                    id="confirmarSub" 
                    checked={confirmarSub} 
                    onCheckedChange={setConfirmarSub}
                    className="mt-0.5 border-indigo-200 data-[state=checked]:bg-indigo-600"
                  />
                  <Label htmlFor="confirmarSub" className="text-xs font-semibold leading-relaxed text-indigo-900 cursor-pointer">
                    Confirmo a substituição da nota <span className="font-black">#{numeroNotaSub || '—'}</span> pelo novo conteúdo declarado acima.
                  </Label>
                </div>
                <Button 
                  onClick={handleSubstituir}
                  disabled={loading || !confirmarSub || !numeroNotaSub || !codigoVerificacaoSub || !novaDps}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest shadow-lg shadow-indigo-100 rounded-xl"
                >
                  {loading ? 'Processando...' : 'Executar Substituição'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {resultado && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <Card className={`border-none shadow-xl ${resultado.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900 border-red-100'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    {resultado.ok ? <CheckCircle size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-red-500" />}
                    {resultado.ok ? 'Transmissão Concluída' : 'Falha na Operação'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm font-semibold">
                    {resultado.ok ? (tab === 'cancelar' ? 'O cancelamento foi transmitido e processado com sucesso.' : 'A substituição foi realizada com sucesso.') : resultado.erro}
                  </p>
                  {resultado.ok && (
                    <div className="bg-white/50 rounded-xl p-4 overflow-hidden border border-emerald-100">
                      <pre className="text-[10px] font-mono text-emerald-700 overflow-auto max-h-[200px]">
                        {JSON.stringify(resultado.dados, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-gray-900 to-indigo-900 text-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                <ShieldCheck size={14} /> Regras de Reversão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                <div>
                  <p className="text-xs font-bold">Prazo Legal</p>
                  <p className="text-[10px] opacity-70 mt-0.5">O cancelamento deve ser feito em até 30 dias após a emissão.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
                <div>
                  <p className="text-xs font-bold">Status Fiscal</p>
                  <p className="text-[10px] opacity-70 mt-0.5">A nota não pode ter sido paga através de guia de recolhimento.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold">3</div>
                <div>
                  <p className="text-xs font-bold">Substituição</p>
                  <p className="text-[10px] opacity-70 mt-0.5">Útil para correções de valores ou tomador sem perder a competência.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Info size={14} /> Ajuda Rápida
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Não encontra o código de verificação? Ele está impresso no rodapé da guia da prefeitura ou pode ser obtido na aba <span className="text-indigo-600">Consultar</span>.
            </p>
            <Button variant="link" className="text-indigo-600 p-0 h-auto text-xs font-bold">
              Ver manual completo <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
      <div className="h-12 md:hidden" />
    </div>
  );
}
