import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { PromptHistoryProvider } from "./context/PromptHistoryContext";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";  // ✅ ADD

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>   {/* ✅ MOVE ROUTER HERE */}
    <AuthProvider>
      <PromptHistoryProvider>
        <App />
      </PromptHistoryProvider>
    </AuthProvider>
  </BrowserRouter>
);