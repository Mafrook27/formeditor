import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { NotFoundPage } from "./pages/NotFoundPage";

// Feature routes
import { authRoutes } from "@/features/auth/routes";
import { dashboardRoutes } from "@/features/dashboard/routes";

const router = createBrowserRouter([
  // Auth routes (login)
  authRoutes,

  // Protected Area
  {
    element: <AppLayout />,
    children: [
      // Feature routes
      dashboardRoutes,
    ],
  },

  // 404 Catch-all route - MUST be last
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
