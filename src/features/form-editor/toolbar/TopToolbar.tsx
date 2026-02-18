import React, { useCallback, useRef, useState } from 'react';
import { useEditor } from '../EditorContext';
import { exportToHTML } from '../export/exportToHTML';
import { parseHTML } from '../parser';
import { Undo2, Redo2, Eye, EyeOff, Download, ZoomIn, ZoomOut, FileCode, Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { mockAgreementHTML, mockSimpleFormHTML, mockRichTextHTML, mockLoanAgreementHTML } from '@/data/mockData';

export function TopToolbar() {
  const { state, undo, redo, togglePreview, setZoom, dispatch } = useEditor();
  const { isPreviewMode, zoom, historyIndex, history } = state;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExport = useCallback(() => {
    const html = exportToHTML(state.sections);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agreement-form.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exported successfully!');
  }, [state.sections]);

  const handlePreviewInTab = useCallback(() => {
    const html = exportToHTML(state.sections);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [state.sections]);
  
  const importHTML = useCallback((html: string) => {
    try {
      // New parser returns sections directly with proper structure
      const parsed = parseHTML(html);
      
      // Use sections from parser (preserves layout for editor-generated HTML)
      dispatch({ type: 'SET_SECTIONS', payload: parsed.sections });
      
      // Push to history so undo works
      setTimeout(() => {
        dispatch({ type: 'PUSH_HISTORY' });
      }, 0);
      
      toast.success(parsed.isEditorGenerated 
        ? 'HTML imported with layout preserved!' 
        : 'External HTML imported successfully!'
      );
      setShowImportDialog(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import HTML. Please check the file format.');
    }
  }, [dispatch]);
  
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const html = event.target?.result as string;
      importHTML(html);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  }, [importHTML]);
  
  const handleLoadMockData = useCallback((type: 'agreement' | 'simple' | 'rich' | 'loan') => {
    const templates = {
      agreement: mockAgreementHTML,
      simple: mockSimpleFormHTML,
      rich: mockRichTextHTML,
      loan: mockLoanAgreementHTML,
    };
    importHTML(templates[type]);
  }, [importHTML]);

  return (
    <>
      <div className="flex items-center justify-between h-12 px-4 bg-editor-toolbar border-b border-editor-border">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <FileCode className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-heading font-semibold text-foreground">Form Editor</h1>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-xs text-muted-foreground">{isPreviewMode ? 'Preview Mode' : 'Edit Mode'}</span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={200}>
            {!isPreviewMode && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={!canUndo}><Undo2 className="h-4 w-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={!canRedo}><Redo2 className="h-4 w-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Redo (Ctrl+Y)</TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(50, zoom - 10))}><ZoomOut className="h-4 w-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Zoom Out</TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground w-10 text-center font-mono">{zoom}%</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(150, zoom + 10))}><ZoomIn className="h-4 w-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Zoom In</TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" className="h-5 mx-1" />
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={isPreviewMode ? 'default' : 'ghost'} size="sm" className="h-8 gap-1.5 text-xs" onClick={togglePreview}>
                  {isPreviewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {isPreviewMode ? 'Exit Preview' : 'Preview'}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Toggle preview mode</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileImport}
            className="hidden"
          />
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-3.5 w-3.5" /> Import HTML
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Import HTML file or template</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handlePreviewInTab}>
                  <Eye className="h-3.5 w-3.5" /> Open Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Preview in new tab</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" /> Export HTML
          </Button>
        </div>
      </div>
      
      {/* Import Dialog - Custom Implementation */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowImportDialog(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <button 
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              onClick={() => setShowImportDialog(false)}
            >
              <X className="h-4 w-4" />
            </button>
            
            <h2 className="text-lg font-semibold mb-2">Import HTML</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Import an HTML file or load a template to start editing.
            </p>
            
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowImportDialog(false);
                }}
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Upload HTML File</div>
                  <div className="text-xs text-muted-foreground">Import .html or .htm files</div>
                </div>
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or load a template</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleLoadMockData('loan')}
                >
                  <FileText className="h-5 w-5 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-medium">FinTech Loan Agreement</div>
                    <div className="text-xs text-muted-foreground">External HTML with PH@ placeholders, SIGN buttons, tables</div>
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleLoadMockData('agreement')}
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Financial Agreement</div>
                    <div className="text-xs text-muted-foreground">Complex form with tables, inputs, and signatures</div>
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleLoadMockData('simple')}
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Simple Contact Form</div>
                    <div className="text-xs text-muted-foreground">Basic form with name, email, and message</div>
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleLoadMockData('rich')}
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Rich Text Content</div>
                    <div className="text-xs text-muted-foreground">Headings, styled text, lists, and images</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
