'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';

export default function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="font-bold text-2xl text-blue-600">
            🌱 MindBloom
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
              Dashboard
            </Link>
            <Link href="/journal" className="text-gray-700 hover:text-blue-600 transition">
              Journal
            </Link>
            <Link href="/achievements" className="text-gray-700 hover:text-blue-600 transition">
              Achievements
            </Link>
            <Link href="/challenges" className="text-gray-700 hover:text-blue-600 transition">
              Challenges
            </Link>
            <Link href="/habits" className="text-gray-700 hover:text-blue-600 transition">
              Habits
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
            </span>
            <UserButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
