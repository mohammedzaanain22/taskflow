import Link from 'next/link';

export default function ProjectCard({ project, isOwner }) {
  const n = project.memberIds.length;
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-bold">
        <Link href={`/projects/${project.id}`} className="hover:text-indigo-700">
          {project.name}
        </Link>
      </h3>
      {project.description && (
        <p className="mt-1.5 text-sm text-slate-600">{project.description}</p>
      )}
      <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
          {isOwner ? 'Owner' : 'Member'}
        </span>
        {n} member{n === 1 ? '' : 's'}
      </p>
    </li>
  );
}