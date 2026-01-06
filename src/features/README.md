# Features Folder

This is where you create your application features.

## 📁 Recommended Structure

Each feature should follow this structure:

```
src/features/my-feature/
├── api/              # API calls and endpoints
│   └── myFeatureApi.ts
├── components/       # Feature-specific components
│   └── MyComponent.tsx
├── hooks/            # Feature-specific hooks
│   └── useMyFeature.ts
├── pages/            # Feature pages
│   └── MyFeaturePage.tsx
├── types/            # TypeScript types
│   └── index.ts
└── routes.tsx        # Feature routes configuration
```

## 🚀 Example Feature

### Create a new feature:

```bash
mkdir -p src/features/dashboard/{api,components,hooks,pages,types}
```

### Create routes file:

```tsx
// src/features/dashboard/routes.tsx
import { RouteObject } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";

export const dashboardRoutes: RouteObject = {
  path: "dashboard",
  element: <DashboardPage />,
};
```

### Add to main router:

```tsx
// src/app/router.tsx
import { dashboardRoutes } from "@/features/dashboard/routes";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      dashboardRoutes, // Add your feature routes
    ],
  },
]);
```
