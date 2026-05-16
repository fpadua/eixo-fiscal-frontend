'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTenantFromURL, getStoredTenant } from '@/lib/tenant';
import { Lock, User, Eye, EyeOff, ArrowRight, LogOut, CheckCircle, Building2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inactiveMessage, setInactiveMessage] = useState(false);
  const [cadastroOk, setCadastroOk] = useState(false);
  const [tenantIdentifier, setTenantIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const detected = getTenantFromURL() || getStoredTenant();
    if (detected) setTenantIdentifier(detected);
  }, []);

  useEffect(() => {
    if (searchParams.get('inactive') === 'true') {
      setInactiveMessage(true);
    }
    if (searchParams.get('cadastro') === 'ok') {
      setCadastroOk(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInactiveMessage(false);

      try {
        await login(email, password, tenantIdentifier || undefined);
        router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-gray-50 flex flex-col items-center justify-center p-4 md:p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
      <div className="w-full max-w-[400px] flex flex-col gap-4 md:gap-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo.png"
            alt="NFS-e Nacional"
            className="h-16 md:h-24 w-auto object-contain"
          />
          <div className="text-center">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bem-vindo de volta</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Acesse sua conta para gerenciar suas notas</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/30 rounded-[32px] overflow-hidden bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {cadastroOk && (
                <div className="p-4 bg-emerald-100 border-2 border-emerald-300 rounded-xl flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Cadastro realizado com sucesso!</p>
                    <p className="text-xs text-emerald-600 font-medium">Faça login para acessar o sistema.</p>
                  </div>
                </div>
              )}
              {inactiveMessage && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <LogOut size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-800">Desconectado por inatividade</p>
                    <p className="text-xs text-amber-600 font-medium">Sua sessão foi encerrada por segurança. Faça login novamente.</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {tenantIdentifier && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
                    <Building2 size={14} className="text-indigo-600 shrink-0" />
                    <p className="text-xs font-bold text-indigo-700 truncate max-w-[200px]" title={tenantIdentifier}>Subdominio: {tenantIdentifier}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Usuário / E-mail</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <Input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 pl-12 bg-gray-50 border-none focus-visible:ring-indigo-600 rounded-2xl font-semibold text-gray-900"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Senha de Acesso</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-12 pr-12 bg-gray-50 border-none focus-visible:ring-indigo-600 rounded-2xl font-semibold text-gray-900"
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" defaultChecked />
                  <span className="text-xs font-bold text-gray-500">Lembrar acesso</span>
                </label>
                <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">Esqueci a senha</button> 
              </div> */}

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl text-base font-black shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98] bg-indigo-600"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Entrar no Sistema</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs font-bold text-gray-400">
          Não possui uma conta? <Link href="/cadastro" className="text-indigo-600 hover:underline">Cadastre sua empresa</Link>
        </p>
      </div>

      <div className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-4">
        <span>© 2026 · Eixo Fiscal</span>
        <span className="w-1 h-1 rounded-full bg-gray-200" />
        <span>Goiânia</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}