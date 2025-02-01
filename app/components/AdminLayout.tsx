'use client';

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import AdminHeader from "./AdminHeader";

function CallHeader() {
  const { user, signOut } = useAuthenticator();
  return <AdminHeader signOut={signOut} user={user} />;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator>
      <div className="flex h-full bg-gray-50">
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
