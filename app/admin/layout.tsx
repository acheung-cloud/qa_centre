'use client';

import { useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Sidebar from "../components/Sidebar";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { AdminContext } from "./adminContext";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entities, setEntities] = useState<Array<Schema["Entity"]['type']>>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");

  async function listEntities() {
    const { data } = await client.models.Entity.list();
    setEntities(data);
  }

  useEffect(() => {
    listEntities();
  }, []);

  return (
    <AdminContext.Provider value={{ entities, selectedEntityId, setSelectedEntityId }}>
      <div className="flex min-h-screen flex-col lg:flex-row bg-gray-50">
        <Sidebar 
          entities={entities}
          selectedEntityId={selectedEntityId}
          onEntityChange={setSelectedEntityId}
        />
        <div className="flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
