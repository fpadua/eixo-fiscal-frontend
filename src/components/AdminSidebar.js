'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { 
  LayoutDashboard, Users, FileText, DollarSign, 
  Shield, BarChart3, Settings, LogOut 
} from 'lucide-react';

const links = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/tenants', icon: Users, label: 'Tenants' },
  { href: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { href: '/admin/planos', icon: DollarSign, label: 'Planos' },
  { href: '/admin/relatorios', icon: BarChart3, label: 'Relatórios' },
  { href: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function AdminSidebar({ children }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center gap-2 px-3 py-6 mb-4">
        <img src="/logo-branca.png" alt="NFS-e" className="h-12 md:h-16 w-auto" />
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Administração</p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {links.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 mt-auto pb-4">
        <button onClick={() => { logout(); window.location.href = '/admin/login'; }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-300 hover:bg-gray-800 w-full text-left">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <img src="/logo-branca.png" alt="NFS-e" className="h-8 w-auto" />
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-400 hover:text-white">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 overflow-y-auto animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-gray-900 border-r border-gray-800 z-30 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="md:ml-60 p-4 md:p-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}