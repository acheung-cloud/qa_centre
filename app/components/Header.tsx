'use client';

import { AuthUser } from '@aws-amplify/auth';
import Button from './ui/Button';

interface HeaderProps {
  signOut?: () => void;
  user?: AuthUser;
}

export default function Header({ signOut, user }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm">
      <div className="flex items-center gap-x-4">
        <h2 className="text-lg font-medium text-gray-800">
          Welcome, <span className="font-semibold text-blue-600">{user?.signInDetails?.loginId}</span>
        </h2>
      </div>
      <div className="flex items-center gap-x-4">
        <Button
          variant="secondary"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
