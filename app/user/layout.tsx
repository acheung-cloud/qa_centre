'use client';

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import UserHeader from "../components/UserHeader";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs, { ssr: true });

function Header() {
  const { user, signOut } = useAuthenticator();
  return <UserHeader signOut={signOut} user={user} />;
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator>
      <div className="flex h-full bg-gray-50">
        <div className="flex flex-1 flex-col">
          <Header />
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
