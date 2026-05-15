'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nfseApi, getAuth } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminPlanos() {
  const router = useRouter();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nome: '', slug: '', precoMensal: '', limiteNotas: '', maxUsuarios: '1', features: '' });
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.user || auth.user.role !== 'master') { router.replace('/admin/login'); return; }
    nfseApi.admin.listarPlanos().then(r => setPlanos(r.data)).finally(() => setLoading(false));
  }, []);

  const resetForm = () => { setForm({ nome: '', slug: '', precoMensal: '', limiteNotas: '', maxUsuarios: '1', features: '' }); setEditId(null); setShowForm(false); setSaveError(null); };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = { ...form, precoMensal: Number(form.precoMensal), limiteNotas: Number(form.limiteNotas || 0), maxUsuarios: Number(form.maxUsuarios || 1), features: form.features.split(',').map(f => f.trim()).filter(Boolean) };
      const r = editId ? await nfseApi.admin.atualizarPlano(editId, payload) : await nfseApi.admin.criarPlano(payload);
      setPlanos(ps => editId ? ps.map(p => p.id === editId ? r.data : p) : [...ps, r.data]);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.erro || err.message || 'Erro ao salvar plano';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const editar = (p) => { setForm({ nome: p.nome, slug: p.slug, precoMensal: String(p.precoMensal), limiteNotas: String(p.limiteNotas), maxUsuarios: String(p.maxUsuarios), features: (p.features || []).join(', ') }); setEditId(p.id); setShowForm(true); };

  const handleDelete = async (id, nome) => {
    if (!confirm(`Desativar o plano "${nome}"? Os tenants vinculados manterão o plano atual.`)) return;
    try {
      await nfseApi.admin.deletarPlano(id);
      setPlanos(ps => ps.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao desativar plano');
    }
  };

  if (loading) return <AdminSidebar><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mt-20" /></AdminSidebar>;

  return (
    <AdminSidebar>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Planos</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-500 font-bold h-11"><Plus size={18} className="mr-2" /> Novo Plano</Button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {planos.map(p => (
          <div key={p.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
            <h3 className="text-lg font-bold text-white mb-1">{p.nome}</h3>
            <p className="text-3xl font-black text-indigo-400 mb-4">{p.precoMensal > 0 ? `R$ ${Number(p.precoMensal).toFixed(2)}` : 'Grátis'}<span className="text-sm font-medium text-gray-500">/mês</span></p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📄 {p.limiteNotas > 0 ? `${p.limiteNotas} notas/mês` : 'Ilimitado'}</p>
              <p>👤 {p.maxUsuarios} {p.maxUsuarios > 1 ? 'usuários' : 'usuário'}</p>
              <p className="text-gray-600">{(p.features || []).join(', ')}</p>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-800">
              <button onClick={() => editar(p)} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase">Editar</button>
              <button onClick={() => handleDelete(p.id, p.nome)} className="text-xs font-bold text-red-400 hover:text-red-300 uppercase">Desativar</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editId ? 'Editar' : 'Novo'} Plano</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {saveError && <div className="p-3 bg-red-900/50 border border-red-800 rounded-xl text-red-400 text-sm font-medium">{saveError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-gray-500">Nome</label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="h-11 bg-gray-800 border-gray-700 text-white" /></div>
                <div><label className="text-[10px] font-bold uppercase text-gray-500">Slug</label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="h-11 bg-gray-800 border-gray-700 text-white" /></div>
                <div><label className="text-[10px] font-bold uppercase text-gray-500">Preço</label><Input value={form.precoMensal} onChange={e => setForm({ ...form, precoMensal: e.target.value })} type="number" step="0.01" className="h-11 bg-gray-800 border-gray-700 text-white" /></div>
                <div><label className="text-[10px] font-bold uppercase text-gray-500">Limite Notas</label><Input value={form.limiteNotas} onChange={e => setForm({ ...form, limiteNotas: e.target.value })} type="number" className="h-11 bg-gray-800 border-gray-700 text-white" /></div>
                <div><label className="text-[10px] font-bold uppercase text-gray-500">Máx. Usuários</label><Input value={form.maxUsuarios} onChange={e => setForm({ ...form, maxUsuarios: e.target.value })} type="number" className="h-11 bg-gray-800 border-gray-700 text-white" /></div>
              </div>
              <div><label className="text-[10px] font-bold uppercase text-gray-500">Features (separadas por vírgula)</label><Input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} className="h-11 bg-gray-800 border-gray-700 text-white" /></div>
              <Button onClick={handleSave} disabled={saving} className="w-full h-11 font-bold bg-indigo-600 hover:bg-indigo-500">{saving ? 'Salvando...' : (editId ? 'Salvar' : 'Criar')} Plano</Button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
}