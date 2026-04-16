import { useState, useEffect, useRef } from "react";
import { usePromptHistory } from "./context/PromptHistoryContext";
import ReactMarkdown from "react-markdown";
import { model } from "./firebase";
import remarkGfm from "remark-gfm";
const CATEGORY_STYLES = {
  "Credit Card Activity": "from-blue-500 to-indigo-600",
  "Investment Statements": "from-green-500 to-emerald-600",
  "Payroll Simulation": "from-purple-500 to-violet-600",
  "SaaS Billing": "from-yellow-400 to-orange-500",
  "Insurance Claims": "from-red-500 to-pink-500",
  "Loans": "from-cyan-500 to-sky-600",
};

const CATEGORY_ICONS = {
  "Credit Card Activity": "💳",
  "Investment Statements": "📈",
  "Payroll Simulation": "💼",
  "SaaS Billing": "📊",
  "Insurance Claims": "🛡️",
  "Loans": "🏦",
};

const TEMPLATE_GROUPS = {
  "💳 Credit Card Activity": [
    "Simulate 50 realistic credit card transactions for a single user over 30 days, including groceries, dining, utilities, and one large airline ticket purchase.",
    "Generate daily credit card transactions with recurring subscriptions and occasional high-value electronics purchases.",
  ],
  "📈 Investment Statements": [
    "Create an investment portfolio statement showing monthly recurring stock buys (DCA), dividend reinvestments, and portfolio value over 12 months.",
    "Simulate mutual fund investments with SIP contributions and quarterly returns.",
  ],
  "💼 Payroll Simulation": [
    "Generate payroll transactions for a startup with 5 employees including monthly salaries, tax deductions, and reimbursements.",
    "Simulate bi-weekly payroll payments with bonuses and deductions.",
  ],
  "📊 SaaS Billing": [
    "Generate subscription billing data for a B2B SaaS platform including monthly renewals, upgrades, downgrades, and churn.",
    "Simulate SaaS invoices with tiered pricing and annual subscriptions.",
  ],
  "🛡️ Insurance Claims": [
    "Generate insurance claims data including claim amount, approval status, and fraud detection flags.",
    "Simulate insurance policies with claim submissions, risk scores, and settlement outcomes.",
  ],
  "🏦 Loans": [
    "Generate loan dataset including EMI payments, interest rates, and repayment schedules.",
    "Simulate loan accounts with credit scores, defaults, and repayment history.",
  ],
};

const TypingDots = () => (
  <span className="inline-flex gap-1 ml-1">
    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
  </span>
);

function PromptInput({
  messages,
  setMessages,
  darkMode,
  prompt,
  setPrompt,
  activeThreadId,
  setActiveThreadId,
  sidebarOpen,
  restoredSchema,
  restoredData,
  restoredDataContract,
}) {
  const [data, setData] = useState([]);
  const chatEndRef = useRef(null);
  const {
  createThread,
  addMessageToThread,
  
} = usePromptHistory(); 
//const [summary, setSummary] = useState("");    
  const [listening, setListening] = useState(false);
  //const thread = activeThreadId ? getThreadById(activeThreadId) : null;
  const [typedMessage, setTypedMessage] = useState("");
  const [showPromptChooser, setShowPromptChooser] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [schema, setSchema] = useState(null);
  const [dataContract, setDataContract] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Credit Card Activity");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState("schema");
  const [entities, setEntities] = useState([]);
  const latestSchemaRef = useRef(null);
  const latestDataRef = useRef([]);
  const latestContractRef = useRef(null);
  const [results, setResults] = useState([]);
const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
  behavior: "smooth",
  block: "end"
});
}, [messages]);

  useEffect(() => {
    if (restoredSchema) setSchema(restoredSchema);
    if (restoredDataContract) setDataContract(restoredDataContract);
    if (restoredData?.length) setData(restoredData);
  }, [restoredSchema, restoredDataContract, restoredData]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".textarea-wrapper")) {
        setSuggestion("");
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
 
 const startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.start();
  setListening(true);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setPrompt(transcript);
    setListening(false);
  };

  recognition.onerror = () => {
    setListening(false);
  };
};
  const generateInlineSuggestion = (input) => {
    if (!input.trim()) {
      setSuggestion("");
      return;
    }
    const allTemplates = Object.values(TEMPLATE_GROUPS).flat();
    const match = allTemplates.find((t) =>
      t.toLowerCase().startsWith(input.toLowerCase())
    );
    if (match && match.length > input.length) {
      setSuggestion(match.slice(input.length));
    } else {
      setSuggestion("");
    }
  };
  const STAGE_PROGRESS = {
  thinking: 10,
  semantic: 25,
  resolved: 50,
  schema: 75,
  data: 90,
  done: 100,
};
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 400;
    const increment = value / (duration / 16);

    const interval = setInterval(() => {
      start += increment;

      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(parseFloat(start.toFixed(2)));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value]);

  return <span>{display}</span>;
};

