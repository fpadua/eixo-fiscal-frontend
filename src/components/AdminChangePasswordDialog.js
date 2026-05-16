'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Eye, EyeOff, CheckCircle, X, Loader2 } from 'lucide-react';
import { nfseApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminChangePasswordDialog({ open, user, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!newPassword || !confirmPassword) {
      setMsg({ type: 'error', text: 'Todos os campos são obrigatórios' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'As senhas não correspondem' });
      return;
    }

    setLoading(true);
    try {
      await nfseApi.admin.changeUserPassword(user.id, newPassword);
      setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { setMsg(null); onClose(); }, 2000);
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.erro || 'Erro ao alterar a senha.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open || !user || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-[32px] shadow-2xl w-full max-w-md mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Alterar Senha</h2>
              <p className="text-xs text-gray-400">Usuário: {user.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {msg && (
          <div className={`p-4 rounded-2xl border mb-6 flex items-center gap-3 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {msg.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
            </div>
            <p className="text-sm font-medium">{msg.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-500">Nova Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="h-11 pr-12 bg-gray-800 border-gray-700 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-500">Confirmar Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="h-11 pr-12 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full h-11 font-bold">
              {loading ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Alterando...</>
              ) : (
                <><Lock size={16} className="mr-2" /> Alterar Senha</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
