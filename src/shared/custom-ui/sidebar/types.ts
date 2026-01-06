import type { NavItem } from "./Component/types";

export type { NavItem };

export interface SearchFilters {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  loanId: string;
  custId: string;
  ssn: string;
}

export interface SearchFilterSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  filters: SearchFilters;
  onFilterChange: (field: keyof SearchFilters, value: string) => void;
  isSidebarCollapsed: boolean;
  onExpandSidebar?: () => void; // Optional callback to expand sidebar when collapsed
}

type ScreenType = "customer" | "dashboard";

export interface AppSidebarProps {
  isCollapsed: boolean;
  onNavigate: (path: string) => void;
  activePath: string;
  onClose: () => void;
  screen: ScreenType;
  onExpand?: () => void;
  navigationItems?: NavItem[]; // Dynamic navigation items based on layout
  hasSubMenus?: boolean; // Whether this sidebar uses dual-tier navigation
}
