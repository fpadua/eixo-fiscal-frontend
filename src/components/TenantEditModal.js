'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function TenantEditModal({ tenant, onClose, onSave }) {
  const addr = tenant.endereco || {};
  const [form, setForm] = useState({ ...tenant, endereco: { ...addr } });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const updateAddr = (field) => (e) => setForm({ ...form, endereco: { ...form.endereco, [field]: e.target.value } });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { endereco, ...rest } = form;
      await onSave({ ...rest, endereco });
      onClose();
    } catch (err) {
      setError(err.response?.data?.erro || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Editar Dados da Empresa</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>
          )}

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Razão Social</label>
            <Input value={form.razaoSocial} onChange={update('razaoSocial')} className="h-11" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Nome Fantasia</label>
            <Input value={form.nomeFantasia || ''} onChange={update('nomeFantasia')} className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500">CNPJ</label>
              <Input value={form.cnpj} onChange={update('cnpj')} className="h-11" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500">Inscrição Municipal</label>
              <Input value={form.inscricaoMunicipal || ''} onChange={update('inscricaoMunicipal')} className="h-11" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500">IE</label>
              <Input value={form.ie || ''} onChange={update('ie')} className="h-11" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500">Subdomínio</label>
              <Input value={form.subdomain} onChange={update('subdomain')} className="h-11 bg-gray-50 text-gray-400" disabled />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">Endereço</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Logradouro</label>
                <Input value={form.endereco.logradouro || ''} onChange={updateAddr('logradouro')} className="h-11" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Número</label>
                <Input value={form.endereco.numero || ''} onChange={updateAddr('numero')} className="h-11" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Complemento</label>
                <Input value={form.endereco.complemento || ''} onChange={updateAddr('complemento')} className="h-11" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Bairro</label>
                <Input value={form.endereco.bairro || ''} onChange={updateAddr('bairro')} className="h-11" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Cidade</label>
                <Input value={form.endereco.cidade || ''} onChange={updateAddr('cidade')} className="h-11" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">CEP</label>
                <Input value={form.endereco.cep || ''} onChange={updateAddr('cep')} className="h-11" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">UF</label>
                <Select value={form.endereco.uf || ''} onValueChange={(v) => setForm({ ...form, endereco: { ...form.endereco, uf: v } })}>
                  <SelectTrigger className="h-11 bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 shrink-0">
          <Button variant="outline" onClick={onClose} className="h-11 font-bold">Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="h-11 font-bold">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}