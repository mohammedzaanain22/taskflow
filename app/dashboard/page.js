'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectCard from '@/components/ProjectCard';
import DashboardStats from '@/components/DashboardStats';
import { useAuth } from '@/hooks/useAuth';
import { listProjects } from '@/services/projects';
import { listTasks } from '@/services/tasks';
import { errorMessage } from '@/lib/constants';
import { formatDate, isOverdue } from '@/lib/dates';
import { alertCls, btnCls, cardCls } from '@/lib/ui';

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const ps = await listProjects(user.uid);
      const all = await Promise.all(
        ps.map(async (p) => (await listTasks(p.id)).map((t) => ({ ...t, projectName: p.name })))
      );
      setProjects(ps);
      setTasks(all.flat());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const overdue = tasks.filter(isOverdue);

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/projects/new" className={btnCls}>+ New project</Link>
      </div>

      {error && (
        <p role="alert" className={`${alertCls} mt-4`}>
          {error} <button onClick={load} className="font-bold underline">Retry</button>
        </p>
      )}

      {loading ? (
        <p role="status" className="mt-6 text-slate-600">Loading dashboard…</p>
      ) : (
        <>
          <DashboardStats tasks={tasks} />

          <h2 className="mt-8 text-xl font-bold">Your projects</h2>
          {projects.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
              No projects yet. Create your first project to get started.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} isOwner={p.ownerId === user.uid} />
              ))}
            </ul>
          )}

          <h2 className="mt-8 text-xl font-bold">Overdue tasks</h2>
          {overdue.length === 0 ? (
            <p className="mt-4 text-slate-600">No overdue tasks.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {overdue.map((t) => (
                <li key={t.id} className={`${cardCls} flex flex-wrap items-center justify-between gap-2 border-l-4 border-l-amber-700`}>
                  <div>
                    <Link href={`/projects/${t.projectId}`} className="font-bold hover:text-indigo-700">{t.title}</Link>
                    <p className="text-sm text-slate-600">{t.projectName}</p>
                  </div>
                  <span className="rounded-full border border-amber-700 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    ⚠ Due {formatDate(t.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute><Dashboard /></ProtectedRoute>;
}