const generateData = async () => {
  if (!prompt?.trim()) return;

  let summaryGenerated = false; // ✅ prevent duplicate summary

  setIsGenerating(true);
  setStatusMessage("Initializing...");
  setProgress(5);

  setResults([]);
  setActiveIndex(0);
  setSchema(null);
  setDataContract(null);
  setData([]);
  setActiveTab("schema");

  let threadId = activeThreadId;

  // ================= CREATE THREAD =================
  if (!threadId) {
    threadId = await createThread(prompt);
    if (threadId) setActiveThreadId(threadId);
  }

  // ================= USER MESSAGE =================
  const userMsg = { role: "user", content: { text: prompt } };
  setMessages((prev) => [...prev, userMsg]);

  await addMessageToThread(threadId, {
    role: "user",
    content: { text: prompt },
    timestamp: new Date(),
  });

  try {
    const response = await fetch("http://localhost:5000/generate-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.body) throw new Error("Streaming failed");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    // ================= AI MESSAGE =================
    const aiMessage = {
      role: "assistant",
      content: {
        text: "",
        data: [],
        typing: true,
      },
    };

    setMessages((prev) => [...prev, aiMessage]);

    // ================= SMOOTH TYPING =================
    let typingTimeout;

    const updateTyping = (text) => {
      clearTimeout(typingTimeout);

      typingTimeout = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content.text = text;
          return updated;
        });
      }, 20);
    };
    

    // ================= STREAM LOOP =================
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const parts = buffer.split("\n\n");

      for (let i = 0; i < parts.length - 1; i++) {
        const line = parts[i].replace("data: ", "").trim();
        if (!line) continue;

        const parsed = JSON.parse(line);

        // ========= TEXT =========
        if (parsed.text) {
          aiMessage.content.text += parsed.text;
          updateTyping(aiMessage.content.text);
        }

        // ========= PROGRESS =========
        if (parsed.stage && STAGE_PROGRESS[parsed.stage] !== undefined) {
          setProgress(STAGE_PROGRESS[parsed.stage]);
        }

        // ========= SCHEMA =========
        if (parsed.stage === "schema") {
          if (parsed.results?.length > 0) {
            const best = parsed.results[0];

            latestSchemaRef.current = best.schema || {};
            latestContractRef.current = best.dataContract || {};
            latestDataRef.current = best.data || [];

            setSchema(best.schema || {});
            setDataContract(best.dataContract || {});
            setData(best.data || []);
          }
        }

        // ========= DONE =========
        if (parsed.stage === "done") {
          const finalText =
            aiMessage.content.text || "✅ Dataset generated successfully";

          const finalData = latestDataRef.current || [];

          // ✅ FINAL MESSAGE UPDATE
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];

            updated[updated.length - 1] = {
              ...last,
              content: {
                ...last.content,
                text: finalText,
                data: [],
                typing: false,
              },
            };

            return updated;
          });

          // ================= STREAM TABLE =================
          setTimeout(() => {
            let index = 0;
            let rows = [];

            const interval = setInterval(() => {
              if (index >= finalData.length) {
                clearInterval(interval);
                return;
              }

              rows.push(finalData[index]);

              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];

                updated[updated.length - 1] = {
                  ...last,
                  content: {
                    ...last.content,
                    data: [...rows],
                  },
                };

                return updated;
              });

              index++;
            }, 60); // ⚡ faster + smooth
          }, 150);

          // ================= SAVE MAIN MESSAGE =================
          await addMessageToThread(threadId, {
            role: "assistant",
            content: {
              text: finalText,
              data: finalData,
              schema: latestSchemaRef.current,
              dataContract: latestContractRef.current,
            },
            timestamp: new Date(),
          });

          // ================= SUMMARY (FIXED ONCE) =================
          setTimeout(async () => {
            try {
              if (summaryGenerated) return;
              summaryGenerated = true;

              if (!finalData.length) return;

              const summaryPrompt = `
Give EXACTLY 4 lines:

- 3 insights
- 1 anomaly

Each line max 1 sentence.

Dataset:
${JSON.stringify(finalData.slice(0, 10))}
`;

              const result = await model.generateContent(summaryPrompt);

              let summaryText = "";
              if (result?.response) {
                summaryText = await result.response.text();
              }

              if (!summaryText) return;

              summaryText = summaryText
                .split("\n")
                .filter((l) => l.trim() !== "")
                .slice(0, 4)
                .join("\n");

              // ✅ ADD SUMMARY MESSAGE
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: {
                    text: summaryText,
                    data: [],
                  },
                },
              ]);

              await addMessageToThread(threadId, {
                role: "assistant",
                content: {
                  text: summaryText,
                  data: [],
                },
                timestamp: new Date(),
              });

            } catch (err) {
              console.error("Summary error:", err);
            }
          }, 1000);

          // ================= RESET UI =================
          setTimeout(() => {
            setIsGenerating(false);
            setProgress(0);
            setStatusMessage("");
          }, 600);
        }
      }

      buffer = parts[parts.length - 1];
    }

  } catch (err) {
    console.error("STREAM ERROR:", err);
    setIsGenerating(false);
    setStatusMessage("Error generating data");
    setProgress(0);
  }
};
const getSmartSuggestions = (input) => {
  if (!input) return [];

  const suggestions = [];

  if (input.includes("loan")) {
    suggestions.push("Generate EMI schedule with interest breakdown");
  }

  if (input.includes("card")) {
    suggestions.push("Simulate fraud transactions with anomaly flags");
  }

  if (input.includes("salary")) {
    suggestions.push("Generate payroll with tax deductions");
  }

  return suggestions;
};

  const downloadCSV = () => {
    if (!data || data.length === 0) {
      alert("No data to download");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((field) => `"${row[field] ?? ""}"`).join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "synthetic_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyDataContract = () => {
    if (!dataContract) {
      alert("No data contract to copy");
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(dataContract, null, 2));
  };
  

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10 text-slate-800 dark:text-slate-200">

        {/* PROMPT CARD */}
        <div className="prompt-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 relative">

          {/* Category Header */}
          <div className="mb-4">
            <div className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Choose Your Choice
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap">
              {Object.keys(TEMPLATE_GROUPS).map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedTemplate(null);
                    setShowTemplates(true);
                  }}
                  className={`
                    group px-4 py-2 rounded-full text-sm flex items-center gap-2
                    transition-all duration-300 transform
                    ${
                      activeCategory === category
                        ? `bg-gradient-to-r ${
                            CATEGORY_STYLES[category] || "from-blue-500 to-indigo-600"
                          } text-white shadow-lg scale-105 ring-2 ring-white/20`
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:scale-105 hover:shadow-md"
                    }
                  `}
                >
                  <span
                    className={`text-lg transition-transform duration-300 ${
                      activeCategory === category
                        ? "animate-pulse"
                        : "group-hover:scale-125"
                    }`}
                  >
                    {CATEGORY_ICONS[category]}
                  </span>
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Chooser Modal */}
          {showPromptChooser && (
            <div
              className="absolute inset-0 z-30 flex items-center justify-center px-4"
              onClick={() => setShowPromptChooser(false)}
            >
              <div
                className="w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold">
                    Choose a prompt or write your own
                  </div>
                  <button
                    onClick={() => setShowPromptChooser(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 mb-4">
                  {TEMPLATE_GROUPS[activeCategory]?.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPrompt(tpl);
                        setSuggestion("");
                        setShowPromptChooser(false);
                      }}
                      className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      {tpl}
                    </button>
                  ))}
                  <div
                    onClick={() => {
                      setActiveCategory(null);
                      setPrompt("");
                      setSuggestion("");
                    }}
                    className="mt-3 text-sm text-blue-400 cursor-pointer hover:underline text-center"
                  >
                    ✍️ Or write your own prompt
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates Dropdown */}
          {showTemplates && (
            <div className="absolute left-1/2 -translate-x-1/2 z-20 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 max-h-64 overflow-y-auto">
              {TEMPLATE_GROUPS[activeCategory]?.map((tpl, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setPrompt(tpl);
                    setSuggestion("");
                    setShowTemplates(false);
                  }}
                  className="p-3 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="font-medium text-sm">{activeCategory}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {tpl}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}

         
            {/* Textarea */}
<div className="textarea-wrapper" style={{ position: "relative", width: "100%", marginTop: "16px" }}>
  {suggestion && prompt && (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        color: "#64748b",
        padding: "16px",
        fontSize: "15px",
        fontFamily: "inherit",
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
        boxSizing: "border-box",
      }}
    >
      <span style={{ opacity: 0 }}>{prompt}</span>
      <span>{suggestion}</span>
    </div>
  )}

  <textarea
    value={prompt}
    onChange={(e) => {
      const value = e.target.value;
      setPrompt(value);
      generateInlineSuggestion(value);
    }}
    onKeyDown={(e) => {
      if (e.key === "Tab" && suggestion) {
        e.preventDefault();
        setPrompt((prev) => prev + suggestion);
        setSuggestion("");
      }
    }}
    placeholder="Describe the fintech dataset you want to generate..."
    style={{
      width: "100%",
      minHeight: "130px",
      borderRadius: "14px",
      border: "2px solid #3b82f6",
      padding: "16px",
      paddingRight: "44px",
      fontSize: "15px",
      fontFamily: "inherit",
      lineHeight: "1.6",
      resize: "none",
      display: "block",
      boxSizing: "border-box",
      backgroundColor: darkMode ? "#1e293b" : "#ffffff",
      color: darkMode ? "#f1f5f9" : "#0f172a",
      outline: "none",
    }}
  />
   
  {prompt?.trim() && (
    <button
      onClick={() => {
        setPrompt("");
        setSuggestion("");
      }}
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        color: "#94a3b8",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      ✕
    </button>
  )}
</div>
<button
  onClick={startVoiceInput}
  className={`ml-2 px-3 py-2 rounded-lg ${
    listening
      ? "bg-red-500 text-white"
      : "bg-slate-200 dark:bg-slate-700"
  }`}
>
  🎤
</button>

{getSmartSuggestions(prompt).length > 0 && (
  <div className="mt-2 flex gap-2 flex-wrap">
    {getSmartSuggestions(prompt).map((s, i) => (
      <button
        key={i}
        onClick={() => setPrompt(s)}
        className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600"
      >
        {s}
      </button>
    ))}
  </div>
)}

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
       <div
  className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.7)]"
  style={{ width: `${progress}%` }}
  
