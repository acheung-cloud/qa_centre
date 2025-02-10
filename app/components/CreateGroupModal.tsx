'use client';

import { useState } from 'react';
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
  entityId: string;
  onGroupChange: (groupId: string) => void;
}

export default function CreateGroupModal({ 
  isOpen, 
  onClose, 
  onGroupCreated,
  entityId,
  onGroupChange
}: CreateGroupModalProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !entityId || isCreating) return;

    setIsCreating(true);
    try {
      const { data: newGroup } = await client.models.Group.create({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
        entityId: entityId,
        status: "active"
      });
      setNewGroupName('');
      setNewGroupDescription('');
      onClose();
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

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              disabled={isCreating || !newGroupName.trim() || !entityId}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
