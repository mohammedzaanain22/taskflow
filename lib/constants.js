export const STATUSES = [
  { value: 'todo', label: 'To Do', icon: '○' },
  { value: 'in_progress', label: 'In Progress', icon: '◐' },
  { value: 'done', label: 'Done', icon: '●' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', icon: '▽' },
  { value: 'medium', label: 'Medium', icon: '◇' },
  { value: 'high', label: 'High', icon: '△' },
];

export const statusOf = (v) => STATUSES.find((s) => s.value === v) || STATUSES[0];
export const priorityOf = (v) => PRIORITIES.find((p) => p.value === v) || PRIORITIES[1];

export function errorMessage(e) {
  const code = e?.code || '';
  if (code.includes('permission-denied')) return 'Access denied: you are not allowed to do this.';
  if (code.includes('unavailable') || code.includes('network'))
    return 'Network problem. Please check your connection and try again.';
  return e?.message || 'Something went wrong. Please try again.';
}