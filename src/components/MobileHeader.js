'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

export default function MobileHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 z-50 md:hidden">
      <div className="flex items-center h-full">
        <Link href="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="NFS-e Nacional" 
            className="h-9 w-auto object-contain block"
            style={{ maxHeight: '36px' }}
          />
        </Link>
      </div>
      
      <div className="flex items-center h-full">
        <button className="flex items-center justify-center active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
            <User size={18} strokeWidth={2.5} />
          </div>
        </button>
      </div>
    </header>
  );
}