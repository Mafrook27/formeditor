// ============================================================
// src/features/form-editor/components/EditorErrorBoundary.tsx
// ============================================================
import React from 'react';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

export class EditorErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[EditorErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  handleCopyState = () => {
    const state = localStorage.getItem('sparklms_editor_backup') ?? '{}';
    navigator.clipboard.writeText(state).then(() => {
      alert('Editor state copied to clipboard. Send this to support.');
    });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-slate-50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        <div className="max-w-sm">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            The editor ran into a problem
          </h2>
          <p className="text-sm text-slate-500">
            Your work may be recoverable. Try resetting the editor or copy your
            current state to send to support.
          </p>
          {this.state.error && (
            <pre className="mt-3 rounded bg-red-50 p-3 text-left text-xs text-red-700 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw size={14} />
            Reset Editor
          </button>
          <button
            onClick={this.handleCopyState}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download size={14} />
            Copy State
          </button>
        </div>
      </div>
    );
  }
}


// ============================================================
// src/shared/components/PageLoader.tsx
// ============================================================
export function PageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-200 opacity-75" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10h14M10 3l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">Loading SparkLMS...</p>
      </div>
    </div>
  );
}


// ============================================================
// src/app/router.tsx  (updated with lazy loading)
// ============================================================
// import { lazy, Suspense } from 'react';
// import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
// import { PageLoader } from '@/shared/components/PageLoader';
// import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
//
// const LoginPage      = lazy(() => import('@/features/auth/pages/LoginPage'));
// const DashboardPage  = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
// const FormEditorPage = lazy(() => import('@/features/form-editor/pages/FormEditorPage'));
// const NotFoundPage   = lazy(() => import('@/app/pages/NotFoundPage'));
//
// const router = createBrowserRouter([
//   { path: '/login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
//   {
//     path: '/',
//     element: <ProtectedRoute />,
//     children: [
//       { index: true, element: <Navigate to="/dashboard" replace /> },
//       { path: 'dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
//       { path: 'form-editor', element: <Suspense fallback={<PageLoader />}><FormEditorPage /></Suspense> },
//     ],
//   },
//   { path: '*', element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense> },
// ]);
//
// export function AppRouter() {
//   return <RouterProvider router={router} />;
// }


// ============================================================
// vite.config.ts (updated)
// ============================================================
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite';
// import path from 'path';
//
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: { '@': path.resolve(__dirname, './src') },
//   },
//   build: {
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
//           'vendor-dnd':    ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/modifiers'],
//           'vendor-radix':  [
//             '@radix-ui/react-dialog', '@radix-ui/react-tabs',
//             '@radix-ui/react-slider', '@radix-ui/react-switch',
//             '@radix-ui/react-select', '@radix-ui/react-checkbox',
//             '@radix-ui/react-tooltip', '@radix-ui/react-popover',
//           ],
//           'vendor-editor': ['dompurify', 'uuid'],
//         },
//       },
//     },
//     chunkSizeWarningLimit: 600,
//   },
// });
