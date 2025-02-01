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
}

const InfoCard: React.FC<InfoCardProps> = ({ title, emptyMessage, children }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-4 py-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children || <p className="text-sm text-gray-500">{emptyMessage}</p>}
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

export default function Home() {
  const { selectedGroupId, selectedSessionId } = useContext(AdminContext);
  const [selectedGroup, setSelectedGroup] = useState<Schema["Group"]["type"] | null>(null);
  const [selectedSession, setSelectedSession] = useState<Schema["Session"]["type"] | null>(null);
  const [isLoading, setIsLoading] = useState({ group: false, session: false });

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

  return (
    <div className="space-y-8">
      {/* Group Information */}
      <InfoCard 
        title={`Group: ${selectedGroup?selectedGroup?.name:"..."}`}
        emptyMessage="Select a group to view its information"
      >
        {selectedGroup && (
          <div className="space-y-4">
            <InfoField label="Description" value={selectedGroup.description} /> 
          </div>
        )}
      </InfoCard>

      {/* Session Information */}
      <InfoCard 
        title={`Session: ${selectedSession?selectedSession?.name:"..."}`}
        emptyMessage="Select a session to view its information"
      >
        {selectedSession && (
          <div className="space-y-4">
            <InfoField label="Description" value={selectedSession.description} />
          </div>
        )}
      </InfoCard>
    </div>
  );
}
