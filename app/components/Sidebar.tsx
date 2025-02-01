'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Schema } from "@/amplify/data/resource";
import { useState } from 'react';

const navigation = [
  { name: 'Entities', href: '/' },
  { name: 'Groups', href: '/groups' },
  { name: 'Questions', href: '/questions' },
  { name: 'Sessions', href: '/sessions' },
];

interface SidebarProps {
  entities: Array<Schema["Entity"]['type']>;
  selectedEntityId: string;
  onEntityChange: (entityId: string) => void;
}

export default function Sidebar({ entities, selectedEntityId, onEntityChange }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 transform bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white tracking-tight">QA Centre</h1>
        </div>
        <div className="px-4 py-4 border-b border-gray-700">
          <label htmlFor="entity-select" className="block text-sm font-medium text-gray-300 mb-2">
            Select Entity
          </label>
          <select
            id="entity-select"
            value={selectedEntityId}
            onChange={(e) => {
              onEntityChange(e.target.value);
              setIsOpen(false);
            }}
            className="block w-full rounded-md border-gray-600 bg-gray-700 text-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">Select an entity...</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>
        <nav className="flex flex-1 flex-col px-4 py-6">
          <ul className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
