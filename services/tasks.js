import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query,
  serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const col = (projectId) => collection(db, 'projects', projectId, 'tasks');

export async function listTasks(projectId) {
  const snap = await getDocs(query(col(projectId), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, projectId, ...d.data() }));
}

export function createTask(projectId, uid, data) {
  return addDoc(col(projectId), {
    title: data.title.trim(),
    description: (data.description || '').trim(),
    status: 'todo',
    priority: data.priority,
    assigneeId: data.assigneeId || null,
    dueDate: data.dueDate || null,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateTask(projectId, task, data) {
  return updateDoc(doc(db, 'projects', projectId, 'tasks', task.id), {
    title: data.title.trim(),
    description: (data.description || '').trim(),
    status: data.status ?? task.status,
    priority: data.priority,
    assigneeId: data.assigneeId || null,
    dueDate: data.dueDate || null,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: serverTimestamp(),
  });
}

export function setTaskStatus(projectId, task, status) {
  return updateTask(projectId, task, { ...task, status });
}

export function deleteTask(projectId, taskId) {
  return deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
}