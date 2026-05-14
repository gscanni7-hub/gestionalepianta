import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Reservation } from '../types';

export function subscribeToReservations(callback: (reservations: Reservation[]) => void): () => void {
  if (!isFirebaseConfigured()) return () => {};
  return onSnapshot(collection(db, 'reservations'), snap => {
    const res = snap.docs.map(d => ({ id: d.id, ...d.data() } as Reservation));
    callback(res);
  });
}

export async function addReservation(data: Omit<Reservation, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'reservations'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateReservation(id: string, data: Partial<Reservation>): Promise<void> {
  await updateDoc(doc(db, 'reservations', id), data);
}

export async function deleteReservation(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reservations', id));
}
