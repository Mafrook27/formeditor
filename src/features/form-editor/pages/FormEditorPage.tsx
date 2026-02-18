import React from 'react';
import { EditorProvider } from '@/form-editor/EditorContext';
import { EditorLayout } from '@/form-editor/EditorLayout';

export default function FormEditorPage() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}
