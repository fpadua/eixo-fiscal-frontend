'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nfseApi, getAuth } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { BarChart3, Users, RefreshCw } from 'lucide-react';

export default function AdminRelatorios() {
  const router = useRouter();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await nfseApi.admin.relatorios();
      setDados(r.data || []);
    } catch (err) {
      setError(err.response?.data?.erro || err.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.user || auth.user.role !== 'master') { router.replace('/admin/login'); return; }
    fetchData();
  }, []);

  const maxNotas = Math.max(...dados.map(d => d.notas), 1);
  const maxTenants = Math.max(...dados.map(d => d.novosTenants), 1);
  const barMaxHeight = 180;

  if (loading) return <AdminSidebar><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mt-20" /></AdminSidebar>;

  return (
    <AdminSidebar>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 text-sm font-medium">
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800/40 rounded-2xl mb-6 text-red-400 text-sm">{error}</div>
      )}

      {dados.length === 0 && !error ? (
        <div className="text-center py-20 text-gray-500">
          <BarChart3 size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-bold">Nenhum dado disponível</p>
          <p className="text-sm mt-1">Emita algumas notas para ver os relatórios.</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 md:p-6">
            <h2 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-400" /> Notas Emitidas (últimos 12 meses)
            </h2>
            <div className="flex items-end gap-1 md:gap-2" style={{ height: barMaxHeight + 30 + 'px' }}>
              {dados.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative justify-end" style={{ height: '100%' }}>
                  <span className="text-[10px] text-gray-500 font-bold">{d.notas}</span>
                  <div
                    className="w-full bg-indigo-500/60 rounded-t-md hover:bg-indigo-400 transition-all cursor-pointer"
                    style={{ height: `${Math.max(Math.round((d.notas / maxNotas) * barMaxHeight), d.notas > 0 ? 20 : 0)}px`, minHeight: d.notas > 0 ? '20px' : '0' }}
                    title={`${d.mes}: ${d.notas} notas`}
                  />
                  <span className="text-[7px] md:text-[8px] text-gray-600 font-bold text-center mt-1 leading-tight">{d.mes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-400" /> Novos Tenants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const ultimo = dados[dados.length - 1] || { novosTenants: 0 };
                const anterior = dados[dados.length - 2] || { novosTenants: 0 };
                const totalNovos = dados.reduce((s, d) => s + d.novosTenants, 0);
                const media = Math.round(totalNovos / dados.length);
                const crescimento = anterior.novosTenants > 0
                  ? Math.round(((ultimo.novosTenants - anterior.novosTenants) / anterior.novosTenants) * 100)
                  : 0;
                return [
                  { label: 'Este mês', value: String(ultimo.novosTenants), color: 'text-indigo-400' },
                  { label: 'Mês anterior', value: String(anterior.novosTenants), color: 'text-gray-400' },
                  { label: 'Média mensal', value: String(media), color: 'text-emerald-400' },
                  { label: 'Crescimento', value: `${crescimento > 0 ? '+' : ''}${crescimento}%`, color: crescimento >= 0 ? 'text-emerald-400' : 'text-red-400' },
                ];
              })().map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-800/50 border border-gray-800">
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">{item.label}</p>
                  <p className={`text-2xl font-black mt-1 ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminSidebar>
  );
}