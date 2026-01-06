// Dashboard Sidebar Navigation Configuration
import type { NavItem } from "@/shared/custom-ui/sidebar/Component/types";
import { Home, BarChart3, Users, Settings, FileText, Bell } from "lucide-react";

export const dashboardNavigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
    iconOutline: Home,
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/dashboard/analytics",
    icon: BarChart3,
    iconOutline: BarChart3,
  },
  {
    id: "users",
    label: "Users",
    path: "/dashboard/users",
    icon: Users,
    iconOutline: Users,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/dashboard/reports",
    icon: FileText,
    iconOutline: FileText,
  },
  {
    id: "notifications",
    label: "Notifications",
    path: "/dashboard/notifications",
    icon: Bell,
    iconOutline: Bell,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
    iconOutline: Settings,
  },
];
