'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { nfseApi } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import {
  FileText,
  Users,
  MapPin,
  Wrench,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  ChevronDown,
  Save,
  Rocket,
  FolderOpen,
  Calculator,
  ArrowRight,
  Info,
  Building2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import SearchableSelect from '@/components/SearchableSelect';

const ITENS_LISTA = [
  { value: '01.01', label: '01.01 – Análise e desenvolvimento de sistemas' },
  { value: '01.02', label: '01.02 – Programação' },
  { value: '01.03', label: '01.03 – Processamento de dados' },
  { value: '01.04', label: '01.04 – Elaboração de programas de computadores' },
  { value: '01.05', label: '01.05 – Licenciamento de programas (softwares)' },
  { value: '17.01', label: '17.01 – Assessoria ou consultoria' },
  { value: '17.06', label: '17.06 – Treinamento e ensino' },
  { value: '17.09', label: '17.09 – Planejamento, organização e administração' },
  { value: '17.10', label: '17.10 – Administração em geral' },
  { value: '17.11', label: '17.11 – Contabilidade, inclusive serviços similares' },
  { value: '17.14', label: '17.14 – Coleta e processamento de dados' },
  { value: '17.19', label: '17.19 – Outros serviços similares' },
];

const MOTIVOS_EXIGIBILIDADE = [
  { value: '1', label: '1 – Exigível' },
  { value: '2', label: '2 – Não Incidência' },
  { value: '3', label: '3 – Isenção' },
  { value: '4', label: '4 – Exportação' },
  { value: '5', label: '5 – Imunidade' },
  { value: '6', label: '6 – Suspenso por Decisão Judicial' },
];

const REGIMES_ESPECIAIS = [
  { value: '1', label: '1 - Microempresa municipal' },
  { value: '2', label: '2 - Estimativa' },
  { value: '3', label: '3 - Sociedade de profissionais' },
  { value: '4', label: '4 - Cooperativa' },
  { value: '5', label: '5 - MEI' },
  { value: '6', label: '6 - ME/EPP' },
];

