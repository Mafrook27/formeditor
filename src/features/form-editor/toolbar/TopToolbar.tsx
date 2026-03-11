// Import React tools we need
import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
// Get access to our editor's state and functions
import { useEditor } from "../EditorContext";
// Tools to convert our form to HTML and read HTML files
import { exportToHTML } from "../export";
import { parseHTML } from "../parser";
// Import icons for our buttons
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Download,
  ZoomIn,
  ZoomOut,
  FileCode,
  Upload,
  X,
} from "lucide-react";
// Import UI components (buttons, tooltips, etc.)
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
// Import toast notifications (those little popup messages)
import { toast } from "sonner";
import editorStyles from "../editor.module.css";

// Define what props this toolbar can receive
interface TopToolbarProps {
  viewport?: "desktop" | "tablet" | "mobile"; // Which screen size we're showing
  onViewportChange?: (viewport: "desktop" | "tablet" | "mobile") => void; // Function to change screen size
}

export function TopToolbar({
  viewport = "desktop", // Default to desktop view
  onViewportChange,
}: TopToolbarProps) {
  // Get the editor's current state and functions we can use
  const { state, undo, redo, togglePreview, setZoom, dispatch } = useEditor();
  const { isPreviewMode, zoom, historyIndex, history } = state;
  
  // Check if we can undo (are there previous actions?)
  const canUndo = historyIndex > 0;
  // Check if we can redo (did we undo something?)
  const canRedo = historyIndex < history.length - 1;
  
  // Create a reference to the hidden file input (for uploading HTML files)
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track whether the import dialog is open or closed
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Function to export the form as an HTML file
  const handleExport = useCallback(() => {
    try {
      // Step 1: Convert our form sections into HTML code
      const html = exportToHTML(state.sections);
      
      // Step 2: Create a file from the HTML code
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      
      // Step 3: Create a download link and click it automatically
      const a = document.createElement("a");
      a.href = url;
      a.download = `agreement-form-${Date.now()}.html`; // Name the file with current timestamp
      document.body.appendChild(a);
      a.click(); // Trigger the download
      
      // Step 4: Clean up - remove the link and free up memory
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show a success message to the user
      toast.success("Export Successful", {
        description: "Your form has been downloaded as an HTML file.",
        duration: 3000,
      });
    } catch (error) {
      // If something goes wrong, show an error message
      console.error("Export failed:", error);
      toast.error("Export Failed", {
        description:
          "There was an error exporting your form. Please try again.",
        duration: 4000,
      });
    }
  }, [state.sections]); // Re-create this function only when sections change

  // Function to open the form in a new browser tab (for full-screen preview)
  const handlePreviewInTab = useCallback(() => {
    try {
      // Convert form to HTML
      const html = exportToHTML(state.sections);
      // Create a temporary file
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      // Open it in a new tab
      window.open(url, "_blank");

      // Show success message
      toast.success("Preview Opened", {
        description: "Your form preview has been opened in a new tab.",
        duration: 2000,
      });
    } catch (error) {
      // Show error if something goes wrong
      console.error("Preview failed:", error);
      toast.error("Preview Failed", {
        description: "There was an error generating the preview.",
        duration: 4000,
      });
    }
  }, [state.sections]); // Re-create when sections change

  // Function to import HTML and convert it to our editor format
  const importHTML = useCallback(
    (html: string) => {
      try {
        // Step 1: Parse the HTML code and convert it to our block structure
        const parsed = parseHTML(html);

        // Step 2: Check if we got any content
        if (!parsed || !parsed.sections || parsed.sections.length === 0) {
          toast.warning("No Content Found", {
            description:
              "The HTML file appears to be empty or contains no valid content.",
            duration: 4000,
          });
          return;
        }

        // Step 3: Replace current editor content with imported sections
        dispatch({ type: "SET_SECTIONS", payload: parsed.sections });

        // Step 4: Save to history so user can undo if needed
        // We use setTimeout to let the state update first
        setTimeout(() => {
          dispatch({ type: "PUSH_HISTORY" });
        }, 0);

        // Step 5: Count how many sections and blocks we imported
        const sectionCount = parsed.sections.length;
        const blockCount = parsed.sections.reduce(
          (sum, s) =>
            sum + s.blocks.reduce((bSum, col) => bSum + col.length, 0),
          0,
        );

        // Step 6: Show success message with details
        toast.success("Import Successful", {
          description: parsed.isEditorGenerated
            ? `Imported ${sectionCount} sections / ${blockCount} blocks (layout preserved)`
            : `Imported ${sectionCount} sections / ${blockCount} blocks from HTML`,
          duration: 4000,
        });

        // Close the import dialog
        setShowImportDialog(false);
      } catch (error) {
        // If import fails, show error message
        console.error("Import error:", error);
        toast.error("Import Failed", {
          description:
            error instanceof Error
              ? error.message
              : "Failed to parse HTML. Please check the file format.",
          duration: 5000,
        });
      }
    },
    [dispatch],
  );

  // Function to handle when user selects a file to import
  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Get the file user selected
      const file = e.target.files?.[0];
      if (!file) return; // Exit if no file selected

      // Step 1: Check if file is HTML (must end with .html or .htm)
      if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
        toast.error("Invalid File Type", {
          description: "Please select an HTML file (.html or .htm).",
          duration: 4000,
        });
        e.target.value = ""; // Clear the file input
        return;
      }

      // Step 2: Show loading message while we read the file
      const loadingToast = toast.loading("Importing HTML...", {
        description: "Please wait while we process your file.",
      });

      // Step 3: Read the file content
      const reader = new FileReader();
      
      // When file is successfully read
      reader.onload = (event) => {
        toast.dismiss(loadingToast); // Hide loading message
        const html = event.target?.result as string; // Get the HTML content
        importHTML(html); // Import the HTML into editor
      };
      
      // If file reading fails
      reader.onerror = () => {
        toast.dismiss(loadingToast); // Hide loading message
        toast.error("File Read Error", {
          description: "There was an error reading the file. Please try again.",
          duration: 4000,
        });
      };
      
      // Start reading the file as text
      reader.readAsText(file);

      // Step 4: Clear the file input so user can import same file again if needed
      e.target.value = "";
    },
    [importHTML],
  );

  return (
    <>
      <div className="flex items-center justify-between h-14 px-6 bg-editor-toolbar border-b border-editor-border shadow-sm">
        {/* Left - Enhanced branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <FileCode className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-heading font-semibold text-foreground">
                Form Editor
              </h1>
              <p className="text-xs text-muted-foreground">
                {isPreviewMode ? "Preview Mode" : "Edit Mode"}
              </p>
            </div>
          </div>
        </div>

        {/* Center - Enhanced controls with keyboard shortcuts */}
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={200}>
            {!isPreviewMode && (
              <>
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-secondary/80"
                        onClick={undo}
                        disabled={!canUndo}
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      <div className="flex items-center gap-2">
                        <span>Undo</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">
                          ⌘Z
                        </kbd>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-secondary/80"
                        onClick={redo}
                        disabled={!canRedo}
                      >
                        <Redo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      <div className="flex items-center gap-2">
                        <span>Redo</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">
                          ⌘Y
                        </kbd>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <Separator orientation="vertical" className="h-6 mx-2" />
                
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-secondary/80"
                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Zoom Out</TooltipContent>
                  </Tooltip>
                  <div className="px-3 py-1 text-xs text-muted-foreground font-mono bg-background rounded border min-w-[50px] text-center">
                    {zoom}%
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-secondary/80"
                        onClick={() => setZoom(Math.min(150, zoom + 10))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Zoom In</TooltipContent>
                  </Tooltip>
                </div>
                
                <Separator orientation="vertical" className="h-6 mx-2" />
              </>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPreviewMode ? "default" : "secondary"}
                  size="sm"
                  className={cn(
                    "h-9 gap-2 px-4 text-xs font-medium shadow-sm",
                    editorStyles.hoverLift,
                  )}
                  onClick={togglePreview}
                >
                  {isPreviewMode ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {isPreviewMode ? "Exit Preview" : "Preview"}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                Toggle preview mode
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Enhanced viewport selector */}
          {isPreviewMode && onViewportChange && (
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 ml-3">
              {[
                { id: "desktop" as const, label: "Desktop", width: "100%" },
                { id: "tablet" as const, label: "Tablet", width: "768px" },
                { id: "mobile" as const, label: "Mobile", width: "375px" },
              ].map(({ id, label, width }) => (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onViewportChange(id)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium ${
                        viewport === id
                          ? "bg-card shadow-sm text-foreground border border-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {label} ({width})
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* Right - Enhanced action buttons */}
        <div className="flex items-center gap-3">
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
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-2 text-xs font-medium",
                    editorStyles.hoverLift,
                  )}
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="h-4 w-4" /> Import
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                Import HTML file or template
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 gap-2 text-xs font-medium",
                    editorStyles.hoverLift,
                  )}
                  onClick={handlePreviewInTab}
                >
                  <Eye className="h-4 w-4" /> Open Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                Preview in new tab
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            size="sm"
            className={cn(
              "h-9 gap-2 text-xs font-medium shadow-sm",
              editorStyles.hoverLift,
            )}
            onClick={handleExport}
          >
            <Download className="h-4 w-4" /> Export HTML
          </Button>
        </div>
      </div>

      {/* Enhanced Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowImportDialog(false)}
          />
          <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border border-border">
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary/50 transition-colors"
              onClick={() => setShowImportDialog(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Import HTML</h2>
              <p className="text-sm text-muted-foreground">
                Import an existing HTML file to continue editing or use as a starting point.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className={cn(
                  "h-14 w-full justify-start gap-3",
                  editorStyles.hoverLift,
                )}
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowImportDialog(false);
                }}
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Upload HTML File</div>
                  <div className="text-xs text-muted-foreground">
                    Import .html or .htm files from your computer
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
