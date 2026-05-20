'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/stores/authStore';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { getMe } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    getMe().catch(() => {
      // User not found in system, will be created on first action
    });
  }, [isSignedIn, isLoaded, router, getMe]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
