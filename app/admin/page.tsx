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
  const [entities, setEntities] = useState<any[]>([]);

  async function listEntities() {
    const { data } = await client.models.Entity.list();
    setEntities(data);
  }

  useEffect(() => {
    listEntities();
  }, []);

  async function createEntity() {
    await client.models.Entity.create({
      entityName: "TestEntityName",
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Entities</h1>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              onClick={createEntity}
            >
              Add Entity
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
                        {entity.entityName}
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
    </div>
  );
}
