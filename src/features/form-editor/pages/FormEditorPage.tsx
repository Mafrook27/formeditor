import React from "react";
import { EditorProvider, EditorLayout } from "..";
import { Toaster } from "sonner";
import { ErrorBoundary } from "../components";

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
