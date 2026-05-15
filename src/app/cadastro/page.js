'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  const [form, setForm] = useState({
    razaoSocial: '', nomeFantasia: '', cnpj: '', inscricaoMunicipal: '', ie: '',
    subdomain: '', email: '', password: '', confirmPassword: '',
    logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: 'GO',
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const mascaraCnpjCpf = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 14);
    if (v.length <= 11) {
      v = v.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
    } else {
      v = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    setForm({ ...form, cnpj: v });
  };

  const mascaraCep = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
    setForm({ ...form, cep: v });
  };

  const sanitizarSubdominio = (e) => {
    const raw = e.target.value;
    const clean = raw.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    setForm({ ...form, subdomain: clean });
  };

  const [stepError, setStepError] = useState(null);
  const [subdomainError, setSubdomainError] = useState(false);

  const handleSubdomainKeyDown = (e) => {
    if (e.key === ' ') {
      setSubdomainError(true);
      setTimeout(() => setSubdomainError(false), 3000);
    }
  };

  const validarPasso1 = () => {
    if (!form.razaoSocial.trim()) { setStepError('Preencha a Razão Social'); return false; }
    if (!form.cnpj.replace(/\D/g, '')) { setStepError('Preencha o CNPJ'); return false; }
    if (!form.subdomain.trim()) { setStepError('Preencha o Subdomínio'); return false; }
    return true;
  };

  const validarPasso2 = () => {
    if (!form.cep.replace(/\D/g, '')) { setStepError('Preencha o CEP'); return false; }
    return true;
  };

  const validarPasso3 = () => {
    if (!form.email.trim()) { setStepError('Preencha o e-mail'); return false; }
    if (!form.password) { setStepError('Preencha a senha'); return false; }
    if (!form.confirmPassword) { setStepError('Confirme a senha'); return false; }
    if (form.password.length < 8) { setStepError('A senha deve ter no mínimo 8 caracteres'); return false; }
    if (!/[A-Z]/.test(form.password)) { setStepError('A senha deve conter ao menos uma letra maiúscula'); return false; }
    if (!/\d/.test(form.password)) { setStepError('A senha deve conter ao menos um número'); return false; }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) { setStepError('A senha deve conter ao menos um símbolo'); return false; }
    if (form.password !== form.confirmPassword) { setStepError('Senhas não conferem'); return false; }
    return true;
  };

  const senhaReqs = {
    maiuscula: /[A-Z]/.test(form.password),
    numero: /\d/.test(form.password),
    simbolo: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
    minLength: form.password.length >= 8,
    conferem: form.confirmPassword ? form.password === form.confirmPassword : null,
  };

  const avancar = (passo, validador) => () => {
    setStepError(null);
    if (validador()) setStep(passo);
  };

  const buscarCep = async () => {
    const cep = form.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await r.json();
      if (!data.erro) {
        setForm(f => ({
          ...f,
          logradouro: data.logradouro || f.logradouro,
          bairro: data.bairro || f.bairro,
          cidade: data.localidade || f.cidade,
          uf: data.uf || f.uf,
        }));
      }
    } catch (e) {
      console.warn('[CEP] Erro ao buscar:', e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarPasso3()) return;
    setLoading(true);
    setError(null);
    setStepError(null);
    try {
      await authApi.registerTenant({
        subdomain: form.subdomain,
        razaoSocial: form.razaoSocial,
        nomeFantasia: form.nomeFantasia,
        cnpj: form.cnpj,
        inscricaoMunicipal: form.inscricaoMunicipal,
        ie: form.ie,
        email: form.email,
        password: form.password,
        endereco: {
          logradouro: form.logradouro,
          numero: form.numero,
          complemento: form.complemento,
          bairro: form.bairro,
          cidade: form.cidade,
          cep: form.cep,
          uf: form.uf,
        },
      });
      router.push('/login?cadastro=ok');
    } catch (err) {
      setError(err.response?.data?.erro || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Link href="/login" className="text-sm text-indigo-600 font-bold flex items-center gap-1 hover:underline">
            <ChevronLeft size={16} /> Voltar ao login
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="NFS-e" className="h-12 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Cadastrar Empresa</h1>
            <p className="text-sm text-gray-500">Preencha os dados para criar sua conta</p>
          </div>

          {(error || stepError) && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium mb-4">{error || stepError}</div>
          )}

          {/* Step Indicator */}
          {step > 0 && (
            <div className="flex items-center justify-center gap-3 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step === s
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : step > s
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                      {step > s ? '✓' : s}
                    </div>
                    <span className={`text-[10px] font-black uppercase hidden sm:block ${step === s ? 'text-indigo-600' : 'text-gray-400'
                      }`}>
                      {s === 1 ? 'Empresa' : s === 2 ? 'Endereço' : 'Acesso'}
                    </span>
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 rounded ${step > s ? 'bg-emerald-400' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Antes de começar</h3>
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-800 leading-relaxed space-y-3">
                  <p className="font-bold">
                    Para emitir notas, primeiramente sua empresa precisa estar cadastrada na prefeitura que foi realizada o cadastro.
                  </p>
                  <p className="text-blue-700">
                    Se ainda não tem cadastro pode efetuar das duas formas:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                      <div>
                        <p className="font-bold text-indigo-700">Certificado Digital:</p>
                        <p className="text-blue-600">Tenha o acesso imediato</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
                      <div>
                        <p className="font-bold text-indigo-700">CPF + senha:</p>
                        <p className="text-blue-600">
                          Exige solicitação de primeiro acesso e validação, no link:{' '}
                          <a href="https://www.issnetonline.com.br/goiania/online/Pessoas/CadastroPrimeiroAcesso.aspx" target="_blank" rel="noopener noreferrer"
                            className="text-indigo-600 underline font-bold hover:text-indigo-800">
                            Cadastro Primeiro Acesso
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button type="button" onClick={() => setStep(1)} className="w-full h-12 font-bold">
                  Já possuo cadastro — Continuar
                </Button>
              </div>
            )}
            {step === 1 && (
              <>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Dados da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Razão Social *</label>
                    <Input value={form.razaoSocial} onChange={update('razaoSocial')} required className="h-11" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Nome Fantasia</label>
                    <Input value={form.nomeFantasia} onChange={update('nomeFantasia')} className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">CNPJ *</label>
                    <Input value={form.cnpj} onChange={mascaraCnpjCpf} placeholder="00.000.000/0001-00" required className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">Inscrição Municipal</label>
                    <Input value={form.inscricaoMunicipal} onChange={update('inscricaoMunicipal')} className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">IE</label>
                    <Input value={form.ie} onChange={update('ie')} className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">Subdomínio *</label>
                    <Input value={form.subdomain} onChange={sanitizarSubdominio} onKeyDown={handleSubdomainKeyDown} placeholder="minhaempresa" required className={`h-11 ${subdomainError ? 'border-red-500 ring-2 ring-red-200' : ''}`} />
                    {subdomainError ? (
                      <p className="text-[10px] font-bold text-red-600 mt-1">Espaços não são permitidos. Use hífen ou deixe tudo junto.</p>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-1">Será usado para acesso: {form.subdomain || 'minhaempresa'}.seudominio.com</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} className="w-full h-12 font-bold">Voltar</Button>
                  <Button type="button" onClick={avancar(2, validarPasso1)} className="w-full h-12 font-bold">Continuar</Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">CEP</label>
                    <Input value={form.cep} onChange={mascaraCep} onBlur={buscarCep} placeholder="00000-000" className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">UF</label>
                    <select
                      value={form.uf}
                      onChange={update('uf')}
                      className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {UFS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Logradouro</label>
                    <Input value={form.logradouro} onChange={update('logradouro')} className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">Número</label>
                    <Input value={form.numero} onChange={update('numero')} className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">Complemento</label>
                    <Input value={form.complemento} onChange={update('complemento')} className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">Bairro</label>
                    <Input value={form.bairro} onChange={update('bairro')} className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">Cidade</label>
                    <Input value={form.cidade} onChange={update('cidade')} className="h-11" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full h-12 font-bold">Voltar</Button>
                  <Button type="button" onClick={avancar(3, validarPasso2)} className="w-full h-12 font-bold">Continuar</Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Acesso</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">E-mail *</label>
                    <Input type="email" value={form.email} onChange={update('email')} required className="h-11" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">Senha *</label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} required minLength={6} className="h-11 pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500">Confirmar Senha *</label>
                    <div className="relative">
                      <Input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} required className="h-11 pr-12" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full h-12 font-bold">Voltar</Button>
                  <Button type="submit" onClick={() => { setStepError(null); const ok = validarPasso3(); if (!ok) return; }} disabled={loading} className="w-full h-12 font-bold">
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}