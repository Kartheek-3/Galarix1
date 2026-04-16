import { useEffect, useState } from "react";
import Header from "./Header";
import PromptInput from "./PromptInput";
import Sidebar from "./Sidebar";
import { usePromptHistory } from "./context/PromptHistoryContext";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import { useAuth } from "./context/AuthContext";

/* ================= APP ================= */

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<MainApp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}

/* ================= MAIN APP ================= */

function MainApp() {
  const [prompt, setPrompt] = useState("");
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);

  const { getMessages } = usePromptHistory();

  const [restoredSchema, setRestoredSchema] = useState(null);
  const [restoredData, setRestoredData] = useState([]);
  const [restoredDataContract, setRestoredDataContract] = useState(null);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="h-screen bg-white dark:bg-[#050B1A]">

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeThreadId={activeThreadId}
        setActiveThreadId={setActiveThreadId}
        onSelectThread={async (id, msgs) => {

          // NEW CHAT
          if (!id) {
            setActiveThreadId(null);
            setMessages([]);
            setPrompt("");

            setRestoredSchema(null);
            setRestoredData([]);
            setRestoredDataContract(null);
            return;
          }

          // LOAD CHAT
          setActiveThreadId(id);
          setPrompt("");

          let loadedMessages = msgs;

          if (!loadedMessages) {
            loadedMessages = await getMessages(id);
          }

          setMessages(loadedMessages || []);

          if (!loadedMessages?.length) return;

          const lastAssistant = [...loadedMessages]
            .reverse()
            .find((m) => m.role === "assistant");

          if (lastAssistant?.content) {
            setRestoredSchema(lastAssistant.content?.schema || null);
            setRestoredData(lastAssistant.content?.data || []);
            setRestoredDataContract(
              lastAssistant.content?.dataContract || null
            );
          }
        }}
      />

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* HEADER */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN */}
      <main className="pt-[72px] h-[calc(100vh-72px)] overflow-y-auto">
        <PromptInput
          darkMode={darkMode}
          messages={messages}
          setMessages={setMessages}
          prompt={prompt}
          setPrompt={setPrompt}
          activeThreadId={activeThreadId}
          setActiveThreadId={setActiveThreadId}
          restoredSchema={restoredSchema}
          restoredData={restoredData}
          restoredDataContract={restoredDataContract}
        />
      </main>
    </div>
  );
}

export default App;