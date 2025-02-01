'use client';

import { usePathname } from 'next/navigation';
import type { Schema } from "@/amplify/data/resource";
import { useState } from 'react';
import { generateClient } from "aws-amplify/api";

const client = generateClient<Schema>();

interface SidebarProps {
  entities: { groups: Schema["Group"]['type'][] };
  selectedEntityId: string;
  onEntityChange: (entityId: string) => void;
  groups: Array<Schema["Group"]['type']>;
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
  sessions: Array<Schema["Session"]['type']>;
  selectedSessionId: string;
  onSessionChange: (sessionId: string) => void;
  onEntityCreated?: () => void;
  onGroupCreated?: () => void;
  onSessionCreated?: () => void;
}

export default function Sidebar({ 
  entities,
  selectedEntityId,
  onEntityChange,
  groups,
  selectedGroupId,
  onGroupChange,
  sessions,
  selectedSessionId,
  onSessionChange,
  onEntityCreated,
  onGroupCreated,
  onSessionCreated
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !selectedEntityId || isCreating) return;

    setIsCreating(true);
    try {
      const { data: newGroup } = await client.models.Group.create({
        name: newGroupName.trim(),
        entityId: selectedEntityId,
        description: newGroupDescription.trim() || undefined
      });
      setNewGroupName('');
      setNewGroupDescription('');
      setIsCreateGroupModalOpen(false);
      onGroupCreated?.();
      if (newGroup) {
        onGroupChange(newGroup.id); // Auto-select the new group
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim() || !selectedGroupId || isCreating) return;

    setIsCreating(true);
    try {
      const { data: newSession } = await client.models.Session.create({
        name: newSessionName.trim(),
        groupId: selectedGroupId,
        description: newSessionDescription.trim() || undefined
      });
      setNewSessionName('');
      setNewSessionDescription('');
      setIsCreateSessionModalOpen(false);
      onSessionCreated?.();
      if (newSession) {
        onSessionChange(newSession.id); // Auto-select the new session
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
    }
  };

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

      {/* Create Group Modal */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <form onSubmit={handleCreateGroup}>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Group</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isCreating}
                  />
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter group description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    disabled={isCreating}
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  disabled={isCreating || !newGroupName.trim() || !selectedEntityId}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {isCreateSessionModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <form onSubmit={handleCreateSession}>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Session</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Enter session name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isCreating}
                  />
                  <textarea
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    placeholder="Enter session description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    disabled={isCreating}
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setIsCreateSessionModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  disabled={isCreating || !newSessionName.trim() || !selectedGroupId}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 transform bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center px-4 py-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white tracking-tight">QA Centre</h1>
        </div>

        {/* Group Selection */}
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="group-select" className="block text-sm font-medium text-gray-300">
              Select Group
            </label>
            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="text-sm text-gray-300 hover:text-white"
              disabled={!selectedEntityId}
            >
              + New
            </button>
          </div>
          <select
            id="group-select"
            value={selectedGroupId}
            onChange={(e) => {
              onGroupChange(e.target.value);
              setIsOpen(false);
            }}
            className="block w-full rounded-md border-gray-600 bg-gray-700 text-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={!selectedEntityId}
          >
            {groups.length === 0 ? (
              <option value="" disabled>No Group yet</option>
            ) : (
              groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Session Selection */}
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="session-select" className="block text-sm font-medium text-gray-300">
              Select Session
            </label>
            <button
              onClick={() => setIsCreateSessionModalOpen(true)}
              className="text-sm text-gray-300 hover:text-white"
              disabled={!selectedGroupId}
            >
              + New
            </button>
          </div>
          <select
            id="session-select"
            value={selectedSessionId}
            onChange={(e) => {
              onSessionChange(e.target.value);
              setIsOpen(false);
            }}
            className="block w-full rounded-md border-gray-600 bg-gray-700 text-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={!selectedGroupId}
          >
            {sessions.length === 0 ? (
              <option value="" disabled>No session yet</option>
            ) : (
              sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Main content area */}
        <div className="flex-1 px-4 py-6">
          {/* Add any additional content here */}
        </div>
      </div>
    </>
  );
}
