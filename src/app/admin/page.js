'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nfseApi, getAuth } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Users, FileText, TrendingUp, DollarSign,
  Activity, AlertTriangle, BarChart3, Target
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.user || auth.user.role !== 'master') { router.replace('/admin/login'); return; }
    nfseApi.admin.dashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <AdminSidebar>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard Master</h1>

      {/* KPIs - Linha 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard icon={Users} label="Tenants Ativos" value={String(data?.totalTenants || 0)} sub={`${data?.statusCount?.inactive || 0} inativos`} color="text-indigo-400 bg-indigo-500/10" />
        <KpiCard icon={TrendingUp} label="Crescimento" value={`${data?.crescimento || 0}%`} sub="novos tenants mês" color="text-emerald-400 bg-emerald-500/10" />
        <KpiCard icon={Activity} label="Churn" value={`${data?.churn || 0}%`} sub="cancelamento mês" color={data?.churn > 5 ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'} />
        <KpiCard icon={Users} label="Usuários" value={String(data?.totalUsers || 0)} sub="usuários ativos" color="text-blue-400 bg-blue-500/10" />
      </div>

      {/* KPIs - Linha 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={FileText} label="Notas no Mês" value={String(data?.totalInvoicesMes || 0)} sub={`${data?.invoicesSemana || 0} nesta semana`} color="text-purple-400 bg-purple-500/10" />
        <KpiCard icon={BarChart3} label="Média/Tenant" value={String(data?.mediaNotasPorTenant || 0)} sub="notas por tenant ativo" color="text-cyan-400 bg-cyan-500/10" />
        <KpiCard icon={DollarSign} label="MRR" value={`R$ ${(data?.mrr || 0).toFixed(2)}`} sub="receita recorrente" color="text-amber-400 bg-amber-500/10" />
        <KpiCard icon={Target} label="Total Plataforma" value={String(data?.totalInvoices || 0)} sub="notas emitidas (geral)" color="text-pink-400 bg-pink-500/10" />
      </div>

      {/* Alertas */}
      {data?.tenantsLimite?.length > 0 && (
        <div className="mb-4 p-4 bg-amber-900/20 border border-amber-800/40 rounded-2xl">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle size={18} className="text-amber-400" /><span className="text-sm font-bold text-amber-300">Próximos do limite (≥80%)</span></div>
          {data.tenantsLimite.map(t => (
            <div key={t.id} className="flex items-center justify-between text-sm text-amber-200 py-1">
              <span>{t.razaoSocial}</span><span className="font-bold">{t.usado}/{t.limite} notas</span>
            </div>
          ))}
        </div>
      )}

      {data?.upsellPotencial?.length > 0 && (
        <div className="mb-8 p-4 bg-emerald-900/20 border border-emerald-800/40 rounded-2xl">
          <div className="flex items-center gap-2 mb-3"><Target size={18} className="text-emerald-400" /><span className="text-sm font-bold text-emerald-300">Upsell Potencial (≥90%)</span></div>
          {data.upsellPotencial.map(t => (
            <div key={t.id} className="flex items-center justify-between text-sm text-emerald-200 py-1">
              <span>{t.razaoSocial}</span><span className="font-bold">{t.usado}/{t.limite} notas</span>
            </div>
          ))}
        </div>
      )}

      {/* Top Tenants */}
      <h2 className="text-lg font-bold text-white mb-4">Top Tenants (este mês)</h2>
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase font-black tracking-wider">
              <th className="text-left p-4">Empresa</th><th className="text-left p-4">Subdomínio</th><th className="text-left p-4">Plano</th><th className="text-right p-4">Notas</th><th className="text-right p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.topTenants?.map(t => (
              <tr key={t.id} className="border-b border-gray-800/50 text-gray-300 hover:bg-gray-800/30">
                <td className="p-4 font-medium">{t.razaoSocial}</td>
                <td className="p-4 text-gray-500">{t.subdomain}</td>
                <td className="p-4">{t.plano}</td>
                <td className="p-4 text-right font-bold">{t.notasMes}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminSidebar>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-800 bg-gray-900/50">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
      <p className="text-[10px] text-gray-600 font-medium mt-0.5">{sub}</p>
    </div>
  );
}