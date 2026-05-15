'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { nfseApi } from '@/lib/api';
import { ChevronLeft, Check, Shield, ArrowRight, BarChart3, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MeuPlanoPage() {
  const [planStatus, setPlanStatus] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [assinarMsg, setAssinarMsg] = useState(null);
  const [assinarLoading, setAssinarLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      nfseApi.invoices.planStatus(),
      nfseApi.planos.listar(),
    ]).then(([s, p]) => {
      setPlanStatus(s.data);
      setPlanos(p.data.sort((a, b) => a.limiteNotas - b.limiteNotas));
      setSelectedId(s.data?.planId || null);
    }).finally(() => setLoading(false));
  }, []);

  const handleAssinar = async () => {
    if (!selectedId || selectedId === planStatus?.planId) return;
    setAssinarLoading(true);
    setAssinarMsg(null);
    try {
      const r = await nfseApi.planos.assinar(selectedId);
      setAssinarMsg({ type: 'success', text: r.data.message });
      setPlanStatus(prev => ({ ...prev, planName: r.data.plano.nome, planSlug: r.data.plano.slug, limiteNotas: r.data.plano.limiteNotas, planId: selectedId }));
      setConfirmModal(false);
    } catch (err) {
      setAssinarMsg({ type: 'error', text: err.response?.data?.erro || 'Erro ao assinar plano' });
    } finally {
      setAssinarLoading(false);
    }
  };

  const selectedPlano = planos.find(p => p.id === selectedId);
  const planosSnap = planos.sort((a, b) => a.limiteNotas - b.limiteNotas);

  if (loading) return (
    <div className="page-container flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="page-container space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-gray-100 transition-colors rounded-md">
          <ChevronLeft size={20} className="text-gray-500" />
        </Link>
        <div className="p-2.5 bg-indigo-600 rounded-md text-white shadow-lg shadow-indigo-100">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Meu Plano</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Gerencie sua assinatura</p>
        </div>
      </div>

      {assinarMsg && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          assinarMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {assinarMsg.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
          <p className="text-sm font-medium">{assinarMsg.text}</p>
        </div>
      )}

      {planStatus?.hasPlan && (
      <div className="card overflow-visible">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-indigo-600" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Plano Atual</h2>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-black text-gray-900">{planStatus.planName}</p>
              <p className="text-xs text-gray-500">
                Status: <span className="font-bold text-indigo-600 uppercase">{planStatus.planStatus}</span>
              </p>
            </div>
          </div>

          {planStatus.limiteNotas > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{planStatus.notasEmitidas} notas emitidas</span>
                <span className={`font-bold ${
                  planStatus.excedido ? 'text-red-600' : planStatus.proximoLimite ? 'text-amber-600' : 'text-emerald-600'
                }`}>{planStatus.percentual}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  planStatus.excedido ? 'bg-red-500' : planStatus.proximoLimite ? 'bg-amber-500' : 'bg-emerald-500'
                }`} style={{ width: `${Math.min(planStatus.percentual, 100)}%` }} />
              </div>
              <p className="text-xs text-gray-400">
                {planStatus.excedido
                  ? `⚠️ Limite de ${planStatus.limiteNotas} notas excedido.`
                  : `Limite: ${planStatus.limiteNotas} notas/mês`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Notas ilimitadas.</p>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={18} className="text-indigo-600" />
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Escolher novo plano</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-5 -mx-2 px-2 scrollbar-hide">
          {planosSnap.map((plano) => {
            const isCurrent = plano.slug === planStatus?.planSlug;
            const isSelected = selectedId === plano.id;
            return (
              <div
                key={plano.id}
                className={`snap-start shrink-0 w-72 p-6 rounded-2xl border-2 flex flex-col transition-all duration-300 ease-out ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-md opacity-90'
                    : `cursor-pointer ${isSelected ? 'border-indigo-400 bg-indigo-50/30 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm hover:-translate-y-2'} active:scale-[0.98]`
                }`}
                onClick={() => !isCurrent && setSelectedId(plano.id)}
              >
                {isCurrent && (
                  <span className="text-[10px] font-black uppercase text-indigo-600 mb-2 flex items-center gap-1">
                    <Check size={12} /> Plano atual
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plano.nome}</h3>
                <p className="text-3xl font-black text-indigo-600 mt-1 mb-4">
                  {Number(plano.precoMensal) > 0
                    ? `R$ ${Number(plano.precoMensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'Grátis'}
                  <span className="text-sm font-medium text-gray-400">/mês</span>
                </p>
                <div className="space-y-2 text-sm text-gray-500 flex-1">
                  <p>📄 {plano.limiteNotas > 0 ? `${plano.limiteNotas} notas/mês` : 'Notas ilimitadas'}</p>
                  <p>👤 Até {plano.maxUsuarios} {plano.maxUsuarios > 1 ? 'usuários' : 'usuário'}</p>
                  {(plano.features || []).map((f, i) => (
                    <p key={i} className="text-gray-400 flex items-center gap-1">
                      <Check size={12} className="text-emerald-500 shrink-0" /> {f}
                    </p>
                  ))}
                </div>
                {isCurrent ? (
                  <div className="mt-6 w-full py-2.5 rounded-xl text-sm font-bold text-center text-indigo-600 bg-indigo-50 border border-indigo-200">
                    Plano atual
                  </div>
                ) : (
                  <div className="mt-6 w-full py-2.5 rounded-xl text-sm font-bold text-center text-gray-500 bg-gray-50 border border-gray-200">
                    Selecionar
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedId && selectedId !== planStatus?.planId && (
          <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">
                {planStatus?.planName} → {selectedPlano?.nome}
              </p>
              <p className="text-xs text-gray-500">
                {selectedPlano?.limiteNotas > 0 ? `${selectedPlano.limiteNotas} notas/mês` : 'Notas ilimitadas'}
                {Number(selectedPlano?.precoMensal) > 0 && ` · R$ ${Number(selectedPlano?.precoMensal).toFixed(2)}/mês`}
              </p>
            </div>
            <Button onClick={() => setConfirmModal(true)} className="h-11 font-bold">
              Assinar plano
            </Button>
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirmModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar mudança de plano</h3>
            <p className="text-sm text-gray-500 mb-4">
              {planStatus?.planName} → <strong className="text-indigo-600">{selectedPlano?.nome}</strong>
            </p>
            {selectedPlano && (
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-1 mb-6">
                <p>📄 {selectedPlano.limiteNotas > 0 ? `${selectedPlano.limiteNotas} notas/mês` : 'Notas ilimitadas'}</p>
                <p>👤 Até {selectedPlano.maxUsuarios} usuários</p>
                {Number(selectedPlano.precoMensal) > 0 && <p className="font-bold text-indigo-600">R$ {Number(selectedPlano.precoMensal).toFixed(2)}/mês</p>}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmModal(false)} className="w-full h-11 font-bold">Cancelar</Button>
              <Button onClick={handleAssinar} disabled={assinarLoading} className="w-full h-11 font-bold">
                {assinarLoading ? 'Assinando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}