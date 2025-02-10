'use client';

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import AdminHeader from "./AdminHeader";
import { useContext, useState, useEffect } from "react";
import { AdminContext } from "../admin/adminContext";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import Sidebar from "./Sidebar";

const client = generateClient<Schema>();

function CallHeader() {
  const { user, signOut } = useAuthenticator();
  const { entities, selectedEntityId, setSelectedEntityId } = useContext(AdminContext);
  return (
    <AdminHeader 
      signOut={signOut} 
      user={user} 
      entities={entities}
      selectedEntityId={selectedEntityId}
      onEntityChange={setSelectedEntityId}
    />
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { 
    selectedSessionId,
    selectedEntityId,
    entities,
    groups,
    sessions,
    setSelectedEntityId,
    setSelectedGroupId,
    setSelectedSessionId,
    selectedGroupId,
    selectedQuestionId,
    setSelectedQuestionId
  } = useContext(AdminContext);
  const [questions, setQuestions] = useState<Array<Schema["Question"]["type"]>>([]);

  // Fetch questions for selected session
  useEffect(() => {
    async function fetchQuestions() {
      if (!selectedSessionId) {
        setQuestions([]);
        return;
      }

      try {
        const { data } = await client.models.Question.list({
          filter: { sessionId: { eq: selectedSessionId } }
        });
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions([]);
      }
    }
    fetchQuestions();
  }, [selectedSessionId]);

  return (
    <Authenticator>
      <div className="flex h-full bg-gray-50">
        <Sidebar
          entities={entities}
          selectedEntityId={selectedEntityId}
          onEntityChange={setSelectedEntityId}
          groups={groups}
          selectedGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId}
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSessionChange={setSelectedSessionId}
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          onQuestionClick={setSelectedQuestionId}
          onQuestionCreated={async () => {
            if (selectedSessionId) {
              try {
                const { data } = await client.models.Question.list({
                  filter: { sessionId: { eq: selectedSessionId } }
                });
                setQuestions(data);
              } catch (error) {
                console.error('Error fetching questions:', error);
                setQuestions([]);
              }
            }
          }}
        />
        <div className="flex flex-1 flex-col">
          <CallHeader />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Authenticator>
  );
}
