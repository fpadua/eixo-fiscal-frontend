'use client';

import { Geist } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import MobileHeader from '@/components/MobileHeader';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import SessionTimer from '@/components/SessionTimer';
import { usePathname } from 'next/navigation';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/cadastro' || pathname.startsWith('/admin') || pathname.startsWith('/auth/verify');

  return (
    <html lang="pt-BR" className={geist.variable}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        <AuthProvider>
        {isLoginPage ? (
          <main className="min-h-screen">
            {children}
          </main>
        ) : (
          <SettingsProvider>
            <div className="app-shell">
              <Sidebar />
              <MobileHeader />
              <main className="main-content">
                {children}
              </main>
              <MobileNav />
            </div>
            <SessionTimer />
          </SettingsProvider>
        )}
        </AuthProvider>
      </body>
    </html>
  );
}