import { collection, doc, getDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function findUserByEmail(email) {
  const q = query(
    collection(db, 'users'),
    where('email', '==', email.trim().toLowerCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ترجع { uid: {id, displayName, email} }
export async function getProfiles(uids) {
  const entries = await Promise.all(
    uids.map(async (uid) => {
      const s = await getDoc(doc(db, 'users', uid));
      return [
        uid,
        s.exists() ? { id: uid, ...s.data() } : { id: uid, displayName: 'Unknown user', email: '' },
      ];
    })
  );
  return Object.fromEntries(entries);
}