export const isOwner = (project, uid) => project?.ownerId === uid;

export const canEditTask = (project, task, uid) =>
  isOwner(project, uid) || task.createdBy === uid || task.assigneeId === uid;

export const canDeleteTask = (project, task, uid) =>
  isOwner(project, uid) || task.createdBy === uid;

export const canChangeStatus = (project, task, uid) =>
  isOwner(project, uid) || task.assigneeId === uid;