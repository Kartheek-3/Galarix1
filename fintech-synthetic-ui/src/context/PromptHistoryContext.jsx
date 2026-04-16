import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { useAuth } from "./AuthContext";

const PromptHistoryContext = createContext();

export function PromptHistoryProvider({ children }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);

  // ================= CREATE THREAD =================
  const createThread = async (prompt, isGroup = false) => {
  if (!prompt?.trim() || !user) return null;

  const docRef = await addDoc(
    collection(db, "users", user.uid, "threads"),
    {
      title: prompt,
      createdAt: serverTimestamp(),
      pinned: false,
      lastMessage: prompt,
      isGroup: isGroup,   // 🔥 NEW
      members: isGroup ? [user.uid] : [], // 🔥 NEW
    }
  );

  return docRef.id;
};

  // ================= ADD MESSAGE =================
  const addMessageToThread = async (threadId, message) => {
    if (!user || !threadId) return;

    await addDoc(
      collection(db, "users", user.uid, "threads", threadId, "messages"),
      {
        ...message,
        timestamp: serverTimestamp(),
      }
    );

    // 🔥 update preview
    await updateDoc(
      doc(db, "users", user.uid, "threads", threadId),
      {
        lastMessage:
          message.role === "user"
            ? message.content
            : "📊 Generated dataset",
      }
    );
  };

  // ================= GET MESSAGES =================
  const getMessages = async (threadId) => {
    if (!user || !threadId) return [];

    const q = query(
      collection(db, "users", user.uid, "threads", threadId, "messages"),
      orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  // ================= DELETE =================
  const deleteThread = async (threadId) => {
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "threads", threadId));

    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  };

  // ================= RENAME =================
  const renameThread = async (threadId, newTitle) => {
    if (!user || !newTitle) return;

    await updateDoc(
      doc(db, "users", user.uid, "threads", threadId),
      {
        title: newTitle,
      }
    );

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, title: newTitle } : t
      )
    );
  };

  // ================= PIN =================
  const togglePin = async (threadId) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    await updateDoc(
      doc(db, "users", user.uid, "threads", threadId),
      {
        pinned: !thread.pinned,
      }
    );

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, pinned: !t.pinned } : t
      )
    );
  };

  // ================= CLEAR =================
  const clearHistory = async () => {
    if (!user) return;

    const snapshot = await getDocs(
      collection(db, "users", user.uid, "threads")
    );

    snapshot.forEach(async (d) => {
      await deleteDoc(d.ref);
    });

    setThreads([]);
  };

  // ================= LOAD =================
  useEffect(() => {
    if (!user) return;

    const fetchThreads = async () => {
      const q = query(
        collection(db, "users", user.uid, "threads"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setThreads(data);
    };

    fetchThreads();
  }, [user]);

  return (
    <PromptHistoryContext.Provider
      value={{
        threads,
        createThread,
        addMessageToThread,
        getMessages,
        deleteThread,
        renameThread,
        togglePin,
        clearHistory,
      }}
    >
      {children}
    </PromptHistoryContext.Provider>
  );
}

export const usePromptHistory = () =>
  useContext(PromptHistoryContext);