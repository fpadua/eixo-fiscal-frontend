'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Clock } from 'lucide-react';

const INACTIVITY_MS = 10 * 60 * 1000;
const COUNTDOWN_SEC = 15;

export default function SessionTimer() {
  const router = useRouter();
  const { logout } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const idleRef = useRef(null);
  const countdownRef = useRef(null);
  const dialogRef = useRef(false);
  const expiredRef = useRef(false);

  const clearTimers = () => {
    if (idleRef.current) { clearTimeout(idleRef.current); idleRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  const handleLogout = () => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    clearTimers();
    logout();
    router.replace('/login?inactive=true');
  };

  const startIdleTimer = () => {
    clearTimers();
    idleRef.current = setTimeout(() => {
      dialogRef.current = true;
      setShowDialog(true);
      setCountdown(COUNTDOWN_SEC);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }, INACTIVITY_MS);
  };

  useEffect(() => {
    if (!showDialog) return;
    if (countdown > 0) return;
    clearTimers();
    handleLogout();
  }, [countdown, showDialog]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    let debounce = null;

    const handler = () => {
      if (debounce) return;
      debounce = setTimeout(() => { debounce = null; }, 2000);
      if (dialogRef.current) {
        dialogRef.current = false;
        setShowDialog(false);
      }
      startIdleTimer();
    };

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    startIdleTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimers();
    };
  }, []);

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
            <AlertTriangle size={32} className="text-amber-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Sessão prestes a expirar</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sua sessão será encerrada por inatividade. Clique em continuar para permanecer conectado.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-600 font-bold">
            <Clock size={20} />
            <span className="text-2xl font-black tabular-nums">{countdown}s</span>
          </div>

          <button
            onClick={() => {
              dialogRef.current = false;
              setShowDialog(false);
              startIdleTimer();
            }}
            className="w-full h-14 rounded-2xl text-base font-black shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Continuar sessão
          </button>
        </div>
      </div>
    </div>
  );
}