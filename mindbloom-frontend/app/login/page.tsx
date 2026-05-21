'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Login to your account
          </h1>
        </div>
        <SignIn fallbackRedirectUrl="/dashboard" routing="hash" />
      </div>
    </div>
  );
}
