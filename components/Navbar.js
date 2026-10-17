'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login' || pathname === '/register') return null;

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-10">
      <Link href={user ? '/dashboard' : '/login'} className="flex items-center gap-2 text-lg font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">✓</span>
        TaskFlow
      </Link>

      {user && (
        <nav aria-label="Main" className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/dashboard" className="font-bold text-indigo-700">Dashboard</Link>
          <span className="max-w-[10rem] truncate text-slate-600">{user.displayName || user.email}</span>
          <button onClick={handleLogout}
            className="rounded-lg border-2 border-indigo-600 bg-white px-4 py-2 font-bold text-indigo-700 hover:bg-indigo-50">
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}