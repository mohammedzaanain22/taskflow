'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { addMemberByEmail, deleteProject, getProject, removeMember, updateProject } from '@/services/projects';
import { getProfiles } from '@/services/users';
import { errorMessage } from '@/lib/constants';
import { alertCls, btnCls, cardCls, dangerCls, inputCls, labelCls, successCls } from '@/lib/ui';
import { withTimeout } from '@/lib/async';

function Settings() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [state, setState] = useState('loading');
  const [project, setProject] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [form, setForm] = useState({ name: '', description: '' });
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await getProject(id);
      if (!p) return setState('notfound');
      setProject(p);
      setForm({ name: p.name, description: p.description || '' });
      setProfiles(await getProfiles(p.memberIds));
      setState('ready');
    } catch (e) {
      setState('denied');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function act(fn, okText) {
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
     await withTimeout(fn());
      setMsg({ type: 'ok', text: okText });
      await load();
    } catch (e) {
      setMsg({ type: 'err', text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  function save(e) {
    e.preventDefault();
    const len = form.name.trim().length;
    if (len < 3 || len > 80) return setMsg({ type: 'err', text: 'Project name must be 3–80 characters.' });
    if (form.description.length > 1000) return setMsg({ type: 'err', text: 'Description is max 1000 characters.' });
    act(() => updateProject(project, form), 'Project updated.');
  }

  function add(e) {
    e.preventDefault();
    if (!email.trim()) return setMsg({ type: 'err', text: 'Enter an email address.' });
    act(async () => { await addMemberByEmail(project, email); setEmail(''); }, 'Member added.');
  }

  function remove(uid) {
    if (window.confirm('Remove this member? Their tasks will be unassigned.'))
      act(() => removeMember(project, uid), 'Member removed.');
  }

  async function del() {
    if (!window.confirm(`Delete "${project.name}" and ALL its tasks? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteProject(id);
      router.replace('/dashboard');
    } catch (e) {
      setMsg({ type: 'err', text: errorMessage(e) });
      setBusy(false);
    }
  }

  const back = <Link href="/dashboard" className="font-bold text-indigo-700">Back</Link>;
  if (state === 'loading') return <p role="status" className="p-8 text-center text-slate-600">Loading…</p>;
  if (state === 'notfound') return <p className="p-8 text-center">Project not found. {back}</p>;
  if (state === 'denied' || project.ownerId !== user.uid)
    return <p className="p-8 text-center">Access denied: only the project owner can open settings. {back}</p>;

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-10">
      <Link href={`/projects/${id}`} className="text-sm font-bold text-indigo-700">← Back to project</Link>
      <h1 className="mt-2 text-3xl font-bold">Project settings</h1>

      {msg.text && (
        <p role={msg.type === 'ok' ? 'status' : 'alert'}
          className={`${msg.type === 'ok' ? successCls : alertCls} mt-4`}>{msg.text}</p>
      )}

      <form onSubmit={save} noValidate className={`${cardCls} mt-6 flex flex-col gap-4`}>
        <h2 className="text-xl font-bold">Details</h2>
        <div>
          <label htmlFor="s-name" className={labelCls}>Project name</label>
          <input id="s-name" className={inputCls} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="s-desc" className={labelCls}>Description</label>
          <textarea id="s-desc" rows={3} className={inputCls} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div><button disabled={busy} className={btnCls}>Save changes</button></div>
      </form>

      <section className={`${cardCls} mt-4`}>
        <h2 className="text-xl font-bold">Members</h2>
        <ul className="mt-3 divide-y divide-slate-200">
          {project.memberIds.map((uid) => (
            <li key={uid} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                {profiles[uid]?.displayName || uid}{' '}
                <span className="text-sm text-slate-600">{profiles[uid]?.email}</span>
                {uid === project.ownerId && <b className="ml-2 text-sm">(Owner)</b>}
              </span>
              {uid !== project.ownerId && (
                <button disabled={busy} onClick={() => remove(uid)} className={dangerCls}>Remove</button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={add} noValidate className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="m-email" className={labelCls}>Add member by email</label>
            <input id="m-email" type="email" className={inputCls} value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="member@example.test" />
          </div>
          <button disabled={busy} className={btnCls}>Add</button>
        </form>
      </section>

      <section className="mt-4 rounded-xl border border-red-700 bg-white p-5">
        <h2 className="text-xl font-bold">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-600">Deleting the project also deletes all of its tasks.</p>
        <button disabled={busy} onClick={del} className={`${dangerCls} mt-3`}>Delete project</button>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return <ProtectedRoute><Settings /></ProtectedRoute>;
}