import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { AppSidebar } from "@/shared/custom-ui/sidebar";
import { useSidebarContext } from "@/shared/custom-ui/sidebar";
import { dashboardNavigationItems } from "../config/sidebar-config";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get sidebar state from AppLayout context
  const { isSidebarCollapsed, isSidebarOpen, setIsSidebarOpen, expandSidebar } =
    useSidebarContext();

  const handleNavigate = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleClose = () => {
    if (setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar - Always visible on desktop, overlay on mobile */}
      <div
        className={`
        ${isSidebarOpen ? "fixed inset-y-0 left-0 z-50" : "hidden"}
        md:block md:sticky md:top-0 h-[calc(100vh-4rem)] overflow-hidden
      `}
      >
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onNavigate={handleNavigate}
          activePath={location.pathname}
          onClose={handleClose}
          screen="dashboard"
          onExpand={expandSidebar}
          navigationItems={dashboardNavigationItems}
          hasSubMenus={false}
        />
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
