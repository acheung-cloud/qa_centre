'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Entities', href: '/' },
  { name: 'Groups', href: '/groups' },
  { name: 'Questions', href: '/questions' },
  { name: 'Sessions', href: '/sessions' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white tracking-tight">QA Centre</h1>
      </div>
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul className="flex flex-1 flex-col gap-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
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
  );
}
