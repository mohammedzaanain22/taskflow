'use client';
import { useState } from 'react';
import { PRIORITIES } from '@/lib/constants';
import { alertCls, btnCls, btn2Cls, cardCls, inputCls, labelCls } from '@/lib/ui';

export default function TaskForm({ initial, members, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    priority: initial?.priority || 'medium',
    dueDate: initial?.dueDate || '',
    assigneeId: initial?.assigneeId || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function validate() {
    const er = {};
    const len = form.title.trim().length;
    if (len < 3 || len > 120) er.title = 'Title is required (3–120 characters).';
    if (form.description.length > 1000) er.description = 'Description is max 1000 characters.';
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
      if (!initial) {
        setForm({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '' });
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className={`${cardCls} mt-4 flex flex-col gap-4`}>
      <h3 className="text-lg font-bold">{initial ? 'Edit task' : 'New task'}</h3>
      {formError && <p role="alert" className={alertCls}>{formError}</p>}

      <div>
        <label htmlFor="t-title" className={labelCls}>Title</label>
        <input id="t-title" className={inputCls} value={form.title} onChange={set('title')} />
        {errors.title && <p className="mt-1 text-sm text-red-700">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="t-desc" className={labelCls}>Description (optional)</label>
        <textarea id="t-desc" rows={3} className={inputCls} value={form.description} onChange={set('description')} />
        {errors.description && <p className="mt-1 text-sm text-red-700">{errors.description}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="t-priority" className={labelCls}>Priority</label>
          <select id="t-priority" className={inputCls} value={form.priority} onChange={set('priority')}>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="t-due" className={labelCls}>Due date</label>
          <input id="t-due" type="date" className={inputCls} value={form.dueDate} onChange={set('dueDate')} />
        </div>
        <div>
          <label htmlFor="t-assignee" className={labelCls}>Assignee</label>
          <select id="t-assignee" className={inputCls} value={form.assigneeId} onChange={set('assigneeId')}>
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button disabled={saving} className={btnCls}>
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className={btn2Cls}>Cancel</button>}
      </div>
    </form>
  );
}