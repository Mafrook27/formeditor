import { createContext, useContext } from "react";

interface SidebarContextValue {
  toggleSidebar: () => void;
  expandSidebar?: () => void;
  isSidebarCollapsed: boolean;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      toggleSidebar: () => {
        console.warn("toggleSidebar called outside of SidebarContext");
      },
      expandSidebar: () => {
        console.warn("expandSidebar called outside of SidebarContext");
      },
      isSidebarCollapsed: false,
      isSidebarOpen: false,
      setIsSidebarOpen: () => {},
    };
  }
  return context;
};
