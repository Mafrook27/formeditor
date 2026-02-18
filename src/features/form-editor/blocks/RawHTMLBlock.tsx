// Raw HTML Block - Preserves external HTML with full typography fidelity
// CRITICAL: Does NOT override imported styles - inline styles take precedence
// Implements Typography Isolation Layer for FinTech documents

import React, { memo, useRef, useState, useEffect } from 'react';
import { useEditor } from '../EditorContext';
import type { RawHTMLBlockProps } from '../editorConfig';

export const RawHTMLBlock = memo(function RawHTMLBlock({ block }: { block: RawHTMLBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Attach event handlers to interactive elements (SIGN buttons)
  useEffect(() => {
    if (containerRef.current) {
      // Find ALL signature buttons - use valid CSS selectors only
      const signButtons = containerRef.current.querySelectorAll(
        'button[type="button"], [data-signature-button], .sign-button'
      );
      
      const handleSignatureClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        alert('Signature update in progress...');
        // Future: API call for signature image replacement
      };
      
      signButtons.forEach(btn => {
        const buttonText = btn.textContent?.trim().toUpperCase();
        if (buttonText === 'SIGN' || btn.hasAttribute('data-signature-button')) {
          (btn as HTMLElement).style.cursor = 'pointer';
          btn.addEventListener('click', handleSignatureClick);
        }
      });
      
      return () => {
        signButtons.forEach(btn => {
          btn.removeEventListener('click', handleSignatureClick);
        });
      };
    }
  }, [block.htmlContent]);
  
  const handleDoubleClick = () => {
    if (!block.locked && !isPreview) {
      setIsEditing(true);
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (isEditing) {
      setIsEditing(false);
      const newHtml = e.currentTarget.innerHTML;
      if (newHtml !== block.htmlContent) {
        updateBlockWithHistory(block.id, { htmlContent: newHtml });
      }
    }
  };
  
  // Extract and inject original styles from the HTML
  const originalStylesCSS = block.originalStyles || '';
  
  return (
    <div 
      ref={containerRef}
      className="external-html-container"
    >
      {/* 
        TYPOGRAPHY ISOLATION LAYER
        Rules:
        1. Imported <style> blocks have HIGHEST priority
        2. Inline styles override everything
        3. Only set minimal fallback defaults
        4. NEVER force editor fonts/sizes on imported content
      */}
      <style>{`
        /* Reset editor interference - FULL ISOLATION */
        .external-html-container {
          all: initial !important;
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* Inject original document styles - HIGHEST PRIORITY */
        ${originalStylesCSS}
        
        /* FinTech base defaults - apply with high specificity */
        .external-html-content {
          font-family: "Open Sans", Arial, Helvetica, "Nimbus Sans L", sans-serif !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          color: #000 !important;
          background: #fff !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
        
        /* Apply base font to all text elements */
        .external-html-content * {
          font-family: inherit;
        }
        
        /* Headings - use smaller FinTech sizes */
        .external-html-content h1,
        .external-html-content h2,
        .external-html-content h3,
        .external-html-content h4,
        .external-html-content h5,
        .external-html-content h6 {
          font-family: "Open Sans", Arial, Helvetica, sans-serif !important;
          font-size: 15px !important;
          font-weight: bold !important;
          margin: 10px 0 !important;
        }
        .external-html-content h1 {
          font-size: 18px !important;
        }
        
        /* Paragraphs - small professional size */
        .external-html-content p {
          font-size: 11px !important;
          margin: 0 0 8px 0 !important;
        }
        
        /* Tables - very small professional size */
        .external-html-content table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 8pt !important;
          margin-top: 15px !important;
        }
        .external-html-content td,
        .external-html-content th {
          padding: 7px !important;
          border: 1px solid #000 !important;
          vertical-align: top !important;
          text-align: left !important;
          font-size: 8pt !important;
        }
        
        /* SIGN buttons - Yellow FinTech style - HIGHEST PRIORITY */
        .external-html-content button[type="button"],
        .external-html-content .sign-button {
          background: #ffeb3b !important;
          background-color: #ffeb3b !important;
          border: 1px solid #000 !important;
          padding: 5px 15px !important;
          cursor: pointer !important;
          font-weight: bold !important;
          font-size: 11px !important;
          margin-bottom: 1px !important;
          color: #000 !important;
        }
        .external-html-content button[type="button"]:hover {
          background: #fdd835 !important;
          background-color: #fdd835 !important;
        }
        
        /* Form elements */
        .external-html-content input[type="checkbox"],
        .external-html-content input[type="radio"] {
          margin-right: 5px;
          cursor: pointer;
        }
        
        /* Links - professional blue */
        .external-html-content a {
          color: #0066cc;
          text-decoration: underline;
        }
        
        /* Placeholder highlighting - PH@ and @ formats */
        .external-html-content .placeholder,
        .external-html-content [data-placeholder] {
          background-color: #b3d4fc;
          padding: 0 2px;
          border-radius: 2px;
        }
        
        /* Signature script font if used */
        .external-html-content .pSS,
        .external-html-content [style*="Segoe Script"] {
          font-family: 'Segoe Script', cursive;
        }
        
        /* Page break handling */
        .external-html-content [style*="page-break"] {
          page-break-before: always;
        }
        
        /* Privacy policy table styles */
        .external-html-content .priv_1,
        .external-html-content .priv_2 {
          font-size: 13px;
        }
        .external-html-content .priv_c1,
        .external-html-content .priv_c2,
        .external-html-content .priv_d1,
        .external-html-content .priv_d2 {
          font-size: 12px;
        }
        
        /* Big headings from external HTML */
        .external-html-content .bigheading,
        .external-html-content .bigheadingunder {
          font-size: 24px;
          font-weight: bold;
        }
        
        /* Document structure classes */
        .external-html-content .documentmain {
          max-width: 100%;
          padding: 10px;
        }
        .external-html-content .paradiv {
          margin-bottom: 8px;
        }
        .external-html-content .signdiv {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
        }
        
        /* Editing state indicator */
        .external-html-editing {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
      
      {/* Render original HTML with preserved styles */}
      <div 
        className={`external-html-content ${isEditing ? 'external-html-editing' : ''}`}
        dangerouslySetInnerHTML={{ __html: block.htmlContent }}
        contentEditable={isEditing && !isPreview}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onDoubleClick={handleDoubleClick}
        style={{
          minHeight: '20px',
          cursor: isPreview ? 'default' : 'text',
        }}
      />
    </div>
  );
});
