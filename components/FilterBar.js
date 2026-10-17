import { PRIORITIES, STATUSES } from '@/lib/constants';
import { cardCls, inputCls, labelCls } from '@/lib/ui';

export default function FilterBar({ filters, onChange, members }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div role="search" aria-label="Filter tasks"
      className={`${cardCls} mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
      <div>
        <label htmlFor="f-search" className={labelCls}>Search title</label>
        <input id="f-search" type="search" placeholder="Search tasks" className={inputCls}
          value={filters.search} onChange={set('search')} />
      </div>
      <div>
        <label htmlFor="f-status" className={labelCls}>Status</label>
        <select id="f-status" className={inputCls} value={filters.status} onChange={set('status')}>
          <option value="all">All</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-priority" className={labelCls}>Priority</label>
        <select id="f-priority" className={inputCls} value={filters.priority} onChange={set('priority')}>
          <option value="all">All</option>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-assignee" className={labelCls}>Assignee</label>
        <select id="f-assignee" className={inputCls} value={filters.assignee} onChange={set('assignee')}>
          <option value="all">Anyone</option>
          <option value="none">Unassigned</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
        </select>
      </div>
    </div>
  );
}