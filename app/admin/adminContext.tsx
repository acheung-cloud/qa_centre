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
  entities: Array<Schema["Entity"]['type']>;
  groups: Array<Schema["Group"]['type']>;
  sessions: Array<Schema["Session"]['type']>;
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
  entities: [],
  groups: [],
  sessions: []
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [entities, setEntities] = useState<Array<Schema["Entity"]['type']>>([]);
  const [groups, setGroups] = useState<Array<Schema["Group"]['type']>>([]);
  const [sessions, setSessions] = useState<Array<Schema["Session"]['type']>>([]);

  // Fetch entities on mount
  useEffect(() => {
    async function fetchEntities() {
      try {
        const { data } = await client.models.Entity.list();
        setEntities(data);
      } catch (error) {
        console.error('Error fetching entities:', error);
        setEntities([]);
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
