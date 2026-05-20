import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">🌱 MindBloom</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your personal mental health wellness companion
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
