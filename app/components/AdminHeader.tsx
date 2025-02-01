'use client';

import { AuthUser } from '@aws-amplify/auth';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import type { Schema } from "@/amplify/data/resource";

interface HeaderProps {
  signOut?: () => void;
  user?: AuthUser;
  entities?: Array<Schema["Entity"]['type']>;
  selectedEntityId: string;
  onEntityChange: (entityId: string) => void;
}

export default function AdminHeader({ signOut, user, entities = [], selectedEntityId, onEntityChange }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm">
      <div className="flex items-center gap-x-4">
        <h2 className="text-lg font-medium text-gray-800">
          Welcome, <span className="font-semibold text-blue-600">{user?.signInDetails?.loginId}</span>
        </h2>
      </div>
      <div className="flex items-center gap-x-4">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 rounded-full bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                <div className="font-medium truncate">{user?.signInDetails?.loginId}</div>
              </div>
              <div className="px-4 py-2 border-b border-gray-200">
                <label htmlFor="entity-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Entity
                </label>
                <select
                  id="entity-select"
                  value={selectedEntityId}
                  onChange={(e) => onEntityChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  {entities?.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
              </div>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={signOut}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 101.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z" clipRule="evenodd" />
                    </svg>
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
