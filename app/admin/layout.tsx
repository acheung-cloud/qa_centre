'use client';

import { useEffect, useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import AdminHeader from "../components/AdminHeader";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { AdminContext } from "./adminContext";
import AdminLayout from "../components/AdminLayout";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entities, setEntities] = useState<Array<Schema["Entity"]['type']>>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [groups, setGroups] = useState<Array<Schema["Group"]['type']>>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [sessions, setSessions] = useState<Array<Schema["Session"]['type']>>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");

  async function listEntities() {
    const { data } = await client.models.Entity.list();
    setEntities(data);
    // Automatically select the first entity if there is one and no entity is currently selected
    if (data.length > 0 && !selectedEntityId) {
      setSelectedEntityId(data[0].id);
    }
  }

  async function fetchGroups(entityId: string) {
    if (!entityId) {
      setGroups([]);
      return;
    }
    try {
      console.log('Fetching groups for entity:', entityId);
      const { data: entity } = await client.models.Entity.get({ id: entityId });
      console.log('Found entity:', entity);
      if (!entity) {
        console.error('Entity not found');
        setGroups([]);
        return;
      }
      const { data: groupsData } = await entity.groups();
      console.log('Found groups:', groupsData);
      setGroups(groupsData);
      // Automatically select the first group if there is one and no group is currently selected
      if (groupsData.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groupsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  }

  async function fetchSessions(groupId: string) {
    if (!groupId) {
      setSessions([]);
      return;
    }
    try {
      console.log('Fetching sessions for group:', groupId);
      const { data: group } = await client.models.Group.get({ id: groupId });
      console.log('Found group:', group);
      if (!group) {
        console.error('Group not found');
        setSessions([]);
        return;
      }
      const { data: sessionsData } = await group.sessions();
      console.log('Found sessions:', sessionsData);
      setSessions(sessionsData);
      // Automatically select the first session if there is one and no session is currently selected
      if (sessionsData.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    }
  }

  useEffect(() => {
    listEntities();
  }, []);

  useEffect(() => {
    if (selectedEntityId) {
      fetchGroups(selectedEntityId);
    }
  }, [selectedEntityId]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchSessions(selectedGroupId);
    }
  }, [selectedGroupId]);

  const handleGroupCreated = () => {
    fetchGroups(selectedEntityId);
  };

  const handleSessionCreated = () => {
    fetchSessions(selectedGroupId);
  };

  const handleEntityChange = (entityId: string) => {
    setSelectedEntityId(entityId);
  };

  // Clear selections when parent items change
  useEffect(() => {
    setSelectedGroupId("");
    setSelectedSessionId("");
    setSelectedQuestionId("");
  }, [selectedEntityId]);

  useEffect(() => {
    setSelectedSessionId("");
    setSelectedQuestionId("");
  }, [selectedGroupId]);

  useEffect(() => {
    setSelectedQuestionId("");
  }, [selectedSessionId]);

  return (
    <AdminContext.Provider value={{
      entities,
      selectedEntityId,
      setSelectedEntityId,
      groups,
      selectedGroupId,
      setSelectedGroupId,
      sessions,
      selectedSessionId,
      setSelectedSessionId,
      selectedQuestionId,
      setSelectedQuestionId
    }}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminContext.Provider>
  );
}
