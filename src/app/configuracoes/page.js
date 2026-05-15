'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Settings, ChevronLeft, Upload, Shield, Calendar, Building2, Award, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { nfseApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ambientes = {
  homologacao: { label: 'Homologação', description: 'Ambiente de testes com notas sem valor jurídico' },
  producao: { label: 'Produção', description: 'Ambiente oficial com notas fiscais válidas' },
};

export default function ConfiguracoesPage() {
  const { settings, updateSettings, currentVersion, versions, saving, saveError } = useSettings();
  const [certInfo, setCertInfo] = useState(null);
  const [certExpiration, setCertExpiration] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const [certPassword, setCertPassword] = useState('');
  const [certMsg, setCertMsg] = useState('');
  const [alertDays, setAlertDays] = useState(30);
  const [savingAlert, setSavingAlert] = useState(false);

  useEffect(() => {
    nfseApi.config.getCertificateInfo()
      .then(r => setCertInfo(r.data))
      .catch(() => {});
    nfseApi.config.getCertExpiration()
      .then(r => {
        setCertExpiration(r.data);
        setAlertDays(r.data.alertDays || 30);
      })
      .catch(() => {});
  }, []);

  const handleCertUpload = async () => {
    if (!certFile) return;
    setUploading(true);
    setCertMsg('');
    try {
      const fd = new FormData();
      fd.append('certificate', certFile);
      fd.append('password', certPassword);
      await nfseApi.config.uploadCertificate(fd);
      setCertMsg('ok');
      const r = await nfseApi.config.getCertificateInfo();
      setCertInfo(r.data);
      setCertFile(null);
      setCertPassword('');
    } catch (err) {
      setCertMsg('erro: ' + (err.response?.data?.erro || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-gray-100 transition-colors rounded-md">
          <ChevronLeft size={20} className="text-gray-500" />
        </Link>
        <div className="p-2.5 bg-indigo-600 rounded-md text-white shadow-lg shadow-indigo-100">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Configurações</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Ajustes do sistema</p>
        </div>
      </div>

      {/* Certificado Digital */}
      <div className="card">
        <div className="form-section-title" style={{ marginTop: 0 }}>
          <Shield size={16} /> Certificado Digital A1
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Envie o certificado digital (arquivo .pfx) da empresa para assinar as notas fiscais.
        </p>

        {certInfo?.hasCertificate && (
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/40 border border-indigo-100 rounded-2xl mb-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-indigo-600" />
              <p className="text-sm font-bold text-indigo-800">Certificado cadastrado</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <UserCheck size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Titular (CN)</p>
                  <p className="text-xs font-bold text-indigo-700">{certInfo.subject || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building2 size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">CNPJ (O)</p>
                  <p className="text-xs font-bold text-indigo-700">{certInfo.cnpj || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Validade</p>
                  <p className="text-xs font-bold text-indigo-700">
                    {certInfo.validFrom ? `${new Date(certInfo.validFrom).toLocaleDateString()} → ${new Date(certInfo.validTo).toLocaleDateString()}` : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Award size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Emissor</p>
                  <p className="text-xs font-bold text-indigo-700">{certInfo.issuer || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Dias restantes</p>
                  <p className={`text-xs font-bold ${certExpiration?.expired ? 'text-red-600' : certExpiration?.expiringSoon ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {certExpiration?.hasCertificate
                      ? certExpiration.expired
                        ? 'Vencido'
                        : `${certExpiration.daysLeft} dias`
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
              <Shield size={10} /> Tipo: {certInfo.certificateType || 'A1'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Arquivo .pfx</label>
            <input
              type="file" accept=".pfx,.p12"
              onChange={(e) => setCertFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Senha do Certificado</label>
            <Input type="password" value={certPassword} onChange={(e) => setCertPassword(e.target.value)} placeholder="Digite a senha" className="h-11" />
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button onClick={handleCertUpload} disabled={!certFile || uploading} className="h-11 font-bold shrink-0">
              {uploading ? 'Enviando...' : <><Upload size={16} className="mr-2" /> Enviar Certificado</>}
            </Button>
            {certMsg === 'ok' && <p className="text-xs text-green-600 font-medium">✅ Certificado salvo com sucesso!</p>}
            {certMsg.startsWith('erro') && <p className="text-xs text-red-600 font-medium">{certMsg}</p>}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="text-[10px] font-bold uppercase text-gray-500">Alerta de expiração (dias)</label>
          <p className="text-[10px] text-gray-400 mb-2">Número de dias antes do vencimento para exibir alerta no dashboard.</p>
          <div className="flex items-end gap-3">
            <Input
              type="number" min={1} max={365}
              value={alertDays}
              onChange={(e) => setAlertDays(Number(e.target.value))}
              className="h-11 w-24"
            />
            <Button
              onClick={async () => {
                setSavingAlert(true);
                try {
                  await nfseApi.config.updateCertAlertDays(alertDays);
                  const r = await nfseApi.config.getCertExpiration();
                  setCertExpiration(r.data);
                } catch (e) {
                  console.error(e);
                } finally {
                  setSavingAlert(false);
                }
              }}
              disabled={savingAlert}
              variant="outline"
              className="h-11 font-bold"
            >
              {savingAlert ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Versão e Ambiente */}
      <div className="card">
        <div className="form-section-title" style={{ marginTop: 0 }}>
          Versão e Ambiente
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Selecione a versão do NFS-e e o ambiente que será utilizado nas requisições ao backend.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Versão NFS-e</div>
            {Object.entries(versions).map(([key, v]) => {
              const isActive = settings.nfseVersion === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSettings({ nfseVersion: key })}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{v.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{v.description}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isActive ? 'border-indigo-500' : 'border-gray-300'
                    }`}>
                      {isActive && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ambiente</div>
            {Object.entries(ambientes).map(([key, amb]) => {
              const isActive = settings.ambiente === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSettings({ ambiente: key })}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{amb.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{amb.description}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isActive ? 'border-indigo-500' : 'border-gray-300'
                    }`}>
                      {isActive && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-xs text-amber-800 font-medium">
            <strong>Versão atual:</strong> {currentVersion.full}
          </p>
          {saving && <p className="text-xs text-amber-700 mt-2 font-medium">Salvando configuração...</p>}
          {saveError && <p className="text-xs text-red-700 mt-2 font-medium">{saveError}</p>}
        </div>
      </div>
    </div>
  );
}