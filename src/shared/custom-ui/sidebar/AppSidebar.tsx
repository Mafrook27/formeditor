import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import SearchFilterSection from "./Component/SearchFilterSection";
import type { AppSidebarProps, SearchFilters } from "./types";
import { useSidebarContext } from "./SidebarContext";
import { createPortal } from "react-dom";

export default function AppSidebar({
  isCollapsed,
  onNavigate,
  activePath,
  onClose,
  screen,
  onExpand,
  navigationItems = [],
  hasSubMenus = false,
}: AppSidebarProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [hoveredMainMenu, setHoveredMainMenu] = useState<string | null>(null);
  const [isSubMenuExpanded, setIsSubMenuExpanded] = useState(false);

  const { toggleSidebar } = useSidebarContext();
  const menuItemRefs = React.useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );
  const [submenuTop, setSubmenuTop] = useState(0);
  // Compute active menu from path - this is derived state, no need for useState
  const activeMainMenu = useMemo(() => {
    if (!hasSubMenus || navigationItems.length === 0) return null;

    for (const item of navigationItems) {
      if (item.subMenus) {
        const isSubMenuActive = item.subMenus.some(
          (sub) => activePath === sub.path,
        );
        if (isSubMenuActive) return item.id;
      } else if (item.path === activePath) {
        return item.id;
      }
    }
    return navigationItems[0]?.id || null;
  }, [activePath, hasSubMenus, navigationItems]);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    loanId: "",
    custId: "",
    ssn: "",
  });

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMainMenuClick = (itemId: string) => {
    const item = navigationItems.find((nav) => nav.id === itemId);
    if (item?.subMenus) {
      // Just hide submenu when clicking main tab - activeMainMenu is derived from activePath
      setIsSubMenuExpanded(false);
    } else if (item?.path) {
      onNavigate(item.path);
    }
  };

  const handleSubMenuClick = (path: string) => {
    setIsSubMenuExpanded(false); // Hide submenu panel after clicking
    setHoveredMainMenu(null); // Close hover menu

    // Collapse main menu if it's not already collapsed
    if (!isCollapsed && hasSubMenus) {
      toggleSidebar();
    }

    onNavigate(path);
  };

  // DUAL-TIER SIDEBAR (with submenus)
  if (hasSubMenus) {
    const activeMenuItem = navigationItems.find(
      (item) => item.id === activeMainMenu,
    );

    // Show submenu panel only when hovering OR when a submenu is expanded
    const shouldShowSubmenu = hoveredMainMenu || isSubMenuExpanded;
    const displayMenuItem = hoveredMainMenu
      ? navigationItems.find((item) => item.id === hoveredMainMenu)
      : isSubMenuExpanded
        ? activeMenuItem
        : null;
    const SIDEBAR_EXPANDED_WIDTH = 256;
    const SIDEBAR_COLLAPSED_WIDTH = 72;

    const sidebarLeftOffset = isCollapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_EXPANDED_WIDTH;
    return (
      <div
        className="flex h-full"
        onMouseLeave={() => !isSubMenuExpanded && setHoveredMainMenu(null)}
      >
        {/* Tier 1: Primary Main Menu - Controlled by hamburger (isCollapsed) */}
        <aside
          className={`bg-white border-r border-gray-200 flex flex-col py-2 shrink-0 transition-all duration-300 ${
            isCollapsed ? "w-[72px]" : "w-64"
          }`}
        >
          {/* Mobile Close Button */}
          <div className="md:hidden flex items-center justify-center w-full px-4 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          <div className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide">
            {navigationItems.map((item) => {
              const IconFilled = item.icon;
              const IconOutline = item.iconOutline;
              const isActive = activeMainMenu === item.id;

              const buttonContent = (
                <button
                  ref={(el) => (menuItemRefs.current[item.id] = el)}
                  onClick={() => handleMainMenuClick(item.id)}
                  onMouseEnter={() => {
                    // Only show submenu if item has submenus AND no direct path
                    if (!isSubMenuExpanded && item.subMenus && !item.path) {
                      const el = menuItemRefs.current[item.id];
                      if (!el) return;

                      const rect = el.getBoundingClientRect();
                      setSubmenuTop(rect.top);

                      setHoveredMainMenu(item.id);
                    } else if (item.path) {
                      // Clear submenu when hovering over direct navigation items
                      setHoveredMainMenu(null);
                    }
                  }}
                  className={`group w-full flex items-center h-10 transition-all duration-200 rounded-xl cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/30"
                      : "text-gray-700 border border-transparent hover:border-blue-300 hover:bg-blue-50/50"
                  } ${isCollapsed ? "justify-center px-2" : "px-3"}`}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  {!isCollapsed ? (
                    <div className="flex items-center gap-5 ml-[5px]">
                      <span
                        className={`relative w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "group-hover:text-blue-600"}`}
                      >
                        <IconFilled
                          className={`w-5 h-5 absolute inset-0 transition-opacity duration-200 shake-icon ${isActive ? "opacity-100" : "group-hover:opacity-0"}`}
                        />
                        <IconOutline
                          className={`w-5 h-5 absolute inset-0 transition-opacity duration-200 shake-icon ${isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
                        />
                      </span>
                      <span className="text-sm truncate flex-1 text-left">
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`relative w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "group-hover:text-blue-600"}`}
                    >
                      <IconFilled
                        className={`w-5 h-5 absolute inset-0 transition-opacity duration-200 shake-icon ${isActive ? "opacity-100" : "group-hover:opacity-0"}`}
                      />
                      <IconOutline
                        className={`w-5 h-5 absolute inset-0 transition-opacity duration-200 shake-icon ${isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
                      />
                    </span>
                  )}
                </button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <React.Fragment key={item.id}>{buttonContent}</React.Fragment>
              );
            })}
          </div>
        </aside>

        {shouldShowSubmenu &&
          displayMenuItem?.subMenus &&
          typeof window !== "undefined" &&
          createPortal(
            <aside
              style={{
                top: submenuTop,
                left: sidebarLeftOffset,
              }}
              className="
        fixed
       
        w-64
        bg-gray-50
        border border-gray-200
        rounded-xl
        shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)]
        z-1000
        transition-all duration-300 ease-out
      "
              onMouseEnter={() =>
                !isSubMenuExpanded &&
                displayMenuItem &&
                setHoveredMainMenu(displayMenuItem.id)
              }
              onMouseLeave={() => {
                if (!isSubMenuExpanded) {
                  setHoveredMainMenu(null);
                }
              }}
            >
              <div className="max-h-[70vh] overflow-y-auto px-5 py-6">
                <h2 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-4">
                  {displayMenuItem.label}
                </h2>

                <nav className="space-y-1">
                  {displayMenuItem.subMenus.map((sub) => {
                    const isActive = activePath === sub.path;
                    const SubIcon = sub.icon;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubMenuClick(sub.path)}
                        className={`
                  w-full flex items-center justify-between
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-all group
                  ${
                    isActive
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }
                `}
                      >
                        <div className="flex items-center gap-3">
                          {SubIcon && (
                            <SubIcon
                              className={`w-4 h-4 ${
                                isActive
                                  ? "text-blue-600"
                                  : "text-gray-400 group-hover:text-gray-600"
                              }`}
                            />
                          )}
                          <span className="truncate">{sub.label}</span>
                        </div>

                        {sub.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              typeof sub.badge === "number"
                                ? "bg-gray-200 text-gray-600"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>,
            document.getElementById("sidebar-overlay-root")!,
          )}
      </div>
    );
  }

  // SINGLE SIDEBAR (original design for customers)
  return (
    <aside
      className={`h-full bg-white flex flex-col transition-all duration-300 ease-in-out border-r border-gray-200 ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden flex items-center h-16 px-4 shrink-0 border-b border-gray-200 justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-gray-100"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* ================= SEARCH ================= */}
      {screen === "customer" && (
        <div className="py-2 border-b border-gray-200 md:pt-4">
          <SearchFilterSection
            isExpanded={isSearchExpanded}
            onToggle={() => setIsSearchExpanded(!isSearchExpanded)}
            filters={searchFilters}
            onFilterChange={handleFilterChange}
            isSidebarCollapsed={isCollapsed}
            onExpandSidebar={onExpand}
          />
        </div>
      )}

      {/* ================= NAVIGATION ================= */}
      <nav
        className={`flex-1 p-2 space-y-1 overflow-y-auto ${
          isCollapsed ? "scrollbar-hide" : "custom-scrollbar"
        }`}
      >
        {navigationItems.map((item) => {
          const IconFilled = item.icon;
          const IconOutline = item.iconOutline;
          const isActive = activePath === item.path;

          const buttonContent = (
            <button
              onClick={() => item.path && onNavigate(item.path)}
              className={`group w-full flex items-center h-10 transition-all duration-200 rounded-xl cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/30"
                  : "text-gray-700 border border-transparent hover:border-blue-300 hover:bg-blue-50/50"
              } ${isCollapsed ? "justify-center px-2" : "px-3"}`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {!isCollapsed ? (
                <div className="flex items-center gap-5 ml-[5px]">
                  <span
                    className={`relative w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "group-hover:text-blue-600"}`}
                  >
                    <IconFilled
                      className={`w-5 h-5 absolute inset-0 transition-opacity duration-200 shake-icon ${isActive ? "opacity-100" : "group-hover:opacity-0"}`}
                    />
                    <IconOutline
                      className={`w-5 h-5 absolute inset-0 transition-opacity duration-200 shake-icon ${isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
                    />
                  </span>
                  <span className="text-sm truncate flex-1 text-left">
                    {item.label}
                  </span>
                </div>
              ) : (
                <span
                  className={`relative w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "group-hover:text-blue-600"}`}
                >
                  <IconFilled
                    className={`w-5 h-5 absolute inset-0 transition-opacity duration-200 shake-icon ${isActive ? "opacity-100" : "group-hover:opacity-0"}`}
                  />
                  <IconOutline
                    className={`w-5 h-5 absolute inset-0 transition-opacity duration-200 shake-icon ${isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
                  />
                </span>
              )}
            </button>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.id}>{buttonContent}</div>;
        })}
      </nav>
    </aside>
  );
}
