'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi, setAccessToken, setRefreshToken, setUser } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await authApi.login(email, password);
      const { token, refreshToken, user } = resp.data;
      if (user.role !== 'master') {
        setError('Acesso permitido apenas para administradores master.');
        return;
      }
      setAccessToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo-branca.png" alt="NFS-e" className="h-16 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white">Painel Master</h1>
          <p className="text-sm text-gray-400">Administração multi-tenant</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded-xl text-red-400 text-sm font-medium">{error}</div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">E-mail master</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500" placeholder="master@admin.com" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Senha master</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-10 pr-12 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500" placeholder="********" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 font-bold bg-indigo-600 hover:bg-indigo-500">
            {loading ? 'Autenticando...' : <><ArrowRight size={18} className="mr-2" /> Acessar Painel</>}
          </Button>
        </form>

        <p className="text-center mt-6">
          <a href="/login" className="text-xs text-gray-500 hover:text-gray-300">Voltar ao login da empresa</a>
        </p>
      </div>
    </div>
  );
}