'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Search, 
  Plus, 
  XCircle, 
  MoreHorizontal, 
  ListOrdered, 
  Settings,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Início' },
    { href: '/clientes', icon: Users, label: 'Clientes' },
    { href: '/emitir', icon: Plus, label: 'Emitir', primary: true },
    { href: '/notas', icon: ListOrdered, label: 'Notas' },
    { type: 'button', icon: MoreHorizontal, label: 'Mais', onClick: () => setShowMenu(!showMenu) },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-gray-100 grid grid-cols-5 items-center z-[1000] md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {navItems.map((item, idx) => {
          if (item.primary) {
            return (
              <div key={item.href} className="flex flex-col items-center justify-center h-full">
                <Link 
                  href={item.href} 
                  className="relative -top-4 flex flex-col items-center group"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform">
                    <Plus size={24} strokeWidth={3} />
                  </div>
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter mt-1 opacity-100">Emitir</span>
                </Link>
              </div>
            );
          }

          if (item.type === 'button') {
            return (
              <button 
                key="more-btn"
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-90 ${showMenu ? 'text-indigo-600' : 'text-gray-400'}`}
              >
                <item.icon size={20} strokeWidth={showMenu ? 2.5 : 2} />
                <span className={`text-[9px] font-black uppercase tracking-tighter ${showMenu ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
              </button>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-90 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Backdrop for Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[1001] md:hidden animate-in fade-in duration-200" onClick={() => setShowMenu(false)} />
      )}

      {/* Floating Menu */}
      {showMenu && (
        <div 
          ref={menuRef} 
          className="fixed bottom-20 right-4 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 p-2 z-[1002] min-w-[200px] animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="px-3 py-2 border-b border-gray-50 mb-1">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">Acesso Rápido</span>
          </div>
          
          <Link 
            href="/consultar"
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700 active:bg-indigo-50"
          >
            <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Search size={18} />
            </div>
            <span className="text-xs font-bold text-gray-700">Busca Detalhada</span>
          </Link>

          <Link 
            href="/cancelar"
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-red-600 active:bg-red-50"
          >
            <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle size={18} />
            </div>
            <span className="text-xs font-bold text-red-700">Cancelar Notas</span>
          </Link>

          <div className="h-px bg-gray-100 my-1" />

          <Link
            href="/configuracoes"
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-500"
          >
            <div className="w-8 h-8 rounded-md bg-gray-50 text-gray-500 flex items-center justify-center">
              <Settings size={18} />
            </div>
            <span className="text-xs font-bold text-gray-500">Configurações</span>
          </Link>

          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-colors text-red-500 active:bg-red-100"
          >
            <div className="w-8 h-8 rounded-md bg-red-50 text-red-500 flex items-center justify-center">
              <LogOut size={18} />
            </div>
            <span className="text-xs font-bold text-red-600">Desconectar</span>
          </button>
        </div>
      )}
    </>
  );
}