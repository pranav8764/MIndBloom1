import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-12 shadow-xl shadow-slate-200/40">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 mb-4">
            Mental wellness made simple
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            🌱 MindBloom
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A gamified mental health tracker for journaling, challenges, and progress metrics—all designed to help you build stronger habits.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