/>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span className="flex items-center">
  {isGenerating ? "Thinking..." : typedMessage}
{progress < 100 && <TypingDots />}
</span>

                <span className="flex items-center gap-2">
  {progress}%
  {progress === 100 && (
    <span className="text-green-400 animate-pulse">
      ✔ Done
    </span>
  )}
</span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={generateData}
              disabled={!prompt?.trim() || isGenerating}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition ${
                !prompt?.trim() || isGenerating
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate Synthetic Data"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {(schema || dataContract) && (
          <div className="mt-8 flex gap-2 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("schema")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "schema"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Schema
            </button>
            <button
              onClick={() => setActiveTab("contract")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "contract"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Data Contract
            </button>
          </div>
        )}

        {/* Schema Tab */}
        {activeTab === "schema" && schema && (
          <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5">
            <h3 className="text-sm font-semibold mb-3">Schema</h3>
            <pre className="text-xs overflow-auto rounded-lg bg-white dark:bg-slate-950 p-4">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        )}

        {/* Contract Tab */}
        {activeTab === "contract" && dataContract && (
          <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Data Contract</h3>
              <button
                onClick={copyDataContract}
                className="text-xs px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-800 hover:bg-slate-300"
              >
                Copy
              </button>
            </div>
            <pre className="text-xs overflow-auto rounded-lg bg-white dark:bg-slate-950 p-4">
              {JSON.stringify(dataContract, null, 2)}
            </pre>
          </div>
        )}

        
        {results.length > 1 && (
  <div className="flex gap-2 mt-6">
    {results.map((r, i) => (
      <button
        key={i}
        onClick={() => {
  setActiveIndex(i);

  // 🔥 smooth transition
  setTimeout(() => {
    setSchema(r.schema);
    setDataContract(r.dataContract);
    setData(r.data);
  }, 100);
}}
        className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
          activeIndex === i
            ? "bg-blue-600 text-white"
            : "bg-slate-700 text-slate-300"
        }`}
      >
        {r.entity}
      </button>
    ))}
  </div>
)}

{/* ================= CHAT UI ================= */}
<div className="mt-10 space-y-6">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`flex ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[75%] px-5 py-3 rounded-2xl text-sm
          shadow-md transition-all duration-300
          ${
            msg.role === "user"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none"
              : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none"
          }
        `}
      >
        {/* TEXT */}
        {msg.content?.text && (
          <div className="whitespace-pre-wrap leading-relaxed">
            {msg.content.text}
          </div>
        )}
        {/* SUMMARY ✅ FIXED */}
        {msg.content?.summary && (
          <div className="mt-2 p-3 rounded-lg bg-blue-900/30 border border-blue-700 text-sm text-blue-200">
            🧠 {msg.content.summary}
          </div>
        )}

        {/* TYPING */}
        {msg.content?.typing && (
          <div className="mt-2 flex gap-1">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.4s]"></span>
          </div>
        )}

    

            {/* ================= TABLE ================= */}
            {Array.isArray(msg.content.data) &&
              msg.content.data.length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-700">

                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-3 px-2 pt-2">
                    <span className="text-xs text-slate-400">
                      📊 {msg.content.data.length} rows
                    </span>

                    <button
                      onClick={() => {
                        const headers = Object.keys(msg.content.data?.[0] || {});
                        const csvRows = [
                          headers.join(","),
                          ...msg.content.data.map((row) =>
                            headers
                              .map((f) => `"${row[f] ?? ""}"`)
                              .join(",")
                          ),
                        ];
                        const blob = new Blob([csvRows.join("\n")], {
                          type: "text/csv",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "data.csv";
                        a.click();
                      }}
                      className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                    >
                      ⬇ Download CSV
                    </button>
                  </div>

                  {/* TABLE */}
                  <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-700">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-900 text-slate-200 sticky top-0">
                        <tr>
                          {Object.keys(msg.content.data?.[0] || {}).map((key) => (
                            <th
                              key={key}
                              className="px-6 py-3 text-left font-semibold tracking-wide"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.content.data.map((row, i) => (
                          <tr
                            key={i}
                            className="border-t border-slate-700 hover:bg-slate-800/50 transition"
                          >
                            {Object.values(row).map((val, j) => (
                              <td
                                key={j}
                                className="px-6 py-3 whitespace-nowrap"
                              >
                                {typeof val === "number" ? (
  <AnimatedNumber value={val} />
) : (
  val
)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        
      </div>
    
  ))}

  <div ref={chatEndRef} />
</div>

      
      </div>
    </div>
  );
}

export default PromptInput;