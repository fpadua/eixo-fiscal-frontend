'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export default function SearchableSelect({ items = [], value, onSelect, placeholder = 'Selecione...', labelKey = 'razaoSocial', secondaryKey = 'documento' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) => {
    const label = String(item[labelKey] || '').toLowerCase();
    const secondary = String(item[secondaryKey] || '').toLowerCase();
    const q = search.toLowerCase();
    return label.includes(q) || secondary.includes(q);
  });

  const selectedItem = items.find((i) => i.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 hover:border-indigo-200 transition-colors"
        >
          <span className={selectedItem ? '' : 'text-gray-400 truncate'}>
            {selectedItem ? `${selectedItem[labelKey]} (${selectedItem[secondaryKey]})` : placeholder}
          </span>
          <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-md border-gray-300 shadow-lg" align="start" sideOffset={4}>
        <div className="p-2 border-b border-gray-300">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar cliente..."
              className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-gray-400"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-gray-400 font-medium">
              Nenhum cliente encontrado
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = item.id === value;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium truncate ${isSelected ? 'text-indigo-600' : ''}`}>{item[labelKey]}</div>
                    <div className={`text-[10px] font-semibold uppercase ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`}>{item[secondaryKey]}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}