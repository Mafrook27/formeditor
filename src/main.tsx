// 1️⃣ IMPORTS - Clean and ordered
import React from "react";
import ReactDOM from "react-dom/client";

import { AppProviders } from "@/app/providers/AuthProvider";
import App from "./app/App";
import "./styles/globals.css";

// 2️⃣ RENDER - Application entry point
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
