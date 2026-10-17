'use client';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-8">Loading…</p>;

  return (
    <h1 className="p-8 text-3xl font-bold text-blue-600">
      {user ? `Hello ${user.displayName}` : 'Not logged in'}
    </h1>
  );
}