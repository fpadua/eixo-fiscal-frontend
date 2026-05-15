'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nfseApi, getAuth } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { Settings, Shield, Globe } from 'lucide-react';

export default function AdminConfiguracoes() {
  const router = useRouter();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.user || auth.user.role !== 'master') { router.replace('/admin/login'); return; }
    nfseApi.admin.getConfiguracoes().then(r => setConfigs(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminSidebar><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mt-20" /></AdminSidebar>;

  return (
    <AdminSidebar>
      <h1 className="text-2xl font-bold text-white mb-8">Configurações Globais</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-gray-200">Configurações por Tenant</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Visão geral das configurações de certificado, versão e ambiente de cada tenant cadastrado.</p>

          <div className="space-y-3">
            {configs.map(c => (
              <div key={c.id} className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                <p className="text-sm font-bold text-gray-200">{c.tenant?.razaoSocial || c.tenantId}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                  <div><span className="text-gray-500">Versão:</span> <span className="text-gray-300 font-bold uppercase">{c.nfseVersion}</span></div>
                  <div><span className="text-gray-500">Ambiente:</span> <span className="text-gray-300 font-bold uppercase">{c.ambiente}</span></div>
                  <div><span className="text-gray-500">Certificado:</span> <span className={`font-bold uppercase ${c.certificateContent ? 'text-emerald-400' : 'text-red-400'}`}>{c.certificateContent ? 'Sim' : 'Não'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={20} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-gray-200">Informações do Sistema</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Total de Tenants', val: String(configs.length) },
              { label: 'Com Certificado', val: String(configs.filter(c => c.certificateContent).length) },
              { label: 'Sem Certificado', val: String(configs.filter(c => !c.certificateContent).length) },
              { label: 'Versão V1', val: String(configs.filter(c => c.nfseVersion === 'v1').length) },
              { label: 'Versão V2', val: String(configs.filter(c => c.nfseVersion === 'v2').length) },
              { label: 'Homologação', val: String(configs.filter(c => c.ambiente === 'homologacao').length) },
              { label: 'Produção', val: String(configs.filter(c => c.ambiente === 'producao').length) },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-white font-bold">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}