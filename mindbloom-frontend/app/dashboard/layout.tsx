'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { getMe } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    getMe().catch(() => {
      // User not found in system, will be created on first action
    });
  }, [isSignedIn, isLoaded, router, getMe]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