function EmitirForm() {
  const { settings, currentVersion } = useSettings();
  const nfseVersion = settings?.nfseVersion === 'v2' ? 'v2' : 'v1';
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [rascunhos, setRascunhos] = useState([]);
  const [mostrarRascunhos, setMostrarRascunhos] = useState(false);
  const [salvandoRascunho, setSalvandoRascunho] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const searchParams = useSearchParams();

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      numeroRps: 1,
      serieRps: 'A1',
      tipoRps: '1',
      dataEmissao: new Date().toISOString(),
      itemListaServico: '01.01',
      aliquota: 2,
      issRetido: 'false',
      optanteSimplesNacional: 'false',
      exigibilidadeIss: '1',
      numeroDps: 1,
      serieDps: '00001',
      cTribNac: '010100',
      cNBS: '',
      regimeApuracao: '1',
      regimeEspecialTributacao: '',
      intermediarioDocumento: '',
      intermediarioRazaoSocial: '',
      intermediarioCodigoMunicipio: '',
      construcaoCodigoObra: '',
      construcaoArt: '',
      deducaoTipo: '',
      deducaoDescricao: '',
      deducaoValor: '',
      eventoDescricao: '',
      cLocPrestacao: '',
      codigoMunicipioIncidencia: '',
      cPaisResultado: '',
      regEspTribV2: '',
      indTotTrib: '0',
      ibsCBSRetido: 'false',
      vTotTrib: '',
      vTotCredDescCond: '',
      xInfComp: '',
      xInfAdFisco: '',
    }
  });

  useEffect(() => {
    fetchClientes();
    fetchRascunhos();

    const duplicar = searchParams.get('duplicar');
    if (duplicar === 'true') {
      try {
        const dados = sessionStorage.getItem('duplicarNota');
        if (dados) {
          const nota = JSON.parse(dados);
          const allowedKeys = ['valorServicos', 'discriminacao', 'itemListaServico', 'cnpjCpfTomador', 'razaoSocialTomador'];
          Object.keys(nota).forEach(key => {
            if (allowedKeys.includes(key)) {
              setValue(key, typeof nota[key] === 'string' ? nota[key].replace(/[<>&"'\/]/g, '') : nota[key]);
            }
          });
          sessionStorage.removeItem('duplicarNota');
        }
      } catch (err) {
        console.error('Erro ao carregar dados duplicados:', err);
      }
    }
  }, [searchParams]);

  const fetchClientes = async () => {
    try {
      const resp = await nfseApi.clientes.listar();
      setClientes(resp.data);

      const clienteId = searchParams.get('clienteId');
      if (clienteId) {
        const c = resp.data.find(x => x.id === clienteId);
        if (c) preencherCliente(c);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  const fetchRascunhos = async () => {
    try {
      const resp = await nfseApi.rascunhos.listar();
      setRascunhos(resp.data);
    } catch (err) {
      console.error('Erro ao buscar rascunhos:', err);
    }
  };

  const preencherCliente = (c) => {
    setValue('cnpjCpfTomador', c.documento);
    setValue('razaoSocialTomador', c.razaoSocial);
    setValue('emailTomador', c.email || '');
    setValue('telefoneTomador', c.telefone || '');
    if (c.endereco) {
      setValue('logradouroTomador', c.endereco.logradouro);
      setValue('numeroTomador', c.endereco.numero);
      setValue('complementoTomador', c.endereco.complemento || '');
      setValue('bairroTomador', c.endereco.bairro);
      setValue('cepTomador', c.endereco.cep);
      setValue('ufTomador', c.endereco.uf || 'GO');
    }
  };

  const valorServicos = watch('valorServicos') || 0;
  const aliquota = watch('aliquota') || 0;
  const issRetido = watch('issRetido');
  const tipoRps = watch('tipoRps');
  const itemListaServico = watch('itemListaServico');
  const exigibilidadeIss = watch('exigibilidadeIss');
  const optanteSimplesNacional = watch('optanteSimplesNacional');
  const numeroDocEmissao = watch(nfseVersion === 'v2' ? 'numeroDps' : 'numeroRps');
  const serieDocEmissao = watch(nfseVersion === 'v2' ? 'serieDps' : 'serieRps');

  const vDescIncond = watch('vDescIncond') || 0;
  const vDescCond = watch('vDescCond') || 0;
  const vRetIRRF = watch('vRetIRRF') || 0;
  const vRetCSLL = watch('vRetCSLL') || 0;
  const possuiRetencoesFederais = Number(vRetIRRF) > 0 || Number(vRetCSLL) > 0;
  const issRetidoBool = String(issRetido) === 'true';
  const mostrarCamposAvancadosTribV2 = nfseVersion === 'v2' && (possuiRetencoesFederais || issRetidoBool);

  useEffect(() => {
    if (nfseVersion !== 'v2') return;
    if (mostrarCamposAvancadosTribV2) return;
    setValue('ibsCBSRetido', 'false');
    setValue('vTotTrib', '');
    setValue('vTotCredDescCond', '');
  }, [nfseVersion, mostrarCamposAvancadosTribV2, setValue]);

  const valorIss = valorServicos && aliquota
    ? ((Number(valorServicos) * Number(aliquota)) / 100).toFixed(2)
    : '0.00';

  const baseCalc = Number(valorServicos) - Number(vDescIncond) - Number(vDescCond);
  const valorLiquido = (baseCalc - (String(issRetido) === 'true' ? Number(valorIss) : 0) - Number(vRetIRRF) - Number(vRetCSLL)).toFixed(2);

  const validarFormulario = (data) => {
    if (!data.valorServicos || Number(data.valorServicos) <= 0) {
      return 'Informe um valor de serviço maior que zero.';
    }
    if (!data.discriminacao || !data.discriminacao.trim()) {
      return 'Informe a descrição dos serviços.';
    }
    if (nfseVersion === 'v1') {
      if (!data.numeroRps || Number(data.numeroRps) <= 0) return 'Número do RPS inválido para v1.';
      if (!data.tipoRps) return 'Tipo de documento (RPS) é obrigatório para v1.';
    } else {
      if (!data.numeroDps || Number(data.numeroDps) <= 0) return 'Número do DPS inválido para v2.';
      if (!data.serieDps || !String(data.serieDps).trim()) return 'Série do DPS é obrigatória para v2.';
      if (!data.cTribNac || !String(data.cTribNac).trim()) return 'cTribNac é obrigatório para v2.';
      if (data.vTotTrib && Number(data.vTotTrib) < 0) return 'vTotTrib não pode ser negativo.';
      if (data.vTotCredDescCond && Number(data.vTotCredDescCond) < 0) return 'vTotCredDescCond não pode ser negativo.';
    }
    if (data.deducaoValor && Number(data.deducaoValor) < 0) {
      return 'Valor de dedução não pode ser negativo.';
    }
    return null;
  };

  const buildPayload = (data) => {
    const dataEmissaoISO = new Date(data.dataEmissao).toISOString();
    const documentoTomador = (data.cnpjCpfTomador || '').replace(/\D/g, '');
    const tomadorV1 = documentoTomador ? {
      documento: documentoTomador,
      razaoSocial: data.razaoSocialTomador,
      contato: {
        email: data.emailTomador || undefined,
        telefone: data.telefoneTomador || undefined,
      },
      endereco: data.logradouroTomador ? {
        logradouro: data.logradouroTomador,
        numero: data.numeroTomador,
        complemento: data.complementoTomador || '',
        bairro: data.bairroTomador,
        uf: data.ufTomador || 'GO',
        cep: data.cepTomador,
      } : undefined,
    } : undefined;

    const tomadorV2 = documentoTomador ? {
      ...(documentoTomador.length === 14 ? { cnpj: documentoTomador } : { cpf: documentoTomador }),
      razaoSocial: data.razaoSocialTomador,
      ...(data.logradouroTomador ? {
        endereco: {
          logradouro: data.logradouroTomador,
          numero: data.numeroTomador,
          complemento: data.complementoTomador || '',
          bairro: data.bairroTomador,
          codigoMunicipio: '5208707',
          municipio: 'Goiania',
          uf: data.ufTomador || 'GO',
          cep: data.cepTomador,
        },
      } : {}),
      ...(data.telefoneTomador ? { fone: data.telefoneTomador } : {}),
      ...(data.emailTomador ? { email: data.emailTomador } : {}),
    } : undefined;

    if (nfseVersion === 'v1') {
      const intermediario = data.intermediarioDocumento ? {
        documento: String(data.intermediarioDocumento).replace(/\D/g, ''),
        razaoSocial: data.intermediarioRazaoSocial || undefined,
        codigoMunicipio: data.intermediarioCodigoMunicipio || undefined,
      } : undefined;

      const construcaoCivil = (data.construcaoCodigoObra || data.construcaoArt) ? {
        codigoObra: data.construcaoCodigoObra || undefined,
        art: data.construcaoArt || undefined,
      } : undefined;

      const deducao = data.deducaoTipo ? {
        tipoDeducao: Number(data.deducaoTipo),
        descricaoDeducao: data.deducaoDescricao || undefined,
        valorDedutivel: data.deducaoValor ? Number(data.deducaoValor) : undefined,
      } : undefined;

      const evento = data.eventoDescricao
        ? { descricaoEvento: data.eventoDescricao }
        : undefined;

      return {
        rps: {
          numero: Number(data.numeroRps),
          serie: data.serieRps,
          tipo: Number(data.tipoRps),
          dataEmissao: dataEmissaoISO,
          status: 1,
        },
        servico: {
          valorServicos: Number(data.valorServicos),
          aliquota: Number(data.aliquota),
          issRetido: String(data.issRetido) === 'true',
          valorIss: Number(valorIss),
          valorLiquido: Number(valorLiquido),
          itemListaServico: data.itemListaServico,
          codigoTributacao: data.codigoTributacao || '',
          discriminacao: data.discriminacao,
          exigibilidadeIss: Number(data.exigibilidadeIss),
          vDescIncond: Number(data.vDescIncond) || 0,
          vDescCond: Number(data.vDescCond) || 0,
        },
        tomador: tomadorV1,
        intermediario,
        construcaoCivil,
        deducao,
        evento,
        regimeEspecialTributacao: data.regimeEspecialTributacao
          ? Number(data.regimeEspecialTributacao)
          : undefined,
        optanteSimplesNacional: String(data.optanteSimplesNacional) === 'true',
        incentivoFiscal: false,
        tribFed: (Number(data.vRetIRRF) > 0 || Number(data.vRetCSLL) > 0) ? {
          vRetIRRF: Number(data.vRetIRRF) || 0,
          vRetCSLL: Number(data.vRetCSLL) || 0,
        } : undefined,
      };
    }

    return {
      numeroDps: Number(data.numeroDps || data.numeroRps),
      serieDps: data.serieDps || '00001',
      dCompet: dataEmissaoISO.slice(0, 10),
      itemListaServico: data.itemListaServico,
      cLocPrestacao: data.cLocPrestacao || undefined,
      rps: {
        numero: Number(data.numeroDps || data.numeroRps),
        serie: data.serieDps || '00001',
      },
      servico: {
        valorServicos: Number(data.valorServicos),
        aliquota: Number(data.aliquota),
        issRetido: String(data.issRetido) === 'true',
        cTribNac: data.cTribNac || data.itemListaServico.replace('.', ''),
        cNBS: data.cNBS || undefined,
        discriminacao: data.discriminacao,
        cLocPrestacao: data.cLocPrestacao || undefined,
        cMunIncid: data.codigoMunicipioIncidencia || undefined,
        vDescIncond: Number(data.vDescIncond) || 0,
        vDescCond: Number(data.vDescCond) || 0,
      },
      tomador: tomadorV2,
      optanteSimplesNacional: String(data.optanteSimplesNacional) === 'true',
      regimeApuracao: Number(data.regimeApuracao || 1),
      regEspTrib: data.regEspTribV2 ? Number(data.regEspTribV2) : undefined,
      cPaisResult: data.cPaisResultado || undefined,
      infAdPrest: data.xInfComp || undefined,
      infAdFisco: data.xInfAdFisco || undefined,
      indTotTrib: Number(data.indTotTrib || 0),
      ibsCBS: String(data.ibsCBSRetido) === 'true',
      vTotTrib: data.vTotTrib ? Number(data.vTotTrib) : undefined,
      vTotCredDescCond: data.vTotCredDescCond ? Number(data.vTotCredDescCond) : undefined,
      tribFed: (Number(data.vRetIRRF) > 0 || Number(data.vRetCSLL) > 0) ? {
        vRetIRRF: Number(data.vRetIRRF) || 0,
        vRetCSLL: Number(data.vRetCSLL) || 0,
      } : undefined,
    };
  };

  const onSubmit = async (data) => {
    const erroValidacao = validarFormulario(data);
    if (erroValidacao) {
      setResultado({ ok: false, erro: erroValidacao });
      return;
    }

    setLoading(true);
    setResultado(null);

    const payload = buildPayload(data);

    try {
      const resp = await nfseApi.emitir(payload, nfseVersion);
      setResultado({ ok: true, dados: resp.data });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err.response?.data?.erro || err.message || 'Erro desconhecido';
      const detalhes = err.response?.data?.detalhes || null;
      setResultado({ ok: false, erro: msg, detalhes, code: err.response?.data?.code, plano: err.response?.data });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const salvarRascunho = async () => {
    setSalvandoRascunho(true);
    try {
      const data = getValues();
      const payload = {
        nome: `Rascunho - ${new Date().toLocaleString('pt-BR')}`,
        nfseVersion,
        dados: buildPayload(data),
      };

      await nfseApi.rascunhos.criar(payload);
      await fetchRascunhos();
      alert('Rascunho salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar rascunho:', err);
    } finally {
      setSalvandoRascunho(false);
    }
  };

  const carregarRascunho = (rascunho) => {
    const dados = rascunho.formData || rascunho.dados;
    if (!dados) return;

    const dadosEfetivos = dados.rps || dados.servico ? dados : dados;

    if (dadosEfetivos.numeroDps) {
      setValue('numeroDps', dadosEfetivos.numeroDps);
    }
    if (dadosEfetivos.serieDps) {
      setValue('serieDps', dadosEfetivos.serieDps);
    }
    if (dadosEfetivos.servico?.cTribNac) {
      setValue('cTribNac', dadosEfetivos.servico.cTribNac);
    }
    if (dadosEfetivos.servico?.cNBS) {
      setValue('cNBS', dadosEfetivos.servico.cNBS);
    }
    if (dadosEfetivos.cLocPrestacao || dadosEfetivos.servico?.cLocPrestacao) {
      setValue('cLocPrestacao', dadosEfetivos.cLocPrestacao || dadosEfetivos.servico?.cLocPrestacao);
    }
    if (dadosEfetivos.servico?.cMunIncid) {
      setValue('codigoMunicipioIncidencia', dadosEfetivos.servico.cMunIncid);
    }
    if (dadosEfetivos.regimeApuracao) {
      setValue('regimeApuracao', String(dadosEfetivos.regimeApuracao));
    }
    if (dadosEfetivos.regEspTrib) setValue('regEspTribV2', String(dadosEfetivos.regEspTrib));
    if (dadosEfetivos.cPaisResult) setValue('cPaisResultado', dadosEfetivos.cPaisResult);
    if (dadosEfetivos.indTotTrib !== undefined) setValue('indTotTrib', String(dadosEfetivos.indTotTrib));
    if (dadosEfetivos.ibsCBS !== undefined) setValue('ibsCBSRetido', dadosEfetivos.ibsCBS ? 'true' : 'false');
    if (dadosEfetivos.vTotTrib !== undefined) setValue('vTotTrib', String(dadosEfetivos.vTotTrib));
    if (dadosEfetivos.vTotCredDescCond !== undefined) setValue('vTotCredDescCond', String(dadosEfetivos.vTotCredDescCond));
    if (dadosEfetivos.infAdPrest) setValue('xInfComp', dadosEfetivos.infAdPrest);
    if (dadosEfetivos.infAdFisco) setValue('xInfAdFisco', dadosEfetivos.infAdFisco);

    if (dadosEfetivos.rps) {
      setValue('numeroRps', dadosEfetivos.rps.numero || 1);
      setValue('serieRps', dadosEfetivos.rps.serie || 'A1');
      setValue('tipoRps', String(dadosEfetivos.rps.tipo || 1));
      setValue('dataEmissao', dadosEfetivos.rps.dataEmissao ? new Date(dadosEfetivos.rps.dataEmissao).toISOString() : new Date().toISOString());
    }
    if (dadosEfetivos.servico) {
      setValue('valorServicos', dadosEfetivos.servico.valorServicos || '');
      setValue('aliquota', dadosEfetivos.servico.aliquota || 2);
      setValue('issRetido', dadosEfetivos.servico.issRetido ? 'true' : 'false');
      setValue('itemListaServico', dadosEfetivos.servico.itemListaServico || '01.01');
      setValue('codigoTributacao', dadosEfetivos.servico.codigoTributacao || '');
      setValue('discriminacao', dadosEfetivos.servico.discriminacao || '');
      setValue('exigibilidadeIss', String(dadosEfetivos.servico.exigibilidadeIss || 1));
    }
    if (dadosEfetivos.tomador) {
      setValue('cnpjCpfTomador', dadosEfetivos.tomador.documento || dadosEfetivos.tomador.cnpj || dadosEfetivos.tomador.cpf || '');
      setValue('razaoSocialTomador', dadosEfetivos.tomador.razaoSocial || '');
      setValue('emailTomador', dadosEfetivos.tomador.contato?.email || dadosEfetivos.tomador.email || '');
      setValue('telefoneTomador', dadosEfetivos.tomador.contato?.telefone || dadosEfetivos.tomador.fone || '');
      if (dadosEfetivos.tomador.endereco) {
        setValue('logradouroTomador', dadosEfetivos.tomador.endereco.logradouro || '');
        setValue('numeroTomador', dadosEfetivos.tomador.endereco.numero || '');
        setValue('complementoTomador', dadosEfetivos.tomador.endereco.complemento || '');
        setValue('bairroTomador', dadosEfetivos.tomador.endereco.bairro || '');
        setValue('cepTomador', dadosEfetivos.tomador.endereco.cep || '');
        setValue('ufTomador', dadosEfetivos.tomador.endereco.uf || 'GO');
      }
    }
    setValue('optanteSimplesNacional', dadosEfetivos.optanteSimplesNacional ? 'true' : 'false');
    setMostrarRascunhos(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
      <div className="w-full lg:flex-1 flex flex-col gap-6 min-w-0">

        {resultado && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={`alert ${resultado.ok ? 'alert-success' : 'alert-error'}`} style={{ flexDirection: 'column', gap: 16, padding: '24px' }}>
              <div style={{ fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {resultado.ok ? <CheckCircle size={22} /> : <XCircle size={22} />}
                {resultado.ok ? 'NFS-e Emitida com Sucesso!' : 'Falha na Emissão'}
              </div>

              {resultado.ok ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="bg-white/20 p-3 rounded-lg flex-1 min-w-[200px]">
                      <span className="text-xs uppercase opacity-70">Número da Nota</span>
                      <div className="text-lg font-bold">#{resultado.dados?.numeroNota || '370'}</div>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg flex-1 min-w-[200px]">
                      <span className="text-xs uppercase opacity-70">Código de Verificação</span>
                      <div className="text-lg font-bold">{resultado.dados?.codigoVerificacao || '—'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    {resultado.dados?.urlImpressao && (() => {
                      const url = resultado.dados?.urlImpressao;
                      const isValid = typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'));
                      return isValid ? (
                        <Button variant="outline" className="bg-white text-indigo-600 border-none hover:bg-gray-100 h-10" onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
                          <Printer size={16} className="mr-2" /> Imprimir / Ver PDF
                        </Button>
                      ) : null;
                    })()}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '14px', width: '100%' }}>
                  {resultado.code === 'PLAN_LIMIT_EXCEEDED' ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <p className="font-bold text-gray-800 text-sm mb-2">⚠️ Limite de notas do plano atingido</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Seu plano <strong>{resultado.plano?.plano || 'atual'}</strong> permite{' '}
                          <strong>{resultado.plano?.limite || 0}</strong> notas por mês.
                          Você já utilizou todas as <strong>{resultado.plano?.utilizadas || 0}</strong> notas deste mês.
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-bold text-indigo-600">Para continuar emitindo, solicite upgrade do seu plano.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p><strong>Motivo:</strong> {resultado.erro}</p>
                      {resultado.detalhes && (
                        <div className="result-box mt-3" style={{ background: 'rgba(0,0,0,0.1)', color: 'white' }}>
                          <pre style={{ fontSize: '11px' }}>{JSON.stringify(resultado.detalhes, null, 2)}</pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!resultado?.ok && (
          <div className="card" style={{ border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.03)' }}>
            <div className="form-section-title" style={{ marginTop: 0, color: 'var(--accent-primary)' }}>
              <FolderOpen size={16} /> Importar Dados
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="form-group flex-1">
                <Label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Preencher com Cliente Cadastrado</Label>
                <SearchableSelect
                  items={clientes}
                  value={selectedClientId}
                  placeholder="Pesquise e selecione um cliente..."
                  labelKey="razaoSocial"
                  secondaryKey="documento"
                  onSelect={(val) => {
                    setSelectedClientId(val);
                    const c = clientes.find(x => x.id === val);
                    if (c) preencherCliente(c);
                  }}
                />
              </div>
              <div className="form-group flex items-end">
                <Button type="button" variant="outline" className="h-11 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold" onClick={() => setMostrarRascunhos(!mostrarRascunhos)}>
                  <Save size={16} className="mr-2" /> Rascunhos ({rascunhos.length})
                </Button>
              </div>
            </div>
          </div>
        )}

        {!resultado?.ok && (
          <form id="emitir-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/30">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <FileText size={16} /> Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">
                    Número da Nota *
                  </Label>
                  <Input type="number" min="1" className="h-12"
                    {...register(nfseVersion === 'v2' ? 'numeroDps' : 'numeroRps', { required: 'Obrigatório' })} />
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">
                    {nfseVersion === 'v2' ? 'Série do DPS' : 'Série'}
                  </Label>
                  <Input maxLength={5} className="h-12" {...register(nfseVersion === 'v2' ? 'serieDps' : 'serieRps')} />
                </div>
                {nfseVersion === 'v1' && (
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Tipo de Documento</Label>
                    <Select value={String(tipoRps)} onValueChange={(val) => setValue('tipoRps', val)}>
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 – RPS Comum</SelectItem>
                        <SelectItem value="2">2 – Nota Conjugada</SelectItem>
                        <SelectItem value="3">3 – Cupom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Data de Emissão *</Label>
                  <DatePicker
                    date={watch('dataEmissao') ? new Date(watch('dataEmissao')) : null}
                    setDate={(date) => setValue('dataEmissao', date ? date.toISOString() : '')}
                  />
                  {errors.dataEmissao && <span className="form-error">{errors.dataEmissao.message}</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/30">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <Wrench size={16} /> Detalhes do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="form-group md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Item da Lista de Serviço *</Label>
                  <Select value={String(itemListaServico)} onValueChange={(val) => setValue('itemListaServico', val)}>
                    <SelectTrigger className="h-12 bg-white">
                      <SelectValue placeholder="Selecione o item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ITENS_LISTA.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">
                    {nfseVersion === 'v2' ? 'Código Trib. Nacional (cTribNac)' : 'Código de Tributação'}
                  </Label>
                  <Input placeholder="Ex: 010100" className="h-12" {...register(nfseVersion === 'v2' ? 'cTribNac' : 'codigoTributacao')} />
                </div>
              </div>

              {nfseVersion === 'v2' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Código NBS</Label>
                    <Input placeholder="Opcional" className="h-12" {...register('cNBS')} />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Cód. Local Prestação</Label>
                    <Input placeholder="Ex: 5208707" className="h-12" {...register('cLocPrestacao')} />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Cód. Mun. Incidência</Label>
                    <Input placeholder="Ex: 5208707" className="h-12" {...register('codigoMunicipioIncidencia')} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Valor Bruto (R$) *</Label>
                  <Input type="number" step="0.01" min="0.01" className="h-12 text-lg font-bold" placeholder="0,00"
                    {...register('valorServicos', { required: true })} />
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Alíquota ISS (%)</Label>
                  <Input type="number" step="0.1" className="h-12" {...register('aliquota', { valueAsNumber: true })} />
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">ISS Retido?</Label>
                  <Select value={String(issRetido)} onValueChange={(val) => setValue('issRetido', val)}>
                    <SelectTrigger className="h-12 bg-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Não</SelectItem>
                      <SelectItem value="true">Sim (Retenção)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Desc. Incondicional</Label>
                  <Input type="number" step="0.01" className="h-12" placeholder="0,00"
                    {...register('vDescIncond', { valueAsNumber: true })} />
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Desc. Condicional</Label>
                  <Input type="number" step="0.01" className="h-12" placeholder="0,00"
                    {...register('vDescCond', { valueAsNumber: true })} />
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Total Deduções</Label>
                  <Input type="text" className="h-12 bg-gray-50 border-none font-bold" readOnly
                    value={`R$ ${(Number(vDescIncond) + Number(vDescCond)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                </div>
              </div>

              <div className="form-group">
                <Label className="text-[10px] font-bold uppercase text-gray-500">Exigibilidade do ISS</Label>
                <Select value={String(exigibilidadeIss)} onValueChange={(val) => setValue('exigibilidadeIss', val)}>
                  <SelectTrigger className="h-11 bg-white">
                    <SelectValue placeholder="Selecione a exigibilidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTIVOS_EXIGIBILIDADE.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <details className="group border border-gray-100 rounded-2xl p-4 bg-gray-50/20">
                <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-400 list-none">
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform text-indigo-600" />
                  Retenções Federais (Opcional)
                </summary>
                <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Retenção IRRF</Label>
                    <Input type="number" step="0.01" className="h-11 bg-white" placeholder="0,00"
                      {...register('vRetIRRF', { valueAsNumber: true })} />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Retenção CSLL</Label>
                    <Input type="number" step="0.01" className="h-11 bg-white" placeholder="0,00"
                      {...register('vRetCSLL', { valueAsNumber: true })} />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-indigo-400 font-black">Total Retenções</Label>
                    <Input type="text" className="h-11 bg-indigo-50 border-indigo-100 font-bold text-indigo-600" readOnly
                      value={`R$ ${(Number(vRetIRRF) + Number(vRetCSLL)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  </div>
                </div>
              </details>

              <div className="form-group">
                <Label className="text-[10px] font-bold uppercase text-gray-500">Descrição dos Serviços *</Label>
                <textarea className="form-textarea w-full rounded-xl border-gray-100 bg-gray-50 p-4 text-sm" rows={4}
                  placeholder="Descreva detalhadamente os serviços prestados..."
                  {...register('discriminacao', { required: true })} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/30">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <Users size={16} /> Dados do Tomador (Cliente)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">CPF ou CNPJ</Label>
                    <Input placeholder="000.000.000-00" className="h-12" {...register('cnpjCpfTomador')} 
                      onBlur={(e) => {
                        const doc = e.target.value.replace(/\D/g, '');
                        if (doc.length < 11) return;
                        const found = clientes.find(c => c.documento?.replace(/\D/g, '') === doc);
                        if (found) preencherCliente(found);
                      }} />
                  </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Razão Social / Nome</Label>
                  <Input placeholder="Nome do cliente" className="h-12" {...register('razaoSocialTomador')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">E-mail</Label>
                  <Input type="email" placeholder="email@exemplo.com" className="h-12" {...register('emailTomador')} />
                </div>
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Telefone</Label>
                  <Input placeholder="(62) 00000-0000" className="h-12" {...register('telefoneTomador')} />
                </div>
              </div>

              <details className="group border border-gray-100 rounded-2xl p-4 bg-gray-50/20">
                <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-400 list-none">
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform text-indigo-600" />
                  Informar Endereço do Tomador
                </summary>
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">Logradouro</Label>
                      <Input {...register('logradouroTomador')} className="h-11 bg-white" />
                    </div>
                    <div className="form-group">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">Número</Label>
                      <Input {...register('numeroTomador')} className="h-11 bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">Bairro</Label>
                      <Input {...register('bairroTomador')} className="h-11 bg-white" />
                    </div>
                    <div className="form-group">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">CEP</Label>
                      <Input {...register('cepTomador')} className="h-11 bg-white" />
                    </div>
                    <div className="form-group">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">UF</Label>
                      <Input maxLength={2} defaultValue="GO" {...register('ufTomador')} className="h-11 bg-white" />
                    </div>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/30">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <Building2 size={16} /> Configurações do Prestador
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="form-group">
                <Label className="text-[10px] font-bold uppercase text-gray-500">Optante pelo Simples Nacional?</Label>
                <Select value={String(optanteSimplesNacional)} onValueChange={(val) => setValue('optanteSimplesNacional', val)}>
                  <SelectTrigger className="h-11 bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Não</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {nfseVersion === 'v2' && (
                <div className="form-group mt-4">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Regime de Apuração (SN)</Label>
                  <Select value={String(watch('regimeApuracao') || '1')} onValueChange={(val) => setValue('regimeApuracao', val)}>
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Competência</SelectItem>
                      <SelectItem value="2">2 - Caixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {nfseVersion === 'v1' && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/30">
<CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <Info size={16} /> Campos Avançados
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Regime Especial de Tributação</Label>
                  <Select value={String(watch('regimeEspecialTributacao') || '')} onValueChange={(val) => setValue('regimeEspecialTributacao', val)}>
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIMES_ESPECIAIS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <details className="group border border-gray-100 rounded-2xl p-4 bg-gray-50/20">
                  <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-400 list-none">
                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform text-indigo-600" />
                    Intermediário
                  </summary>
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="Documento" className="h-11 bg-white" {...register('intermediarioDocumento')} />
                    <Input placeholder="Razão social" className="h-11 bg-white" {...register('intermediarioRazaoSocial')} />
                    <Input placeholder="Cód. município" className="h-11 bg-white" {...register('intermediarioCodigoMunicipio')} />
                  </div>
                </details>

                <details className="group border border-gray-100 rounded-2xl p-4 bg-gray-50/20">
                  <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-400 list-none">
                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform text-indigo-600" />
                    Construção Civil
                  </summary>
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Código da obra" className="h-11 bg-white" {...register('construcaoCodigoObra')} />
                    <Input placeholder="ART" className="h-11 bg-white" {...register('construcaoArt')} />
                  </div>
                </details>

                <details className="group border border-gray-100 rounded-2xl p-4 bg-gray-50/20">
                  <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-400 list-none">
                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform text-indigo-600" />
                    Dedução
                  </summary>
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="Tipo (1..99)" type="number" className="h-11 bg-white" {...register('deducaoTipo')} />
                    <Input placeholder="Descrição" className="h-11 bg-white" {...register('deducaoDescricao')} />
                    <Input placeholder="Valor dedutível" type="number" step="0.01" className="h-11 bg-white" {...register('deducaoValor')} />
                  </div>
                </details>

                <div className="form-group">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Evento (descrição)</Label>
                  <Input placeholder="Descrição do evento (opcional)" className="h-11 bg-white" {...register('eventoDescricao')} />
                </div>
              </CardContent>
            </Card>
          )}

          {nfseVersion === 'v2' && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/30">
<CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <Info size={16} /> Campos Avançados (v2)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-[11px] text-indigo-600 font-medium">
                  Estes campos são úteis quando há retenções, tributos informativos ou exigências fiscais específicas.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Regime Especial</Label>
                    <Input type="number" min="1" max="6" placeholder="1..6" className="h-11 bg-white" {...register('regEspTribV2')} />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Código País Resultado</Label>
                    <Input placeholder="Ex: 1058" className="h-11 bg-white" {...register('cPaisResultado')} />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Considera Total Trib.</Label>
                    <Select value={String(watch('indTotTrib') || '0')} onValueChange={(val) => setValue('indTotTrib', val)}>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - Não</SelectItem>
                        <SelectItem value="1">1 - Sim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {mostrarCamposAvancadosTribV2 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <Label className="text-[10px] font-bold uppercase text-gray-500">IBS/CBS Retido</Label>
                      <Select value={String(watch('ibsCBSRetido') || 'false')} onValueChange={(val) => setValue('ibsCBSRetido', val)}>
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">Não</SelectItem>
                          <SelectItem value="true">Sim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-group">
                      <Label className="text-[10px] font-bold uppercase text-gray-500">Valor Total Tributos</Label>
                      <Input type="number" step="0.01" className="h-11 bg-white" {...register('vTotTrib')} />
                    </div>
                    <div className="form-group">
                      <Label className="text-[10px] font-bold uppercase text-gray-500">Crédito Desc. Cond.</Label>
                      <Input type="number" step="0.01" className="h-11 bg-white" {...register('vTotCredDescCond')} />
                    </div>
                  </div>
                )}
                {!mostrarCamposAvancadosTribV2 && (
                  <div className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3">
                    Preencha retenções federais ou marque ISS retido para habilitar campos de tributação complementar.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Info. Complementar Prestador</Label>
                    <textarea className="form-textarea w-full rounded-xl border-gray-100 bg-gray-50 p-3 text-sm" rows={3} {...register('xInfComp')} />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Info. Adicional Fisco</Label>
                    <textarea className="form-textarea w-full rounded-xl border-gray-100 bg-gray-50 p-3 text-sm" rows={3} {...register('xInfAdFisco')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </form>
        )}
      </div>

      <div className="emitir-sidebar-summary w-full lg:w-80 shrink-0 flex flex-col gap-6 lg:sticky lg:top-6">
        {!resultado?.ok && (
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-gray-800 shadow-sm border border-indigo-100 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
              <Calculator size={16} /> Sumário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b border-indigo-100 pb-2">
              <span className="text-[10px] font-bold uppercase text-indigo-500">Nº Nota</span>
              <span className="font-bold text-sm text-indigo-600">#{numeroDocEmissao}</span>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-500">Valor Bruto</span>
                <span className="font-bold text-gray-800">R$ {Number(valorServicos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-indigo-400">(-) ISS ({aliquota}%) {String(issRetido) === 'true' && <span className="bg-amber-100 text-amber-700 px-1.5 rounded text-[10px] font-black">RETIDO</span>}</span>
                <span className={String(issRetido) === 'true' ? 'font-bold text-amber-700' : 'text-indigo-400'}>
                  {String(issRetido) === 'true' ? '-' : ''} R$ {Number(valorIss).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 mt-4 border border-indigo-100 shadow-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-black text-indigo-500">Valor Líquido</span>
                <div className="text-2xl font-black tracking-tighter text-indigo-600">
                  R$ {Number(valorLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {resultado?.ok ? (
          <button type="button" onClick={() => setResultado(null)} className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 bg-indigo-600 text-white hover:bg-indigo-600 inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            <span className="flex items-center gap-2">
              <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Emitir Outra
            </span>
          </button>
        ) : (
          <Button type="submit" form="emitir-form" className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95" disabled={loading}>
            {loading ? 'Processando envio...' : (
              <span className="flex items-center gap-2">
                <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Emitir Nota Fiscal
              </span>
            )}
          </Button>
        )}

        {!resultado?.ok && (
          <Button type="button" variant="outline" onClick={salvarRascunho} className="w-full h-14 px-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-2 font-bold" disabled={salvandoRascunho}>
            <Save size={20} />
            <span className="text-sm md:text-base">Salvar como Rascunho</span>
          </Button>
        )}

        {mostrarRascunhos && (
          <Card className="animate-in slide-in-from-right-4 duration-300 border-none shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-indigo-50/50 border-b border-gray-100 py-4 flex items-center">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-indigo-800">
                <FolderOpen size={16} /> Rascunhos Salvos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {rascunhos.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">Nenhum rascunho.</div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {rascunhos.map(r => (
                    <div key={r.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex flex-col gap-2 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="text-[13px] font-bold text-gray-900 leading-tight">{r.nome}</div>
                        <button onClick={() => nfseApi.rascunhos.deletar(r.id).then(fetchRascunhos)} className="text-gray-300 hover:text-red-500 p-1">
                          <XCircle size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{new Date(r.createdAt).toLocaleDateString()}</span>
                        <Button variant="link" className="h-auto p-0 text-indigo-600 text-[10px] font-black uppercase" onClick={() => carregarRascunho(r)}>
                          CARREGAR <ArrowRight size={12} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

{settings.ambiente !== 'producao' && (
          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 space-y-3">
            <div className="flex gap-2 text-amber-800 font-black uppercase tracking-widest items-center text-[10px]">
              <AlertTriangle size={16} /> {settings.ambiente === 'homologacao' ? 'Ambiente de Homologação' : 'Modo de Teste'}
            </div>
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              {settings.ambiente === 'homologacao' 
                ? 'Você está em ambiente de homologação. As notas fiscais emitidas são fictícias e não possuem valor jurídico.' 
                : 'As notas emitidas não possuem valor jurídico. O sistema retorna a nota fictícia **#370**.'}
            </p>
            <p className="text-[11px] text-amber-800 font-semibold">
              Versão ativa: {currentVersion.full}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmitirPage() {
  const { currentVersion } = useSettings();
  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Emitir Nova NFS-e</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">{currentVersion.full}</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="py-20 text-center"><div className="animate-spin h-10 w-10 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full mx-auto" /></div>}>
        <EmitirForm />
      </Suspense>

      {/* Bottom spacer for mobile nav */}
      <div className="h-10 md:hidden" />
    </div>
  );
}
