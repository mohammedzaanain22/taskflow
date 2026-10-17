import { isOverdue } from '@/lib/dates';
import { cardCls } from '@/lib/ui';

export default function DashboardStats({ tasks }) {
  const count = (s) => tasks.filter((t) => t.status === s).length;
  const overdue = tasks.filter(isOverdue).length;

  const items = [
    ['Total tasks', tasks.length, ''],
    ['○ To Do', count('todo'), ''],
    ['◐ In Progress', count('in_progress'), ''],
    ['● Done', count('done'), ''],
    ['⚠ Overdue', overdue, 'border-amber-700 bg-amber-50 text-amber-800'],
  ];

  return (
    <ul aria-label="Task summary" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map(([label, n, extra]) => (
        <li key={label} className={`${cardCls} ${extra}`}>
          <p className="text-3xl font-bold">{n}</p>
          <p className="text-sm text-slate-600">{label}</p>
        </li>
      ))}
    </ul>
  );
}