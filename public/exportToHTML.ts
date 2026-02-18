// HTML Serializer - Converts editor blocks back to clean HTML
// Adds layout metadata for stable re-import
// Preserves original formatting and typography

import { BLOCK_TYPES, type EditorBlock, type EditorSection, type TableBlockProps, type ListBlockProps, type ButtonBlockProps, type SignatureBlockProps, type RawHTMLBlockProps } from '../editorConfig';

// Metadata attributes for re-import
const EDITOR_METADATA_ATTR = 'data-editor-layout';
const EDITOR_SECTION_ATTR = 'data-section';
const EDITOR_COLUMN_ATTR = 'data-column';

function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Preserve @ placeholders with highlighting
function preservePlaceholders(str: string): string {
  if (!str) return '';
  // Match PH@ style placeholders and @ style placeholders
  const parts = str.split(/((?:PH)?@\w+)/g);
  return parts.map(part => {
    if (part.match(/^(?:PH)?@\w+$/)) {
      return `<span class="placeholder" style="background-color: #b3d4fc; padding: 0 2px;">${escapeHtml(part)}</span>`;
    }
    return escapeHtml(part);
  }).join('');
}

function renderBlockHTML(block: EditorBlock): string {
  const margin = `margin-top: ${block.marginTop || 0}px; margin-bottom: ${block.marginBottom || 0}px;`;

  switch (block.type) {
    case BLOCK_TYPES.RAW_HTML: {
      // Output raw HTML directly - preserves original structure
      const rawBlock = block as RawHTMLBlockProps;
      return rawBlock.htmlContent;
    }
    
    case BLOCK_TYPES.HEADING: {
      const tag = block.level || 'h2';
      const color = block.color ? `color: ${block.color};` : '';
      const content = preservePlaceholders(block.content);
      return `<${tag} data-block-type="heading" data-level="${tag}" data-font-size="${block.fontSize}" data-font-weight="${block.fontWeight}" data-align="${block.textAlign}" data-line-height="${block.lineHeight}" style="font-size: ${block.fontSize}px; font-weight: ${block.fontWeight}; text-align: ${block.textAlign}; line-height: ${block.lineHeight}; ${color} ${margin}">${content}</${tag}>`;
    }
    
    case BLOCK_TYPES.PARAGRAPH: {
      const color = block.color ? `color: ${block.color};` : '';
      const content = preservePlaceholders(block.content);
      return `<p data-block-type="paragraph" data-font-size="${block.fontSize}" data-font-weight="${block.fontWeight}" data-align="${block.textAlign}" data-line-height="${block.lineHeight}" style="font-size: ${block.fontSize}px; font-weight: ${block.fontWeight}; text-align: ${block.textAlign}; line-height: ${block.lineHeight}; ${color} ${margin}">${content}</p>`;
    }
    
    case BLOCK_TYPES.DIVIDER:
      return `<hr data-block-type="divider" style="border: none; border-top: ${block.thickness}px ${block.style} ${block.color || '#000000'}; ${margin}" />`;
    
    case BLOCK_TYPES.IMAGE:
      return `<div data-block-type="image" style="${margin}"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" style="max-width: 100%; border-radius: ${block.borderRadius}px; max-height: ${block.maxHeight}px; display: block; margin: 0 auto;" /></div>`;
    
    case BLOCK_TYPES.TEXT_INPUT:
      return `<div data-block-type="text-input" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>
  <input type="text" id="${block.fieldName}" name="${block.fieldName}" placeholder="${escapeHtml(block.placeholder)}"${block.required ? ' required' : ''} style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" />
</div>`;
    
    case BLOCK_TYPES.TEXTAREA:
      return `<div data-block-type="textarea" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>
  <textarea id="${block.fieldName}" name="${block.fieldName}" rows="${block.rows}" placeholder="${escapeHtml(block.placeholder)}"${block.required ? ' required' : ''} style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
</div>`;
    
    case BLOCK_TYPES.DROPDOWN:
      return `<div data-block-type="dropdown" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>
  <select id="${block.fieldName}" name="${block.fieldName}"${block.required ? ' required' : ''} style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; background: white;">
    <option value="">Select an option...</option>
    ${(block.options || []).map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('\n    ')}
  </select>
</div>`;
    
    case BLOCK_TYPES.RADIO_GROUP:
      return `<fieldset data-block-type="radio-group" style="${margin}">
  <legend style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ''}</legend>
  <div style="display: flex; flex-direction: ${block.layout === 'horizontal' ? 'row' : 'column'}; gap: 8px;">
    ${(block.options || []).map((opt, i) => `<label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer;"><input type="radio" name="${block.fieldName}" value="${escapeHtml(opt)}"${block.required && i === 0 ? ' required' : ''} /> ${escapeHtml(opt)}</label>`).join('\n    ')}
  </div>
</fieldset>`;
    
    case BLOCK_TYPES.CHECKBOX_GROUP:
      return `<fieldset data-block-type="checkbox-group" style="${margin}">
  <legend style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ''}</legend>
  <div style="display: flex; flex-direction: ${block.layout === 'horizontal' ? 'row' : 'column'}; gap: 8px;">
    ${(block.options || []).map(opt => `<label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer;"><input type="checkbox" name="${block.fieldName}" value="${escapeHtml(opt)}" /> ${escapeHtml(opt)}</label>`).join('\n    ')}
  </div>
</fieldset>`;
    
    case BLOCK_TYPES.SINGLE_CHECKBOX:
      return `<div data-block-type="single-checkbox" style="${margin}">
  <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 14px; cursor: pointer; line-height: 1.5;">
    <input type="checkbox" name="${block.fieldName}"${block.required ? ' required' : ''} style="margin-top: 4px; flex-shrink: 0;" />
    <span>${preservePlaceholders(block.label)}</span>
  </label>
</div>`;
    
    case BLOCK_TYPES.DATE_PICKER:
      return `<div data-block-type="date-picker" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>
  <input type="date" id="${block.fieldName}" name="${block.fieldName}"${block.required ? ' required' : ''} style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" />
</div>`;
    
    case BLOCK_TYPES.FILE_UPLOAD:
      return `<div data-block-type="file-upload" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>
  <input type="file" id="${block.fieldName}" name="${block.fieldName}"${block.required ? ' required' : ''}${block.acceptTypes ? ` accept="${block.acceptTypes}"` : ''}${block.multiple ? ' multiple' : ''} style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" />
</div>`;
    
    case BLOCK_TYPES.SIGNATURE: {
      // Signature as a simple button (NOT editable block)
      const sigBlock = block as SignatureBlockProps;
      return `<div data-block-type="signature" class="signature-area" style="${margin}">
  <button type="button" data-signature-button class="sign-button" style="background: #ffeb3b; border: 1px solid #000; padding: 4px 16px; cursor: pointer; font-weight: bold; font-size: 12px;">SIGN</button>
  <span style="margin-left: 8px;">${preservePlaceholders(sigBlock.label)}</span>
  ${sigBlock.signatureUrl ? `<img class="signature-image" src="${escapeHtml(sigBlock.signatureUrl)}" alt="Signature" style="max-height: 50px; margin-left: 8px;" />` : ''}
</div>`;
    }
    
    case BLOCK_TYPES.TABLE: {
      const tableBlock = block as TableBlockProps;
      const rows = tableBlock.rows || [];
      let tableHtml = '<table data-block-type="table" style="width: 100%; border-collapse: collapse; margin: 8px 0;">\n';
      
      rows.forEach((row, rowIdx) => {
        const isHeader = tableBlock.headerRow && rowIdx === 0;
        const rowTag = isHeader ? 'th' : 'td';
        
        if (isHeader) tableHtml += '  <thead>\n';
        if (rowIdx === 1 && tableBlock.headerRow) tableHtml += '  <tbody>\n';
        if (rowIdx === 0 && !tableBlock.headerRow) tableHtml += '  <tbody>\n';
        
        tableHtml += `    <tr>\n`;
        row.forEach(cell => {
          tableHtml += `      <${rowTag} style="padding: 8px; border: 1px solid #000;${isHeader ? ' font-weight: bold;' : ''}">${preservePlaceholders(cell)}</${rowTag}>\n`;
        });
        tableHtml += '    </tr>\n';
        
        if (isHeader) tableHtml += '  </thead>\n';
      });
      
      tableHtml += '  </tbody>\n</table>';
      return tableHtml;
    }
    
    case BLOCK_TYPES.LIST: {
      const listBlock = block as ListBlockProps;
      const tag = listBlock.listType === 'ordered' ? 'ol' : 'ul';
      const listStyle = listBlock.listType === 'ordered' ? 'list-style-type: decimal;' : 'list-style-type: disc;';
      
      let listHtml = `<${tag} data-block-type="list" style="${listStyle} margin-left: 24px; ${margin}">\n`;
      (listBlock.items || []).forEach(item => {
        listHtml += `  <li style="padding: 4px 0;">${preservePlaceholders(item)}</li>\n`;
      });
      listHtml += `</${tag}>`;
      return listHtml;
    }
    
    case BLOCK_TYPES.BUTTON: {
      const btnBlock = block as ButtonBlockProps;
      const variantStyles: Record<string, string> = {
        primary: 'background-color: #3b82f6; color: white; border: none;',
        secondary: 'background-color: #f1f5f9; color: #1e293b; border: none;',
        outline: 'background-color: transparent; color: #1e293b; border: 1px solid #e2e8f0;',
      };
      
      return `<button data-block-type="button" type="${btnBlock.buttonType}" style="padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; ${variantStyles[btnBlock.variant] || variantStyles.primary} ${margin}">${escapeHtml(btnBlock.label)}</button>`;
    }
    
    default:
      return `<div style="${margin}">Unknown block type</div>`;
  }
}

function renderSectionHTML(section: EditorSection): string {
  const sectionAttr = `${EDITOR_SECTION_ATTR}="true" ${EDITOR_METADATA_ATTR}="${section.columns}"`;
  
  if (section.columns === 1) {
    const blocks = section.blocks[0] || [];
    return `<div ${sectionAttr} style="margin-bottom: 16px;">
  <div ${EDITOR_COLUMN_ATTR}="0">
${blocks.map(b => '    ' + renderBlockHTML(b)).join('\n')}
  </div>
</div>`;
  }
  
  // Multi-column layout
  const colWidth = `${100 / section.columns}%`;
  const columns = section.blocks.map((col, idx) => 
    `  <div ${EDITOR_COLUMN_ATTR}="${idx}" style="width: ${colWidth}; padding: 0 8px; box-sizing: border-box;">
${col.map(b => '    ' + renderBlockHTML(b)).join('\n')}
  </div>`
  );
  
  return `<div ${sectionAttr} style="display: flex; gap: 0; margin-bottom: 16px;">
${columns.join('\n')}
</div>`;
}

// Client-side validation script
function generateValidationScript(): string {
  return `
<script>
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');
    if (!form) return;
    
    // Handle signature buttons
    var signButtons = document.querySelectorAll('[data-signature-button]');
    signButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        alert('Signature update in progress...');
        // Future: API call for signature
      });
    });
    
    form.addEventListener('submit', function(e) {
      var requiredFields = form.querySelectorAll('[required]');
      var firstInvalid = null;
      
      requiredFields.forEach(function(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        var isValid = true;
        if (field.type === 'checkbox') {
          isValid = field.checked;
        } else if (field.type === 'radio') {
          var name = field.name;
          var radios = form.querySelectorAll('input[name="' + name + '"]');
          isValid = Array.from(radios).some(function(r) { return r.checked; });
        } else {
          isValid = field.value.trim() !== '';
        }
        
        if (!isValid) {
          field.style.borderColor = '#ef4444';
          field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
          if (!firstInvalid) firstInvalid = field;
        }
      });
      
      if (firstInvalid) {
        e.preventDefault();
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
})();
</script>`;
}

export function exportToHTML(sections: EditorSection[]): string {
  const validationScript = generateValidationScript();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agreement Form</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      color: #000; 
      background: #fff;
      font-size: 12px;
      line-height: 1.4;
    }
    form { 
      max-width: 800px; 
      margin: 20px auto; 
      padding: 24px; 
      background: white;
    }
    /* Professional agreement styling */
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    td, th { padding: 8px; border: 1px solid #000; vertical-align: top; font-size: inherit; }
    p { margin: 0 0 8px 0; text-align: justify; }
    h1, h2, h3 { text-align: center; font-weight: bold; margin: 12px 0; }
    /* Form elements */
    input, select, textarea { 
      outline: none; 
      font-family: inherit; 
      font-size: inherit;
    }
    input:focus, select:focus, textarea:focus { 
      border-color: #3b82f6; 
      box-shadow: 0 0 0 2px rgba(59,130,246,0.2); 
    }
    fieldset { border: none; padding: 0; margin: 0; }
    /* Placeholder styling */
    .placeholder { 
      background-color: #b3d4fc; 
      padding: 0 2px; 
    }
    /* Signature button */
    .sign-button, [data-signature-button] {
      background: #ffeb3b;
      border: 1px solid #000;
      padding: 4px 16px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
    }
    .signature-area { display: flex; align-items: center; gap: 8px; }
    /* Links */
    a { color: #0066cc; text-decoration: underline; }
  </style>
</head>
<body>
  <form>
${sections.map(s => renderSectionHTML(s)).join('\n')}
  </form>
${validationScript}
</body>
</html>`;
}

// Export just the body content (for API compatibility)
export function exportBodyHTML(sections: EditorSection[]): string {
  return sections.map(s => renderSectionHTML(s)).join('\n');
}
