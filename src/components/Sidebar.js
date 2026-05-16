'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  XCircle, 
  AlertTriangle, 
  ListOrdered,
  LayoutDashboard,
  Settings,
  FileText,
  User,
  LogOut,
  Lock
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';

const links = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Operações' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/emitir', icon: FileText, label: 'Emitir Nova Nota' },
  { href: '/notas', icon: ListOrdered, label: 'Minhas Notas' },
  { section: 'Ferramentas' },
  { href: '/consultar', icon: Search, label: 'Consultar Status' },
  { href: '/cancelar', icon: XCircle, label: 'Cancelar / Substituir' },
  { section: 'Sistema' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, loaded } = useSettings();
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const isTestMode = loaded && settings.ambiente !== 'producao';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen bg-white border-r border-gray-100 flex-shrink-0 sticky top-0">
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="NFS-e Nacional" 
            className="w-full h-auto object-contain max-h-[50px]"
          />
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map((item, i) => {
          if (item.section) return (
            <div key={i} className="px-3 pt-6 pb-2">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{item.section}</span>
            </div>
          );

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'} />
                <span className={`text-sm font-semibold tracking-tight ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        {isTestMode && (
          <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center text-amber-600">
              <AlertTriangle size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-800 uppercase leading-none">Ambiente {settings.ambiente === 'homologacao' ? 'Homologação' : 'Teste'}</span>
              <span className="text-[9px] text-amber-600 font-bold uppercase mt-0.5">{settings.ambiente === 'homologacao' ? 'Homologação' : 'Testes'}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowChangePassword(true)}
          className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 hover:bg-indigo-50 hover:border-indigo-100 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <User size={18} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-gray-900 truncate">{user?.nome || 'Usuário'}</h4>
            <p className="text-[10px] text-gray-500 truncate">{user?.email || ''}</p>
          </div>
          <Lock size={14} className="text-gray-300 shrink-0" />
        </button>

        <div className="mt-4 px-3 flex items-center justify-between">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase hover:text-red-600 transition-colors"
          >
            <LogOut size={12} />
            Desconectar
          </button>
          <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Ajuda</button>
        </div>
      </div>
      <ChangePasswordDialog open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </aside>
  );
}