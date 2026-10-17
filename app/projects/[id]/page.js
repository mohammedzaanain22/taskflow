'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import FilterBar from '@/components/FilterBar';
import { useAuth } from '@/hooks/useAuth';
import { getProject } from '@/services/projects';
import { getProfiles } from '@/services/users';
import { createTask, deleteTask, listTasks, setTaskStatus, updateTask } from '@/services/tasks';
import { canChangeStatus, canDeleteTask, canEditTask, isOwner } from '@/lib/permissions';
import { isOverdue } from '@/lib/dates';
import { errorMessage } from '@/lib/constants';
import { alertCls, btnCls, btn2Cls } from '@/lib/ui';

function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [state, setState] = useState('loading'); // loading | ready | notfound | denied | error
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all', assignee: 'all' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    try {
      const p = await getProject(id);
      if (!p) return setState('notfound');
      const [t, pr] = await Promise.all([listTasks(id), getProfiles(p.memberIds)]);
      setProject(p);
      setTasks(t);
      setProfiles(pr);
      setState('ready');
    } catch (e) {
      setState(e?.code === 'permission-denied' ? 'denied' : 'error');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const members = useMemo(
    () => (project ? project.memberIds.map((m) => profiles[m]).filter(Boolean) : []),
    [project, profiles]
  );

  const visible = useMemo(() => tasks.filter((t) => {
    if (filters.search && !t.title.toLowerCase().includes(filters.search.trim().toLowerCase())) return false;
    if (filters.status === 'overdue' && !isOverdue(t)) return false;
    if (!['all', 'overdue'].includes(filters.status) && t.status !== filters.status) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.assignee === 'none' && t.assigneeId) return false;
    if (!['all', 'none'].includes(filters.assignee) && t.assigneeId !== filters.assignee) return false;
    return true;
  }), [tasks, filters]);

  // ننفذ العملية ثم نعيد التحميل. عند الفشل نعرض الخطأ ونعيد رميه ليبقى الفورم مفتوحاً
  async function run(fn) {
    setActionError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setActionError(errorMessage(e));
      throw e;
    }
  }

  const handleCreate = async (data) => { await run(() => createTask(id, user.uid, data)); setShowForm(false); };
  const handleUpdate = async (data) => { await run(() => updateTask(id, editing, data)); setEditing(null); };
  const handleStatus = (t, status) => run(() => setTaskStatus(id, t, status)).catch(() => {});
  const handleDelete = (t) => {
    if (window.confirm(`Delete task "${t.title}"?`)) run(() => deleteTask(id, t.id)).catch(() => {});
  };

  const back = <Link href="/dashboard" className="font-bold text-indigo-700">Back to dashboard</Link>;
  if (state === 'loading') return <p role="status" className="p-8 text-center text-slate-600">Loading project…</p>;
  if (state === 'notfound') return <p className="p-8 text-center">Project not found. {back}</p>;
  if (state === 'denied') return <p className="p-8 text-center">Access denied: you are not a member of this project. {back}</p>;
  if (state === 'error') return <p role="alert" className="p-8 text-center">Failed to load the project. <button onClick={load} className="font-bold underline">Retry</button></p>;

  const can = {
    status: (t) => canChangeStatus(project, t, user.uid),
    edit: (t) => canEditTask(project, t, user.uid),
    remove: (t) => canDeleteTask(project, t, user.uid),
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-10">
      <Link href="/dashboard" className="text-sm font-bold text-indigo-700">← Dashboard</Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && <p className="mt-1 text-slate-600">{project.description}</p>}
          <p className="mt-3 text-sm text-slate-600">
            Members: {members.map((m) => m.displayName).join(', ')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className={btnCls} onClick={() => { setShowForm(true); setEditing(null); }}>+ New task</button>
          {isOwner(project, user.uid) && (
            <Link href={`/projects/${id}/settings`} className={btn2Cls}>Settings</Link>
          )}
        </div>
      </div>

      {actionError && <p role="alert" className={`${alertCls} mt-4`}>{actionError}</p>}

      {showForm && <TaskForm members={members} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {editing && <TaskForm key={editing.id} initial={editing} members={members}
        onSubmit={handleUpdate} onCancel={() => setEditing(null)} />}

      <FilterBar filters={filters} onChange={setFilters} members={members} />
      <TaskList tasks={visible} profiles={profiles} can={can}
        onStatus={handleStatus}
        onEdit={(t) => { setEditing(t); setShowForm(false); }}
        onDelete={handleDelete} />
    </div>
  );
}

export default function ProjectPage() {
  return <ProtectedRoute><ProjectDetails /></ProtectedRoute>;
}