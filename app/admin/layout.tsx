'use client';

import { useEffect, useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import Sidebar from "../components/Sidebar";
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
      // Automatically select the first group if there is one
      if (groupsData.length > 0) {
        setSelectedGroupId(groupsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  }

  useEffect(() => {
    listEntities();
  }, []);

  useEffect(() => {
    setSelectedGroupId("");
    fetchGroups(selectedEntityId);
  }, [selectedEntityId]);

  const handleGroupCreated = () => {
    fetchGroups(selectedEntityId);
  };

  const handleEntityChange = (entityId: string) => {
    setSelectedEntityId(entityId);
  };

  return (
    <AdminContext.Provider value={{
      entities,
      selectedEntityId,
      setSelectedEntityId,
      groups,
      selectedGroupId,
      setSelectedGroupId
    }}>
      <AdminLayout>
        <div className="flex h-full">
          <Sidebar
            entities={entities}
            selectedEntityId={selectedEntityId}
            onEntityChange={handleEntityChange}
            groups={groups}
            selectedGroupId={selectedGroupId}
            onGroupChange={setSelectedGroupId}
            onEntityCreated={listEntities}
            onGroupCreated={() => fetchGroups(selectedEntityId)}
          />
          <div className="flex-1">

            <main className="p-8">
              {children}
            </main>
          </div>
        </div>
      </AdminLayout>
    </AdminContext.Provider>
  );
}
