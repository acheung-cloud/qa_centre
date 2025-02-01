'use client';

import { createContext, useContext } from 'react';
import type { Schema } from "@/amplify/data/resource";

interface AdminContextType {
  entities: Array<Schema["Entity"]['type']>;
  selectedEntityId: string;
  setSelectedEntityId: (id: string) => void;
  groups: Array<Schema["Group"]['type']>;
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
}

export const AdminContext = createContext<AdminContextType>({
  entities: [],
  selectedEntityId: "",
  setSelectedEntityId: () => {},
  groups: [],
  selectedGroupId: "",
  setSelectedGroupId: () => {},
});

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminContext.Provider');
  }
  return context;
}
