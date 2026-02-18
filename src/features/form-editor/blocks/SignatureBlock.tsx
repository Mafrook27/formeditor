import React, { memo } from 'react';
import { useEditor } from '../EditorContext';
import { Button } from '@/components/ui/button';
import { PenTool } from 'lucide-react';
import type { SignatureBlockProps } from '../editorConfig';

export const SignatureBlock = memo(function SignatureBlock({ block }: { block: SignatureBlockProps }) {
  const { state } = useEditor();
  const isPreview = state.isPreviewMode;
  
  const handleSignClick = () => {
    if (isPreview) {
      alert('Signature feature is under progress');
    }
  };
  
  return (
    <div className="w-full flex justify-start">
      <Button 
        variant="outline" 
        className="gap-2 min-w-[120px] border-dashed border-2"
        onClick={handleSignClick}
      >
        <PenTool className="h-4 w-4" />
        {block.label || 'Sign Here'}
      </Button>
    </div>
  );
});
