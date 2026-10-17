import { STATUSES, priorityOf, statusOf } from '@/lib/constants';
import { formatDate, isOverdue } from '@/lib/dates';
import { btn2Cls, cardCls, dangerCls, inputCls } from '@/lib/ui';

export default function TaskList({ tasks, profiles, can, onStatus, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
        No tasks match. Create one or adjust the filters.
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {tasks.map((t) => {
        const st = statusOf(t.status);
        const pr = priorityOf(t.priority);
        const overdue = isOverdue(t);
        const assignee = t.assigneeId ? profiles[t.assigneeId]?.displayName || 'Unknown' : 'Unassigned';

        return (
          <li key={t.id} className={`${cardCls} ${overdue ? 'border-l-4 border-l-amber-700' : ''}`}>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="min-w-0 flex-1 break-words text-base font-bold">{t.title}</h4>
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                {st.icon} {st.label}
              </span>
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                {pr.icon} {pr.label} priority
              </span>
              {overdue && (
                <span className="rounded-full border border-amber-700 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  ⚠ Overdue
                </span>
              )}
            </div>

            {t.description && <p className="mt-1.5 text-sm text-slate-600">{t.description}</p>}
            <p className="mt-2 text-sm text-slate-600">Due: {formatDate(t.dueDate)} · Assignee: {assignee}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {can.status(t) && (
                <>
                  <label htmlFor={`s-${t.id}`} className="sr-only">Status for {t.title}</label>
                  <select id={`s-${t.id}`} value={t.status} onChange={(e) => onStatus(t, e.target.value)}
                    className={`${inputCls} !w-40`}>
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </>
              )}
              {can.edit(t) && <button onClick={() => onEdit(t)} className={btn2Cls}>Edit</button>}
              {can.remove(t) && <button onClick={() => onDelete(t)} className={dangerCls}>Delete</button>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}