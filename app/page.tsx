'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Add logic to check user role and redirect accordingly
    // For now, redirect to user dashboard by default
    router.push('/user');
  }, [router]);

  return null; // No need to render anything as we're redirecting
}
