'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { nfseApi } from '@/lib/api';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  X, 
  MapPin, 
  FileText, 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchClientes();
  }, []);

  const mascaraCnpjCpf = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 14);
    if (v.length <= 11) {
      v = v.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
    } else {
      v = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    setValue('documento', v);
  };

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const resp = await nfseApi.clientes.listar();
      setClientes(resp.data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await nfseApi.clientes.atualizar(editingId, data);
        setMessage({ type: 'success', text: 'Cliente atualizado com sucesso!' });
      } else {
        await nfseApi.clientes.criar(data);
        setMessage({ type: 'success', text: 'Cliente cadastrado com sucesso!' });
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      fetchClientes();
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.erro || 'Erro ao salvar cliente' });
    }
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id);
    setShowForm(true);
    reset();
    Object.keys(cliente).forEach(key => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        let val = cliente[key];
        if (key === 'documento') {
          const raw = (val || '').replace(/\D/g, '').slice(0, 14);
          if (raw.length <= 11) {
            val = raw.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
          } else {
            val = raw.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
          }
        }
        setValue(key, val);
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    try {
      await nfseApi.clientes.deletar(id);
      setMessage({ type: 'success', text: 'Cliente excluído com sucesso!' });
      fetchClientes();
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      const erroMsg = err.response?.data?.erro || 'Erro ao excluir cliente';
      setMessage({ type: 'error', text: erroMsg });
      fetchClientes();
    }
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();

      if (data.erro) {
        setMessage({ type: 'error', text: 'CEP não encontrado.' });
        return;
      }

      setValue('endereco.logradouro', data.logradouro);
      setValue('endereco.bairro', data.bairro);
      setValue('endereco.uf', data.uf);
      setValue('endereco.localidade', data.localidade);
      setValue('endereco.complemento', data.complemento);
      setMessage({ type: 'success', text: 'Endereço preenchido via CEP.' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.razaoSocial.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.documento.includes(searchQuery)
  );

  return (
    <div className="page-container space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Clientes</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Gestão de tomadores de serviço</p>
          </div>
        </div>
        <Button 
          variant={showForm ? "outline" : "default"} 
          onClick={() => { setShowForm(!showForm); setEditingId(null); reset(); }}
          className="h-11 md:h-12 px-6 shadow-md font-bold rounded-xl flex items-center justify-center gap-2"
        >
          {showForm ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Novo Cliente</>}
        </Button>
      </div>

      {message && (
        <div 
          className={`flex items-center gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <div className="flex-1 text-sm font-semibold">{message.text}</div>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {showForm && (
        <Card className="border-none shadow-xl shadow-indigo-100/50 overflow-hidden animate-in zoom-in-95 duration-200">
          <CardHeader className="bg-indigo-50/30 border-b border-indigo-100/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
              {editingId ? <Pencil size={18} /> : <Plus size={18} />}
              {editingId ? 'Editar Cliente' : 'Novo Cadastro'}
            </CardTitle>
            <CardDescription className="text-indigo-600/70 font-medium">
              Dados do tomador e endereço para emissão de notas.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="pt-6 pb-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  <Building2 size={14} /> Dados Cadastrais
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">CNPJ / CPF *</Label>
                    <Input {...register('documento', { required: true })} onChange={mascaraCnpjCpf} placeholder="00.000.000/0000-00" className="h-12 bg-white" />
                  </div>
                  <div className="form-group md:col-span-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Razão Social / Nome *</Label>
                    <Input {...register('razaoSocial', { required: true })} placeholder="Nome completo" className="h-12 bg-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</Label>
                    <Input type="email" {...register('email')} placeholder="email@exemplo.com" className="h-12 bg-white" />
                  </div>
                  <div className="form-group">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Telefone</Label>
                    <Input {...register('telefone')} placeholder="(00) 00000-0000" className="h-12 bg-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  <MapPin size={14} /> Endereço Completo
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="form-group md:col-span-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">CEP *</Label>
                    <Input {...register('endereco.cep', { required: true, onBlur: handleCepBlur })} placeholder="00000-000" className="h-12 bg-white" />
                  </div>
                  <div className="form-group md:col-span-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Logradouro *</Label>
                    <Input {...register('endereco.logradouro', { required: true })} className="h-12 bg-white" />
                  </div>
                  <div className="form-group md:col-span-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Número *</Label>
                    <Input {...register('endereco.numero', { required: true })} className="h-12 bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="form-group col-span-2 md:col-span-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Bairro *</Label>
                    <Input {...register('endereco.bairro', { required: true })} className="h-12 bg-white" />
                  </div>
                  <div className="form-group col-span-2 md:col-span-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Complemento</Label>
                    <Input {...register('endereco.complemento')} className="h-12 bg-white" />
                  </div>
                  <div className="form-group col-span-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Cidade</Label>
                    <Input {...register('endereco.localidade')} className="h-12 bg-white" />
                  </div>
                  <div className="form-group col-span-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">UF</Label>
                    <Input {...register('endereco.uf')} defaultValue="GO" maxLength={2} className="h-12 bg-white uppercase" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6 flex flex-col md:flex-row gap-3">
              <Button type="submit" className="w-full md:w-auto h-14 px-10 font-bold shadow-lg shadow-indigo-100 rounded-xl flex items-center justify-center gap-2">
                <Save size={18} />
                {editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </Button>
              <Button type="button" variant="ghost" className="w-full md:w-auto h-14 px-8 font-semibold rounded-xl flex items-center justify-center gap-2" onClick={() => setShowForm(false)}>
                <X size={18} />
                Cancelar
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Search and Filters Toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <Input 
            placeholder="Pesquisar por nome ou CPF/CNPJ..." 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl focus-visible:ring-indigo-600 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="hidden md:flex bg-white p-1 rounded-2xl shadow-sm border border-gray-50">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
            size="icon" 
            className="h-12 w-12 rounded-xl" 
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={20} />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="icon" 
            className="h-12 w-12 rounded-xl" 
            onClick={() => setViewMode('list')}
          >
            <List size={20} />
          </Button>
        </div>
      </div>

      {/* Client List */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600/10 border-t-indigo-600 mx-auto" />
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Sincronizando base...</p>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center px-6 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
            <Users size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Nenhum cliente aqui</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed font-medium">
            {searchQuery ? `Não encontramos ninguém com "${searchQuery}".` : "Sua base de tomadores está limpa. Que tal cadastrar o primeiro?"}
          </p>
          {!searchQuery && (
            <Button variant="default" className="mt-8 h-12 px-8 rounded-xl font-bold flex items-center justify-center gap-2" onClick={() => setShowForm(true)}>
              <Plus size={18} /> Começar Agora
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filteredClientes.map(cliente => (
            <Card key={cliente.id} className="border border-gray-50 shadow-sm rounded-3xl overflow-hidden flex flex-col bg-white">
              <CardContent className="p-6 flex-1 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl shrink-0">
                    {cliente.razaoSocial.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 break-words tracking-tight leading-tight">{cliente.razaoSocial}</h3>
                    <p className="text-xs md:text-sm font-black uppercase text-gray-400 tracking-tighter mt-1">
                      {cliente.documento}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {cliente.email && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 shrink-0 mt-0.5">
                        <Mail size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-gray-300 leading-none mb-1">E-mail</p>
                        <p className="text-xs font-semibold text-gray-600 break-all">{cliente.email}</p>
                      </div>
                    </div>
                  )}

                  {cliente.endereco && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 shrink-0 mt-0.5">
                        <MapPin size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-gray-300 leading-none mb-1">Endereço</p>
                        <p className="text-xs font-semibold text-gray-500 leading-relaxed break-words">
                          {cliente.endereco.logradouro}, {cliente.endereco.numero}
                          <br />
                          {cliente.endereco.bairro} · {cliente.endereco.localidade}/{cliente.endereco.uf}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-2 bg-gray-50/50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
                <Button asChild variant="default" size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-xl font-bold text-[9px] uppercase tracking-tighter h-10 shrink-0">
                  <Link href={`/emitir?clienteId=${cliente.id}`} className="flex items-center justify-center gap-1.5">
                    <FileText size={12} /> 
                    <span className="hidden md:inline">Emitir</span>
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="flex-1 h-10 gap-1.5 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-[9px] uppercase tracking-tighter flex items-center justify-center shrink-0" 
                  onClick={() => handleEdit(cliente)}
                >
                  <Pencil size={12} />
                  <span className="hidden md:inline">Editar</span>
                </Button>

                <Button 
                  variant="ghost" 
                  className="flex-1 h-10 gap-1.5 text-red-500 hover:bg-red-50 rounded-xl font-bold text-[9px] uppercase tracking-tighter flex items-center justify-center shrink-0" 
                  onClick={() => handleDelete(cliente.id)}
                >
                  <Trash2 size={12} />
                  <span className="hidden md:inline">Excluir</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* LIST VIEW (Desktop Only) */
        <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Documento</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Contato</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClientes.map(cliente => (
                <tr key={cliente.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                        {cliente.razaoSocial.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-bold text-gray-900 break-words">{cliente.razaoSocial}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-500">{cliente.documento}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 break-all">{cliente.email || '—'}</div>
                    <div className="text-[10px] text-gray-400">{cliente.telefone || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white">
                        <Link href={`/emitir?clienteId=${cliente.id}`} className="flex items-center justify-center gap-1.5">
                          <FileText size={12} /> Emitir
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 flex items-center justify-center" onClick={() => handleEdit(cliente)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 flex items-center justify-center" onClick={() => handleDelete(cliente.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view fallback for list mode on mobile */}
      {viewMode === 'list' && (
        <div className="md:hidden grid grid-cols-1 gap-4">
           {filteredClientes.map(cliente => (
            <Card key={cliente.id} className="border border-gray-100 shadow-sm rounded-3xl overflow-hidden flex flex-col bg-white">
              {/* Reuse grid card content for mobile list fallback */}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shrink-0">
                    {cliente.razaoSocial.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-gray-900 break-words leading-tight">{cliente.razaoSocial}</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{cliente.documento}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 bg-gray-50/50 border-t border-gray-100 flex justify-between gap-2">
                 <Button asChild variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase text-indigo-600 flex items-center justify-center gap-1">
                    <Link href={`/emitir?clienteId=${cliente.id}`} className="flex items-center justify-center gap-1"><FileText size={12} /></Link>
                 </Button>
                 <Button variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase text-gray-400 flex items-center justify-center gap-1" onClick={() => handleEdit(cliente)}>
                    <Pencil size={12} />
                 </Button>
                 <Button variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase text-red-400 flex items-center justify-center gap-1" onClick={() => handleDelete(cliente.id)}>
                    <Trash2 size={12} />
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
