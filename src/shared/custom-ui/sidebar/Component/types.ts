import type { IconType } from "react-icons";

// Search filter interface
export interface SearchFilters {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  loanId: string;
  custId: string;
  ssn: string;
}

// Sub-menu item interface
export interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: IconType;
  badge?: string | number;
}

// Navigation item interface (can have submenus)
export interface NavItem {
  id: string;
  label: string;
  path?: string; // Optional if it has submenus
  icon: IconType;
  iconOutline: IconType;
  subMenus?: SubMenuItem[]; // Optional submenus
}

// Sidebar state interface
export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  isHoverExpanded: boolean;
}

// SearchFilterSection component props
export interface SearchFilterSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  filters: SearchFilters;
  onFilterChange: (field: keyof SearchFilters, value: string) => void;
  isSidebarCollapsed: boolean;
  onExpandSidebar?: () => void; // Optional callback to expand sidebar when collapsed
}
