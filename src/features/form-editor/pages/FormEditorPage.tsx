import React from "react";
import { EditorProvider } from "@/form-editor/EditorContext";
import { EditorLayout } from "@/form-editor/EditorLayout";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/form-editor/components/ErrorBoundary";

export default function FormEditorPage() {
  return (
    <ErrorBoundary>
      <EditorProvider>
        <EditorLayout />
        <Toaster position="bottom-center" richColors />
      </EditorProvider>
    </ErrorBoundary>
  );
}
