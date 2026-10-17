import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs,
  query, serverTimestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { findUserByEmail } from './users';

export async function createProject(uid, { name, description }) {
  const ref = await addDoc(collection(db, 'projects'), {
    name: name.trim(),
    description: (description || '').trim(),
    ownerId: uid,
    memberIds: [uid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listProjects(uid) {
  const q = query(collection(db, 'projects'), where('memberIds', 'array-contains', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProject(id) {
  const snap = await getDoc(doc(db, 'projects', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function updateProject(project, { name, description }) {
  return updateDoc(doc(db, 'projects', project.id), {
    name: name.trim(),
    description: (description || '').trim(),
    ownerId: project.ownerId,
    memberIds: project.memberIds,
    createdAt: project.createdAt,
    updatedAt: serverTimestamp(),
  });
}

// Firestore ما بيحذف المجموعات الفرعية تلقائياً: نحذف المهام أولاً ثم المشروع
export async function deleteProject(projectId) {
  const tasks = await getDocs(collection(db, 'projects', projectId, 'tasks'));
  for (let i = 0; i < tasks.docs.length; i += 400) {
    const batch = writeBatch(db);
    tasks.docs.slice(i, i + 400).forEach((t) => batch.delete(t.ref));
    await batch.commit();
  }
  await deleteDoc(doc(db, 'projects', projectId));
}

export async function addMemberByEmail(project, email) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No registered user was found with that email.');
  if (project.memberIds.includes(user.id)) throw new Error('This user is already a member.');
  await updateDoc(doc(db, 'projects', project.id), {
    memberIds: arrayUnion(user.id),
    updatedAt: serverTimestamp(),
  });
  return user;
}

export async function removeMember(project, uid) {
  if (uid === project.ownerId) throw new Error('The owner cannot be removed from the project.');
  const batch = writeBatch(db);
  const assigned = await getDocs(
    query(collection(db, 'projects', project.id, 'tasks'), where('assigneeId', '==', uid))
  );
  assigned.docs.forEach((t) =>
    batch.update(t.ref, { assigneeId: null, updatedAt: serverTimestamp() })
  );
  batch.update(doc(db, 'projects', project.id), {
    memberIds: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}