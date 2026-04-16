import { useState, useEffect, useRef } from "react";
import { usePromptHistory } from "./context/PromptHistoryContext";
import { Pencil, Search } from "lucide-react";
/* ---------- GROUPING HELPER ---------- */
function groupHistoryByDate(threads) {
  const today = [];
  const yesterday = [];
  const older = [];

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  threads.forEach((thread) => {
    const itemDate = thread.createdAt?.toDate
  ? thread.createdAt.toDate()
  : new Date();
    if (itemDate >= startOfToday) today.push(thread);
    else if (itemDate >= startOfYesterday) yesterday.push(thread);
    else older.push(thread);
  });

  return { today, yesterday, older };
}
function RenameModal({ isOpen, onClose, onSave, defaultValue }) {
  const [value, setValue] = useState(defaultValue || "");
  const modalRef = useRef();

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  // 🔥 close on outside click
  useEffect(() => {
  const handleClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, [onClose]);
  // 🔥 Enter to save
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSave(value);
    }
  };

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">

    <div
      ref={modalRef}
      className="w-full max-w-md
      bg-white dark:bg-slate-900
      text-slate-900 dark:text-white
      rounded-2xl p-6
      shadow-[0_20px_60px_rgba(0,0,0,0.4)]
      border border-slate-200 dark:border-slate-700
      transform transition-all duration-300 scale-100 animate-modal-in"
    >
      <h2 className="text-lg font-semibold mb-4">
        Rename chat
      </h2>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full p-3 rounded-xl
        bg-slate-100 dark:bg-slate-800
        border border-slate-300 dark:border-slate-600
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800"
        >
          Cancel
        </button>

        <button
          onClick={() => onSave(value)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          Rename
        </button>
      </div>
    </div>
  </div>
);
}

