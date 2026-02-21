// src/app/layout/AppLayout.tsx - applayout
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Components/Navbar";

import { SidebarContext } from "@/shared/custom-ui/sidebar/SidebarContext";
import { Toaster } from "sonner";

const AppLayout = () => {
  console.log("app working ");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log("toggleSidebar called");
    setIsSidebarCollapsed((prev) => !prev);
    setIsSidebarOpen((prev) => !prev);
  };

  const expandSidebar = () => {
    console.log("expandSidebar called");
    setIsSidebarCollapsed(false);
    setIsSidebarOpen(true);
  };

  return (
    <SidebarContext.Provider
      value={{
        toggleSidebar,
        expandSidebar,
        isSidebarCollapsed,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-slate-50">
            <Outlet />
          </main>
        </div>
        <Toaster position="bottom-center" richColors />
      </div>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
