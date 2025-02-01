'use client';

import { useContext, useEffect, useState } from "react";
import { AdminContext } from "./adminContext";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface InfoCardProps {
  title: string;
  emptyMessage: string;
  children?: React.ReactNode;
  onEdit?: () => void;
  showEdit?: boolean;
  isLoading?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  emptyMessage, 
  children, 
  onEdit, 
  showEdit,
  isLoading 
}) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {showEdit && (
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            title={isLoading ? "Loading..." : "Edit"}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        children || <p className="text-sm text-gray-500">{emptyMessage}</p>
      )}
    </div>
  </div>
);

interface InfoFieldProps {
  label: string;
  value: string | null | undefined;
  fallback?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, fallback = "No information available" }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="mt-1 text-sm text-gray-900">
      {value || fallback}
    </p>
  </div>
);

interface EditModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
  formData: {
    name: string;
    description: string;
    status: "active" | "inactive";
  };
  onChange: (field: string, value: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  title,
  isOpen,
  onClose,
  onSave,
  isLoading,
  formData,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => onChange("name", e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                disabled={isLoading}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => onChange("status", e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading || !formData.name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { selectedGroupId, selectedSessionId } = useContext(AdminContext);
  const [selectedGroup, setSelectedGroup] = useState<Schema["Group"]["type"] | null>(null);
  const [selectedSession, setSelectedSession] = useState<Schema["Session"]["type"] | null>(null);
  const [isLoading, setIsLoading] = useState({ group: false, session: false });
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive"
  });
  const [editingSession, setEditingSession] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive"
  });

  // Fetch selected group details
  useEffect(() => {
    async function fetchGroupDetails() {
      if (!selectedGroupId) {
        setSelectedGroup(null);
        return;
      }
      
      setIsLoading(prev => ({ ...prev, group: true }));
      try {
        const { data: group } = await client.models.Group.get({ id: selectedGroupId });
        if (!group) throw new Error('Group not found');
        setSelectedGroup(group);
      } catch (error) {
        console.error('Error fetching group details:', error);
        setSelectedGroup(null);
      } finally {
        setIsLoading(prev => ({ ...prev, group: false }));
      }
    }
    fetchGroupDetails();
  }, [selectedGroupId]);

  // Fetch selected session details
  useEffect(() => {
    async function fetchSessionDetails() {
      if (!selectedSessionId) {
        setSelectedSession(null);
        return;
      }

      setIsLoading(prev => ({ ...prev, session: true }));
      try {
        const { data: session } = await client.models.Session.get({ id: selectedSessionId });
        if (!session) throw new Error('Session not found');
        setSelectedSession(session);
      } catch (error) {
        console.error('Error fetching session details:', error);
        setSelectedSession(null);
      } finally {
        setIsLoading(prev => ({ ...prev, session: false }));
      }
    }
    fetchSessionDetails();
  }, [selectedSessionId]);

  const handleEditGroup = () => {
    if (selectedGroup) {
      setEditingGroup({
        name: selectedGroup.name ?? "",
        description: selectedGroup.description ?? "",
        status: selectedGroup.status as "active" | "inactive"
      });
      setIsEditGroupModalOpen(true);
    }
  };

  const handleEditSession = () => {
    if (selectedSession) {
      setEditingSession({
        name: selectedSession.name ?? "",
        description: selectedSession.description || "",
        status: selectedSession.status as "active" | "inactive"
      });
      setIsEditSessionModalOpen(true);
    }
  };

  const handleSaveGroup = async () => {
    if (!selectedGroupId) return;

    setIsLoading(prev => ({ ...prev, group: true }));
    try {
      const { data: updatedGroup } = await client.models.Group.update({
        id: selectedGroupId,
        name: editingGroup.name.trim(),
        description: editingGroup.description.trim() || undefined,
        status: editingGroup.status
      });
      if (!updatedGroup) throw new Error('Failed to update group');
      setSelectedGroup(updatedGroup);
      setIsEditGroupModalOpen(false);
    } catch (error) {
      console.error('Error updating group:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(prev => ({ ...prev, group: false }));
    }
  };

  const handleSaveSession = async () => {
    if (!selectedSessionId) return;

    setIsLoading(prev => ({ ...prev, session: true }));
    try {
      const { data: updatedSession } = await client.models.Session.update({
        id: selectedSessionId,
        name: editingSession.name.trim(),
        description: editingSession.description.trim() || undefined,
        status: editingSession.status
      });
      if (!updatedSession) throw new Error('Failed to update session');
      setSelectedSession(updatedSession);
      setIsEditSessionModalOpen(false);
    } catch (error) {
      console.error('Error updating session:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(prev => ({ ...prev, session: false }));
    }
  };

  const handleGroupChange = (field: string, value: string) => {
    setEditingGroup(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSessionChange = (field: string, value: string) => {
    setEditingSession(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Group Information */}
      <InfoCard 
        title={`${selectedGroup?selectedGroup?.name+"'s description":"No Group Selected"}`}
        emptyMessage="Select a group to view its information"
        showEdit={!!selectedGroup}
        onEdit={handleEditGroup}
        isLoading={isLoading.group}
      >
        {selectedGroup && (
          <div className="space-y-2">
            <InfoField label="" value={selectedGroup.description} />
          </div>
        )}
      </InfoCard>

      {/* Session Information */}
      <InfoCard 
        title={`${selectedSession?selectedSession?.name+"'s description":"No Session Selected"}`}
        emptyMessage="Select a session to view its information"
        showEdit={!!selectedSession}
        onEdit={handleEditSession}
        isLoading={isLoading.session}
      >
        {selectedSession && (
          <div className="space-y-2">
            <InfoField label="" value={selectedSession.description} />
          </div>
        )}
      </InfoCard>

      {/* Edit Group Modal */}
      <EditModal
        title="Edit Group"
        isOpen={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        onSave={handleSaveGroup}
        isLoading={isLoading.group}
        formData={editingGroup}
        onChange={handleGroupChange}
      />

      {/* Edit Session Modal */}
      <EditModal
        title="Edit Session"
        isOpen={isEditSessionModalOpen}
        onClose={() => setIsEditSessionModalOpen(false)}
        onSave={handleSaveSession}
        isLoading={isLoading.session}
        formData={editingSession}
        onChange={handleSessionChange}
      />
    </div>
  );
}
