'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { nfseApi } from '@/lib/api';
import { 
  LayoutDashboard, 
  Activity, 
  Globe, 
  Lock,
  DollarSign,
  TrendingUp,
  FileText,
  XSquare,
  ChevronRight,
  ShieldCheck,
  Building2,
  Eye,
  AlertTriangle,
  ShieldAlert,
  CalendarClock,
  PenSquare,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TenantEditModal from '@/components/TenantEditModal';

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [hideValues, setHideValues] = useState(true);
  const [certExpiration, setCertExpiration] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [showTenantEdit, setShowTenantEdit] = useState(false);
  const [planStatus, setPlanStatus] = useState(null);

  useEffect(() => {
    nfseApi.health()
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ status: 'offline' }));

    nfseApi.invoices.estatisticas()
      .then(r => setStats(r.data))
      .catch(() => setStats(null));

    nfseApi.invoices.listar({ page: 1, limit: 10 })
      .then(r => setInvoices(r.data?.invoices || []))
      .catch(() => setInvoices([]));

    nfseApi.config.getCertExpiration()
      .then(r => setCertExpiration(r.data))
      .catch(() => {});

    nfseApi.config.getTenantInfo()
      .then(r => setTenantInfo(r.data))
      .catch(() => {});

    nfseApi.invoices.planStatus()
      .then(r => setPlanStatus(r.data))
      .catch(() => {});
  }, []);

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    if (valor == null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  const emitidas = stats?.emitidas || 0;
  const canceladas = stats?.canceladas || 0;
  const faturamento = stats?.valorTotal || 0;
  const total = stats?.total || 0;
  const criticalDays = Math.min(7, certExpiration?.alertDays || 30);

  return (
    <div className="page-container space-y-6 md:space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Gestão de NFS-e {tenantInfo?.cidade ? `· ${tenantInfo.cidade}` : ''}</p>
        </div>
      </div>

      {/* Dados da Empresa */}
      <div className="p-4 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dados da Empresa</h2>
          </div>
          {tenantInfo && (
            <button onClick={() => setShowTenantEdit(true)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
              <PenSquare size={16} className="text-gray-400 hover:text-indigo-600" />
            </button>
          )}
        </div>

        {tenantInfo === null ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-48 bg-gray-100 rounded"></div>
            <div className="h-4 w-32 bg-gray-100 rounded"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-300">Razão Social</span>
              <span className="text-sm font-bold text-gray-900">{tenantInfo?.razaoSocial || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-300">CNPJ</span>
              <span className="text-sm font-bold text-gray-900">{tenantInfo?.cnpj || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-300">Inscrição Municipal</span>
              <span className="text-sm font-bold text-gray-900">{tenantInfo?.inscricaoMunicipal || status?.prestador?.inscricaoMunicipal || 'Pendente'}</span>
            </div>
          </div>
        )}
      </div>

      {showTenantEdit && (
        <TenantEditModal
          tenant={tenantInfo}
          onClose={() => setShowTenantEdit(false)}
          onSave={async (data) => {
            await nfseApi.config.updateTenant(data);
            const r = await nfseApi.config.getTenantInfo();
            setTenantInfo(r.data);
          }}
        />
      )}

      {/* Meu Plano */}
      {planStatus?.hasPlan && (
        <div className="p-4 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Meu Plano</h2>
            </div>
            <Link href="/meu-plano" className="text-[10px] font-black uppercase text-indigo-600 hover:underline flex items-center gap-1">
              Ver planos <ChevronRight size={12} />
            </Link>
          </div>

          {planStatus.limiteNotas > 0 ? (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">{planStatus.notasEmitidas} notas emitidas</span>
                <span className={`font-bold ${planStatus.excedido ? 'text-red-600' : planStatus.proximoLimite ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {planStatus.percentual}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    planStatus.excedido ? 'bg-red-500' : planStatus.proximoLimite ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(planStatus.percentual, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {planStatus.excedido
                  ? `⚠️ Limite de ${planStatus.limiteNotas} notas excedido.`
                  : `Limite: ${planStatus.limiteNotas} notas/mês${planStatus.proximoLimite ? ' · ⚠️ Próximo do limite!' : ''}`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Notas ilimitadas (Enterprise).</p>
          )}
        </div>
      )}

      {/* Certificado Digital (sempre visível) */}
      {certExpiration?.hasCertificate && (certExpiration.expired || certExpiration.expiringSoon) && (
        <div className={`p-4 md:p-5 rounded-2xl border flex items-center gap-4 ${certExpiration.expired
          ? 'bg-red-50 border-red-200'
          : certExpiration.daysLeft <= criticalDays
            ? 'bg-red-50 border-red-200'
            : certExpiration.expiringSoon
              ? 'bg-amber-50 border-amber-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${certExpiration.expired || certExpiration.daysLeft <= criticalDays
            ? 'bg-red-100 text-red-600'
            : certExpiration.expiringSoon
              ? 'bg-amber-100 text-amber-600'
              : 'bg-emerald-100 text-emerald-600'
            }`}>
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${certExpiration.expired || certExpiration.daysLeft <= criticalDays
              ? 'text-red-800'
              : certExpiration.expiringSoon
                ? 'text-amber-800'
                : 'text-emerald-800'
              }`}>
              {certExpiration.expired
                ? 'Certificado digital vencido'
                : certExpiration.expiringSoon
                  ? `Certificado digital expira em ${certExpiration.daysLeft} dias`
                  : 'Certificado digital OK'}
            </p>
            <p className={`text-xs font-medium mt-1 ${certExpiration.expired || certExpiration.daysLeft <= criticalDays
              ? 'text-red-600'
              : certExpiration.expiringSoon
                ? 'text-amber-600'
                : 'text-emerald-600'
              }`}>
              Validade até {certExpiration.expiresFormatted}
              {certExpiration.expired
                ? '. Renove o certificado para continuar emitindo notas.'
                : certExpiration.expiringSoon
                  ? `. Renove para evitar a paralização da emissão de notas.`
                  : `. Certificado dentro do prazo (alerta em ${certExpiration.alertDays} dias).`}
            </p>
          </div>
          <Link href="/configuracoes" className={`text-xs font-black uppercase shrink-0 mt-1 ${certExpiration.expired || certExpiration.daysLeft <= criticalDays
            ? 'text-red-600 hover:text-red-700'
            : certExpiration.expiringSoon
              ? 'text-amber-600 hover:text-amber-700'
              : 'text-emerald-600 hover:text-emerald-700'
            }`}>
            Gerenciar
          </Link>
        </div>
      )}

      {/* Real Metrics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Métricas de Desempenho</h2>
          <button
            onClick={() => setHideValues(!hideValues)}
            className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {hideValues ? 'Mostrar valores' : 'Ocultar valores'}
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[
            { label: 'Emitidas', val: String(emitidas), sub: hideValues ? '••••' : `${formatarMoeda(faturamento)} total`, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Canceladas', val: String(canceladas), sub: total > 0 ? `${((canceladas / total) * 100).toFixed(1)}% taxa` : '0% taxa', icon: XSquare, color: 'bg-red-50 text-red-600' },
            { label: 'Faturamento', val: hideValues ? '••••' : formatarMoeda(faturamento).replace('R$ ', 'R$'), sub: 'Total bruto', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Total de Notas', val: String(total), sub: `Rascunhos: ${stats?.rascunhos || 0}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          ].map((item, i) => (
            <Card key={i} className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 md:p-6 flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.label}</p>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight">{item.val}</h3>
                  <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{item.sub}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Real Notes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Últimas Notas</h2>
          <Link href="/notas" className="text-[10px] font-black text-indigo-600 flex items-center hover:underline uppercase tracking-tighter">
            Histórico Completo <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {invoices.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400 text-sm font-medium">
              Nenhuma nota emitida ainda.
            </div>
          ) : (
            invoices.map((inv, i) => (
              <div key={inv.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs">
                    #{inv.numeroNota ? String(inv.numeroNota).slice(-3) : `N${i + 1}`}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{inv.client?.nomeRazaoSocial || 'Tomador'}</h4>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">
                      {formatarData(inv.dataEmissao)} ·
                      <span className={`ml-1 ${inv.status === 'emitida' ? 'text-green-600' : inv.status === 'cancelada' ? 'text-red-600' : 'text-gray-400'}`}>
                        {inv.status === 'emitida' ? 'Emitida' : inv.status === 'cancelada' ? 'Cancelada' : inv.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Info Grid */}
      <div className="space-y-4 pb-12">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Informações do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Status do Serviço',
              val: status === null ? 'Verificando...' : status.status === 'offline' ? 'Offline' : 'Operacional',
              icon: Activity,
              color: status?.status === 'offline' ? 'text-amber-600 bg-amber-50' : status ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50',
            },
            { label: 'Ambiente', val: tenantInfo?.ambiente ? (tenantInfo.ambiente === 'homologacao' ? 'Homologação' : 'Produção') : status?.isMock ? 'Mock' : status?.homologacao ? 'Homologação' : 'Produção', icon: Globe, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Versão', val: tenantInfo?.nfseVersion ? `NFS-e ${tenantInfo.nfseVersion.toUpperCase()}` : 'NFS-e V1', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Subdomínio', val: tenantInfo?.subdomain || '-', icon: Building2, color: 'text-amber-600 bg-amber-50' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-black text-gray-300 uppercase tracking-widest leading-none">{item.label}</p>
                <h3 className="text-sm md:text-base font-bold text-gray-800 mt-1 truncate">{item.val}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}