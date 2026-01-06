import type { RouteObject } from "react-router-dom";
import { DashboardPage } from "./pages";
import DashboardLayout from "./layout/DashboardLayout";

export const dashboardRoutes: RouteObject = {
  path: "dashboard",
  element: <DashboardLayout />,
  children: [
    {
      index: true,
      element: <DashboardPage />,
    },
    // Add more dashboard routes here
    // {
    //   path: 'analytics',
    //   element: <AnalyticsPage />,
    // },
  ],
};
