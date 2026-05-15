'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nfseApi, getAuth } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { Search } from 'lucide-react';

export default function AdminUsuarios() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.user || auth.user.role !== 'master') { router.replace('/admin/login'); return; }
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await nfseApi.admin.listarUsuarios({ page, limit: 50, search: search || undefined });
      setUsers(r.data.users);
      setTotal(r.data.total);
    } finally { setLoading(false); }
  };

  if (loading && users.length === 0) return (
    <AdminSidebar><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mt-20" /></AdminSidebar>
  );

  return (
    <AdminSidebar>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <span className="text-sm text-gray-500">{total} usuário(s)</span>
      </div>

      <div className="relative w-full max-w-xs mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none"
          placeholder="Buscar por nome ou e-mail..." />
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase font-black tracking-wider">
              <th className="text-left p-4">Nome</th><th className="text-left p-4">E-mail</th><th className="text-left p-4">Empresa</th><th className="text-left p-4">Role</th><th className="text-center p-4">Status</th><th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-800/50 text-gray-300 hover:bg-gray-800/30">
                <td className="p-4 font-medium">{u.nome}</td>
                <td className="p-4 text-gray-400">{u.email}</td>
                <td className="p-4">{u.tenant?.razaoSocial || '-'}</td>
                <td className="p-4"><span className="text-[10px] font-bold uppercase text-indigo-400">{u.role}</span></td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{u.status}</span>
                </td>
                <td className="p-4 text-right">
                  {u.role !== 'master' && (
                    <button
                      onClick={async () => {
                        const novo = u.status === 'active' ? 'inactive' : 'active';
                        await nfseApi.admin.atualizarUsuario(u.id, { status: novo });
                        setUsers(us => us.map(x => x.id === u.id ? { ...x, status: novo } : x));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        u.status === 'active' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      }`}
                    >
                      {u.status === 'active' ? 'Bloquear' : 'Ativar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 50 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700">Anterior</button>
          <span className="text-sm text-gray-500">Página {page} de {Math.ceil(total / 50)}</span>
          <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700">Próxima</button>
        </div>
      )}
    </AdminSidebar>
  );
}