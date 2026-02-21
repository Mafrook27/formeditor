import React from 'react';
import { EditorProvider } from '@/form-editor/EditorContext';
import { EditorLayout } from '@/form-editor/EditorLayout';
import { Toaster } from 'sonner';

export default function FormEditorPage() {
  return (
    <EditorProvider>
      <EditorLayout />
      <Toaster position="bottom-center" richColors />
    </EditorProvider>
  );
}
