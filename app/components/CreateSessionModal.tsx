'use client';

import { useState } from 'react';
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated?: () => void;
  groupId: string;
  onSessionChange: (sessionId: string) => void;
}

export default function CreateSessionModal({ 
  isOpen, 
  onClose, 
  onSessionCreated,
  groupId,
  onSessionChange
}: CreateSessionModalProps) {
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim() || !groupId || isCreating) return;

    setIsCreating(true);
    try {
      const { data: newSession } = await client.models.Session.create({
        name: newSessionName.trim(),
        description: newSessionDescription.trim() || undefined,
        groupId: groupId,
        status: "active"
      });
      setNewSessionName('');
      setNewSessionDescription('');
      onClose();
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

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              disabled={isCreating || !newSessionName.trim() || !groupId}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
