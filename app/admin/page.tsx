'use client';

import { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import Button from "../components/ui/Button";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Home() {
  const [entities, setEntities] = useState<Array<Schema["Entity"]['type']>>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [groups, setGroups] = useState<Array<Schema["Group"]['type']>>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  async function listEntities() {
    const { data } = await client.models.Entity.list();
    setEntities(data);
  }

  async function fetchGroups(entityId: string) {
    if (!entityId) {
      setGroups([]);
      return;
    }
    try {
      console.log('Fetching groups for entity:', entityId);
      const {data: entity} = await client.models.Entity.get({ id: entityId });
      console.log('Found entity:', entity);
      if (!entity) {
        console.error('Entity not found');
        setGroups([]);
        return;
      }
      const {data: groupsData} = await entity.groups();
      console.log('Found groups:', groupsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  }

  async function createGroup() {
    if (!selectedEntityId) return;
    
    try {
      await client.models.Group.create({
        ...newGroup,
        entityId: selectedEntityId,
        createdBy: "TestUser",
        modifiedBy: "TestUser"
      });
      
      // Reset form and close modal
      setNewGroup({
        name: "",
        description: "",
        status: "active" as "active" | "inactive",
      });
      setIsCreateGroupModalOpen(false);
      
      // Refresh groups list
      await fetchGroups(selectedEntityId);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  }

  async function createEntity() {
    await client.models.Entity.create({
      name: "TestEntityName",
      createdBy: "TestCreatedBy",
      modifiedBy: "TestCreatedBy",
      status: "active"
    });
    listEntities();
  }

  async function deleteEntity(id: string) {
    await client.models.Entity.delete({ id });
    listEntities();
  }

  useEffect(() => {
    listEntities();
  }, []);

  useEffect(() => {
    setSelectedGroupId("");
    fetchGroups(selectedEntityId);
  }, [selectedEntityId]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Entities</h1>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button onClick={createEntity}>Add Entity</Button>
          </div>
        </div>

        {/* Entity and Group Selection */}
        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="entity-select" className="block text-sm font-medium text-gray-700">
              Select Entity
            </label>
            <select
              id="entity-select"
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select an entity...</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">
                Select Group
              </label>
              <select
                id="group-select"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                disabled={!selectedEntityId}
              >
                <option value="">Select a group...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => setIsCreateGroupModalOpen(true)}
              disabled={!selectedEntityId}
            >
              Add Group
            </Button>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created By
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entities.map((entity) => (
                    <tr key={entity.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {entity.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {entity.createdBy}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteEntity(entity.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Group Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={newGroup.status}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, status: e.target.value as "active" | "inactive" }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsCreateGroupModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createGroup}
                disabled={!newGroup.name}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
