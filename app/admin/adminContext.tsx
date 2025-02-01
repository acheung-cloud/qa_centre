'use client';

import { createContext, useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface AdminContextType {
  selectedEntityId: string;
  setSelectedEntityId: (id: string) => void;
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
  selectedQuestionId: string;
  setSelectedQuestionId: (id: string) => void;
  entities: { groups: Schema["Group"]['type'][] };
  groups: Schema["Group"]['type'][];
  sessions: Schema["Session"]['type'][];
}

export const AdminContext = createContext<AdminContextType>({
  selectedEntityId: "",
  setSelectedEntityId: () => {},
  selectedGroupId: "",
  setSelectedGroupId: () => {},
  selectedSessionId: "",
  setSelectedSessionId: () => {},
  selectedQuestionId: "",
  setSelectedQuestionId: () => {},
  entities: { groups: [] },
  groups: [],
  sessions: []
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [entities, setEntities] = useState<{ groups: Schema["Group"]['type'][] }>({ groups: [] });
  const [groups, setGroups] = useState<Schema["Group"]['type'][]>([]);
  const [sessions, setSessions] = useState<Schema["Session"]['type'][]>([]);

  // Fetch entities on mount
  useEffect(() => {
    async function fetchEntities() {
      try {
        const { data } = await client.models.Group.list({
          filter: { entityId: { attributeExists: false } }
        });
        setEntities({ groups: data });
      } catch (error) {
        console.error('Error fetching entities:', error);
        setEntities({ groups: [] });
      }
    }
    fetchEntities();
  }, []);

  // Fetch groups when entity changes
  useEffect(() => {
    async function fetchGroups() {
      if (!selectedEntityId) {
        setGroups([]);
        setSelectedGroupId("");
        return;
      }

      try {
        const { data } = await client.models.Group.list({
          filter: { entityId: { eq: selectedEntityId } }
        });
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
      }
    }
    fetchGroups();
  }, [selectedEntityId]);

  // Fetch sessions when group changes
  useEffect(() => {
    async function fetchSessions() {
      if (!selectedGroupId) {
        setSessions([]);
        setSelectedSessionId("");
        return;
      }

      try {
        const { data } = await client.models.Session.list({
          filter: { groupId: { eq: selectedGroupId } }
        });
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      }
    }
    fetchSessions();
  }, [selectedGroupId]);

  // Clear session when group changes
  useEffect(() => {
    setSelectedSessionId("");
  }, [selectedGroupId]);

  // Clear question when session changes
  useEffect(() => {
    setSelectedQuestionId("");
  }, [selectedSessionId]);

  return (
    <AdminContext.Provider value={{
      selectedEntityId,
      setSelectedEntityId,
      selectedGroupId,
      setSelectedGroupId,
      selectedSessionId,
      setSelectedSessionId,
      selectedQuestionId,
      setSelectedQuestionId,
      entities,
      groups,
      sessions
    }}>
      {children}
    </AdminContext.Provider>
  );
}
