'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verificando'); // verificando | sucesso | erro
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('erro');
      setMessage('Link de verificação inválido.');
      return;
    }

    authApi.verifyEmail(token)
      .then(r => {
        setStatus('sucesso');
        setMessage(r.data.message || 'Email verificado com sucesso!');
      })
      .catch(err => {
        setStatus('erro');
        setMessage(err.response?.data?.erro || 'Erro ao verificar email.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="NFS-e" className="h-12 mx-auto mb-4" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          {status === 'verificando' && (
            <div className="space-y-4">
              <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto" />
              <p className="text-gray-500 font-medium">Verificando seu email...</p>
            </div>
          )}

          {status === 'sucesso' && (
            <div className="space-y-4">
              <CheckCircle size={48} className="text-emerald-500 mx-auto" />
              <h1 className="text-xl font-bold text-gray-900">Email verificado!</h1>
              <p className="text-gray-500">{message}</p>
              <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                Fazer login
              </Link>
            </div>
          )}

          {status === 'erro' && (
            <div className="space-y-4">
              <XCircle size={48} className="text-red-500 mx-auto" />
              <h1 className="text-xl font-bold text-gray-900">Falha na verificação</h1>
              <p className="text-gray-500">{message}</p>
              <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                Voltar ao login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}