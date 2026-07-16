import { useEffect, useState, useCallback } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase.js";

export function useNotifications(uid) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!uid) { setItems([]); return; }
    const q = query(collection(db, "notifications"), where("toUid", "==", uid), orderBy("createdAt", "desc"), limit(30));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, e => console.error("Notifications listener error:", e.message));
    return unsub;
  }, [uid]);

  const unreadCount = items.filter(n => !n.read).length;

  const markRead = useCallback(async (id) => {
    try { await updateDoc(doc(db, "notifications", id), { read: true }); } catch (e) { console.error(e.message); }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = items.filter(n => !n.read);
    if (!unread.length) return;
    const batch = writeBatch(db);
    unread.forEach(n => batch.update(doc(db, "notifications", n.id), { read: true }));
    try { await batch.commit(); } catch (e) { console.error(e.message); }
  }, [items]);

  return { items, unreadCount, markRead, markAllRead };
}