function Sidebar({
  isOpen,
  onClose,
  onSelectThread,
  activeThreadId,
  setActiveThreadId,   // ✅ ADD THIS
}) {
  const [search, setSearch] = useState("");
  const [deleteThreadId, setDeleteThreadId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
   const [activeMenuId, setActiveMenuId] = useState(null);
  // 🧵 THREADS FROM CONTEXT
  const {
  threads,
  clearHistory,
  togglePin,
  deleteThread,
  renameThread,
  getMessages   // ✅ ADD THIS
} = usePromptHistory();

  /* ---------- SEARCH FIRST ---------- */
  const filteredThreads = threads
  .filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )
  .slice(0, visibleCount);
  /* ---------- PIN SPLIT ---------- */
  const pinned = filteredThreads.filter((t) => t.pinned);
  const unpinned = filteredThreads.filter((t) => !t.pinned);

  /* ---------- GROUP UNPINNED ---------- */
  const { today, yesterday, older } = groupHistoryByDate(unpinned);

  return (
    <div
  className={`fixed top-0 left-0 h-full w-80
  bg-white dark:bg-[#0B1220]
  text-slate-800 dark:text-slate-100
  p-4 z-50 transition-transform duration-300
  ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
  💬 <span>Chats</span>
</div>
        <button
          onClick={onClose}
          className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="flex justify-center mb-4">
      <div className="space-y-3 mb-4">

  {/* NEW CHAT */}
  <div
    onClick={() => {
      setActiveThreadId(null);
      onSelectThread(null);
    }}
    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
    hover:bg-slate-200 dark:hover:bg-slate-700 transition"
  >
    <Pencil size={24} />
    <span className="text-sm">New chat</span>
  </div>

  {/* SEARCH */}
  <div className="flex items-center gap-3 px-3 py-2 rounded-lg
  bg-slate-200 dark:bg-slate-800">
    <Search size={24} className="text-slate-500" />
    <input
      type="text"
      placeholder="Search chats"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="bg-transparent outline-none text-sm w-full"
    />
  </div>

</div>

</div>

      {/* Search */}
      

      {/* Scroll Area */}
      <div
  onScroll={(e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleCount((prev) => prev + 20);
    }
  }}
  className="h-[calc(100%-120px)] overflow-y-auto px-4 py-4
  scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600"
>
        {filteredThreads.length === 0 && (
          <div className="text-sm text-slate-400">
            No matching chats found
          </div>
        )}

        {/* PINNED */}
        {pinned.length > 0 && (
          <>
            <Section title="PINNED" />
            {pinned.map((thread) => (
              <ThreadItem
                key={thread.id}
                activeMenuId={activeMenuId}
setActiveMenuId={setActiveMenuId}
                thread={thread}
                getMessages={getMessages}
                onSelectThread={onSelectThread}
                onTogglePin={togglePin}
                isActive={thread.id === activeThreadId}
                isPinned
                onDeleteRequest={setDeleteThreadId}
                renameThread={renameThread}
              />
            ))}
          </>
        )}

        {/* TODAY */}
        {!search && today.length > 0 && (
          <>
            <Section title="TODAY" />
            {today.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                activeMenuId={activeMenuId}
setActiveMenuId={setActiveMenuId}
                getMessages={getMessages} 
                onSelectThread={onSelectThread}
                onTogglePin={togglePin}
                isActive={thread.id === activeThreadId}
                onDeleteRequest={setDeleteThreadId}
                renameThread={renameThread}
                
              />
            ))}
          </>
        )}

        {/* YESTERDAY */}
        {!search && yesterday.length > 0 && (
          <>
            <Section title="YESTERDAY" />
            {yesterday.map((thread) => (
              <ThreadItem
                key={thread.id}
                getMessages={getMessages}
                activeMenuId={activeMenuId}
setActiveMenuId={setActiveMenuId}
                thread={thread}
                onSelectThread={onSelectThread}
                onTogglePin={togglePin}
                isActive={thread.id === activeThreadId}
                onDeleteRequest={setDeleteThreadId}
                renameThread={renameThread}
              />
            ))}
          </>
        )}

        {/* OLDER */}
        {!search && older.length > 0 && (
          <>
            <Section title="OLDER" />
            {older.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                activeMenuId={activeMenuId}
setActiveMenuId={setActiveMenuId}
                getMessages={getMessages}
                onSelectThread={onSelectThread}
                onTogglePin={togglePin}
                isActive={thread.id === activeThreadId}
                onDeleteRequest={setDeleteThreadId}
                renameThread={renameThread}
              />
            ))}
          </>
        )}

        {/* SEARCH MODE */}
        {search &&
          filteredThreads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              activeMenuId={activeMenuId}
setActiveMenuId={setActiveMenuId}
              getMessages={getMessages}
              onSelectThread={onSelectThread}
              onTogglePin={togglePin}
              isActive={thread.id === activeThreadId}
              isPinned={thread.pinned}
              onDeleteRequest={setDeleteThreadId}
              renameThread={renameThread}
            />
          ))}
      </div>

      {/* Footer */}
      {threads.length > 0 && (
        <div className="p-4 border-t dark:border-slate-700">
          <button
            onClick={clearHistory}
            className="text-xs tracking-widest text-red-500 hover:underline"
          >
            CLEAR HISTORY
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteThreadId && (
        <div
          className={`
            fixed inset-0 z-[999] flex items-center
            bg-black/40 backdrop-blur-sm
            transition-opacity duration-300
            ${isDeleting ? "opacity-0" : "opacity-100"}
          `}
        >
          <div
            className={`
              w-full max-w-sm rounded-xl
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700
              shadow-2xl p-6
              transform transition-all duration-300
              ${isDeleting ? "scale-95 opacity-0" : "scale-100 opacity-100"}
            `}
          >
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              Delete chat?
            </div>

            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This action cannot be undone.
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleting(true);
                  setTimeout(() => {
                    setDeleteThreadId(null);
                    setIsDeleting(false);
                  }, 200);
                }}
                className="px-4 py-2 rounded-lg text-sm
                  bg-slate-100 dark:bg-slate-800
                  hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setIsDeleting(true);
                  setTimeout(() => {
                    deleteThread(deleteThreadId); // ✅ actual delete
                    setDeleteThreadId(null);
                    setIsDeleting(false);
                  }, 200);
                }}
                className="px-4 py-2 rounded-lg text-sm text-white
                  bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {visibleCount < threads.length && (
  <div className="text-center text-xs text-slate-400 py-2">
    Loading more...
  </div>
)}
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Section({ title }) {
  return (
    <div className="mt-4 mb-2 text-[11px] font-semibold tracking-widest text-slate-500 dark:text-slate-400">
      {title}
    </div>
  );
}
function ThreadItem({
  thread,
  onSelectThread,
  onTogglePin,
  isActive,
  isPinned,
  onDeleteRequest,
  renameThread,
  getMessages,
  activeMenuId,          // ✅ ADD
  setActiveMenuId  
}) {
  const isMenuOpen = activeMenuId === thread.id;
  const [showRename, setShowRename] = useState(false);
  useEffect(() => {
  const handleClick = () => setActiveMenuId(null);

  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}, []);

  return (
    <>
      <div
        onClick={async () => {
          const messages = await getMessages(thread.id);
          onSelectThread(thread.id, messages);
        }}
        className={`group relative cursor-pointer rounded-xl p-3 mb-2 transition-all duration-300
${
  isActive
    ? "bg-blue-500/10 border border-blue-500 shadow-md"
    : "hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-[1.01]"
}`}
      >
        {/* TITLE */}
        <p className="text-sm text-slate-800 dark:text-slate-100 truncate">
          {thread.title}
        </p>

        {/* LAST MESSAGE */}
        <p className="text-xs text-slate-500 truncate">
          {thread.lastMessage || "No messages"}
        </p>

        {/* 3 DOT MENU */}
        <button
          onClick={(e) => {
  e.stopPropagation();
  setActiveMenuId(isMenuOpen ? null : thread.id);
}}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
        >
          ⋯
        </button>

        {/* DROPDOWN */}
        {isMenuOpen && (
  <div className="
    absolute right-2 top-10 w-60
    rounded-2xl
    bg-white/90 dark:bg-slate-900/90
    backdrop-blur-xl
    border border-slate-200 dark:border-slate-700
    shadow-[0_10px_40px_rgba(0,0,0,0.35)]
    z-50 animate-dropdown-in
    overflow-hidden
  ">

    {/* ITEM */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowRename(true);
        setActiveMenuId(null);   // ✅ correct
      }}
      className="flex items-center gap-3 w-full px-4 py-3
      hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      ✏️ Rename
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        onTogglePin(thread.id);
      }}
      className="flex items-center gap-3 w-full px-4 py-3
      hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      📌 {isPinned ? "Unpin chat" : "Pin chat"}
    </button>

    <button
      className="flex items-center gap-3 w-full px-4 py-3
      hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      🔗 Add people via group link
    </button>

    <div className="border-t border-slate-200 dark:border-slate-700"></div>

    <button
      onClick={(e) => {
        e.stopPropagation();
        onDeleteRequest(thread.id);
      }}
      className="flex items-center gap-3 w-full px-4 py-3
      text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition"
    >
      🗑 Delete
    </button>
  </div>
)}
      </div>

      {/* RENAME MODAL */}
      <RenameModal
        isOpen={showRename}
        defaultValue={thread.title}
        onClose={() => setShowRename(false)}
        onSave={(newName) => {
          renameThread(thread.id, newName);
          setShowRename(false);
        }}
      />
    </>
  );
}


export default Sidebar;