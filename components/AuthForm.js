'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authError(e) {
  const c = e?.code || '';
  if (c.includes('email-already-in-use')) return 'This email is already registered.';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found'))
    return 'Incorrect email or password.';
  if (c.includes('network')) return 'Network problem. Please try again.';
  return 'Something went wrong. Please try again.';
}

const input =
  'w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { user, loading, login, register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function validate() {
    const er = {};
    if (isRegister && form.name.trim().length < 2) er.name = 'Please enter your name (min 2 characters).';
    if (!EMAIL_RE.test(form.email)) er.email = 'Please enter a valid email address.';
    if (form.password.length < 8) er.password = 'Password must be at least 8 characters.';
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSaving(true);
    try {
      if (isRegister) await register(form.name.trim(), form.email.trim(), form.password);
      else await login(form.email.trim(), form.password);
      router.push('/dashboard');
    } catch (err) {
      setFormError(authError(err));
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Brand panel */}
      <div className="flex flex-1 flex-col justify-between bg-slate-900 p-8 text-white md:p-16">
        <p className="text-lg font-bold">TaskFlow</p>
        <div className="my-10">
          <h1 className="max-w-md text-4xl font-bold leading-tight md:text-5xl">
            Plan the work. Ship it together.
          </h1>
          <p className="mt-4 max-w-sm text-slate-300">
            Projects, tasks and deadlines for small software teams.
          </p>
        </div>
        <p className="hidden gap-6 text-sm text-slate-300 md:flex">
          <span>○ To Do</span><span>◐ In Progress</span><span>● Done</span>
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <form onSubmit={onSubmit} noValidate
          className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold">{isRegister ? 'Create account' : 'Log in'}</h2>

          {formError && (
            <p role="alert" className="rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900">
              {formError}
            </p>
          )}

          {isRegister && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-bold">Name</label>
              <input id="name" className={input} value={form.name} onChange={set('name')} autoComplete="name" />
              {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name}</p>}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold">Email</label>
            <input id="email" type="email" className={input} value={form.email}
              onChange={set('email')} autoComplete="email" />
            {errors.email && <p className="mt-1 text-sm text-red-700">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold">Password</label>
            <input id="password" type="password" className={input} value={form.password}
              onChange={set('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} />
            {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password}</p>}
          </div>

          <button disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-800 disabled:opacity-60">
            {saving ? 'Please wait…' : isRegister ? 'Register' : 'Log in'}
          </button>

          <p className="text-sm text-slate-600">
            {isRegister ? (
              <>Already have an account? <Link href="/login" className="font-bold text-indigo-700">Log in</Link></>
            ) : (
              <>New here? <Link href="/register" className="font-bold text-indigo-700">Create an account</Link></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}