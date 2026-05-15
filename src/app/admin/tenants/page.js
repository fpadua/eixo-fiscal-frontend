'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nfseApi, getAuth } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { Search } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function AdminTenants() {
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.user || auth.user.role !== 'master') { router.replace('/admin/login'); return; }
    Promise.all([nfseApi.admin.listarTenants(), nfseApi.admin.listarPlanos()])
      .then(([t, p]) => { setTenants(t.data.tenants); setPlanos(p.data.sort((a, b) => a.limiteNotas - b.limiteNotas)); })
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id, current) => {
    const novo = current === 'active' ? 'inactive' : 'active';
    await nfseApi.admin.atualizarTenant(id, { status: novo });
    setTenants(ts => ts.map(t => t.id === id ? { ...t, status: novo } : t));
  };

  const mudarPlano = async (id, planId) => {
    await nfseApi.admin.atualizarTenant(id, { planId });
    setTenants(ts => ts.map(t => t.id === id ? { ...t, planId, plan: planos.find(p => p.id === planId) } : t));
  };

  const filtered = tenants.filter(t =>
    t.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <AdminSidebar><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mt-20" /></AdminSidebar>;

  return (
    <AdminSidebar>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Tenants</h1>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none"
            placeholder="Buscar tenant..." />
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase font-black tracking-wider">
              <th className="text-left p-4">Empresa</th><th className="text-left p-4">Subdomínio</th><th className="text-left p-4">Plano</th><th className="text-center p-4">Usuários</th><th className="text-center p-4">Notas</th><th className="text-center p-4">Status</th><th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-gray-800/50 text-gray-300 hover:bg-gray-800/30">
                <td className="p-4 font-medium">{t.razaoSocial}</td>
                <td className="p-4 text-gray-500">{t.subdomain}</td>
                <td className="p-4">
                  <Select value={t.plan?.id || ''} onValueChange={(v) => mudarPlano(t.id, v)}>
                    <SelectTrigger className="h-8 bg-gray-800 border-gray-700 text-gray-300 text-xs">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {planos.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-center">{t._count?.users || 0}</td>
                <td className="p-4 text-center">{t._count?.invoices || 0}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{t.status}</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => toggleStatus(t.id, t.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      t.status === 'active' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    }`}>{t.status === 'active' ? 'Bloquear' : 'Ativar'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminSidebar>
  );
}