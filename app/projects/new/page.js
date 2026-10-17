'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { createProject } from '@/services/projects';

const input =
  'w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600';

function NewProject() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');

    const er = {};
    const len = form.name.trim().length;
    if (len < 3 || len > 80) er.name = 'Project name is required (3–80 characters).';
    if (form.description.length > 1000) er.description = 'Description is max 1000 characters.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setSaving(true);
    try {
      const id = await createProject(user.uid, form);
      router.push(`/projects/${id}`);
    } catch (err) {
      setFormError('Could not create the project. Please try again.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate
      className="mx-auto mt-8 flex max-w-lg flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">New project</h1>

      {formError && (
        <p role="alert" className="rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900">{formError}</p>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-bold">Project name</label>
        <input id="name" className={input} value={form.name} onChange={set('name')} />
        {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="desc" className="mb-1.5 block text-sm font-bold">Description (optional)</label>
        <textarea id="desc" rows={4} className={input} value={form.description} onChange={set('description')} />
        {errors.description && <p className="mt-1 text-sm text-red-700">{errors.description}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <button disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-800 disabled:opacity-60">
          {saving ? 'Creating…' : 'Create project'}
        </button>
        <Link href="/dashboard"
          className="rounded-lg border-2 border-indigo-600 px-5 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function NewProjectPage() {
  return <ProtectedRoute><NewProject /></ProtectedRoute>;
}