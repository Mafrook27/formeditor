import {
  BLOCK_TYPES,
  type EditorBlock,
  type EditorSection,
  type TableBlockProps,
  type ListBlockProps,
  type ButtonBlockProps,
  type SignatureBlockProps,
  type RawHTMLBlockProps,
  type HeadingBlockProps,
  type ParagraphBlockProps,
} from "../editorConfig";
import {
  EDITOR_VERSION,
  EDITOR_VERSION_ATTR,
  EDITOR_SECTION_ATTR,
  EDITOR_COLUMN_ATTR,
  EDITOR_BLOCK_TYPE_ATTR,
  EDITOR_LAYOUT_ATTR,
} from "../parser/HTMLParser";

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function preservePlaceholders(str: string): string {
  if (!str) return "";
  const parts = str.split(/((?:PH)?@\w+)/g);
  return parts
    .map((part) => {
      if (part.match(/^(?:PH)?@\w+$/)) {
        return `<span class="placeholder" style="background-color: #b3d4fc; padding: 0 2px;">${escapeHtml(part)}</span>`;
      }
      return escapeHtml(part);
    })
    .join("");
}

function renderBlockHTML(block: EditorBlock): string {
  const margin = `margin-top: ${block.marginTop || 0}px; margin-bottom: ${block.marginBottom || 0}px; margin-left: ${block.marginLeft || 0}px; margin-right: ${block.marginRight || 0}px;`;
  const padding = `padding-left: ${block.paddingX || 0}px; padding-right: ${block.paddingX || 0}px; padding-top: ${block.paddingY || 0}px; padding-bottom: ${block.paddingY || 0}px;`;
  const b = block as any;
  const visualBg = b.backgroundColor
    ? `background-color: ${b.backgroundColor};`
    : "";
  const visualFont = b.fontFamily ? `font-family: ${b.fontFamily};` : "";
  const visualBorder = b.blockBorderWidth
    ? `border: ${b.blockBorderWidth}px ${b.blockBorderStyle || "solid"} ${b.blockBorderColor || "#e2e8f0"};`
    : "";
  const visualRadius = b.blockBorderRadius
    ? `border-radius: ${b.blockBorderRadius}px;`
    : "";
  const visualStyles = [visualBg, visualFont, visualBorder, visualRadius]
    .filter(Boolean)
    .join(" ");

  const commonAttrs = `data-builder="1" data-block-id="${block.id}" data-block-type="${block.type}" data-width="${block.width}" data-locked="${block.locked}" data-margin-top="${block.marginTop || 0}" data-margin-bottom="${block.marginBottom || 0}"`;

  switch (block.type) {
    case BLOCK_TYPES.RAW_HTML: {
      const rawBlock = block as RawHTMLBlockProps;
      return `<div ${commonAttrs} data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}">${rawBlock.htmlContent}</div>`;
    }

    case BLOCK_TYPES.HEADING: {
      const tag = block.level || "h2";
      const color = block.color ? `color: ${block.color};` : "";
      // Prefer htmlContent (preserves inline bold/italic/spans); fall back to escaped plain text
      const content =
        (block as any).htmlContent || preservePlaceholders(block.content);
      return `<${tag} ${commonAttrs} data-level="${tag}" data-font-size="${block.fontSize}" data-font-weight="${block.fontWeight}" data-align="${block.textAlign}" data-line-height="${block.lineHeight}" data-color="${block.color || ""}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" data-padding-x="${block.paddingX || 0}" data-padding-y="${block.paddingY || 0}" style="font-size: ${block.fontSize}px; font-weight: ${block.fontWeight}; text-align: ${block.textAlign}; line-height: ${block.lineHeight}; word-break: break-word; overflow-wrap: break-word; white-space: break-spaces; ${color} ${margin} ${padding} ${visualStyles}">${content}</${tag}>`;
    }

    case BLOCK_TYPES.PARAGRAPH: {
      const color = block.color ? `color: ${block.color};` : "";
      // Prefer htmlContent (preserves inline bold/italic/spans); fall back to escaped plain text
      const content =
        (block as any).htmlContent || preservePlaceholders(block.content);
      return `<p ${commonAttrs} data-font-size="${block.fontSize}" data-font-weight="${block.fontWeight}" data-align="${block.textAlign}" data-line-height="${block.lineHeight}" data-color="${block.color || ""}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" data-padding-x="${block.paddingX || 0}" data-padding-y="${block.paddingY || 0}" style="font-size: ${block.fontSize}px; font-weight: ${block.fontWeight}; text-align: ${block.textAlign}; line-height: ${block.lineHeight}; word-break: break-word; overflow-wrap: break-word; white-space: break-spaces; ${color} ${margin} ${padding} ${visualStyles}">${content}</p>`;
    }

    case BLOCK_TYPES.HYPERLINK: {
      const color = block.color ? `color: ${block.color};` : "color: #0066cc;";
      const textDecoration = block.underline
        ? "text-decoration: underline;"
        : "text-decoration: none;";
      const target = block.openInNewTab
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      return `<div ${commonAttrs} data-text="${escapeHtml(block.text)}" data-url="${escapeHtml(block.url)}" data-open-new-tab="${block.openInNewTab}" data-underline="${block.underline}" data-font-size="${block.fontSize}" data-font-weight="${block.fontWeight}" data-align="${block.textAlign}" data-line-height="${block.lineHeight}" data-color="${block.color || "#0066cc"}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" data-padding-x="${block.paddingX || 0}" data-padding-y="${block.paddingY || 0}" style="text-align: ${block.textAlign}; ${margin} ${padding}"><a href="${escapeHtml(block.url || "#")}"${target} style="font-size: ${block.fontSize}px; font-weight: ${block.fontWeight}; line-height: ${block.lineHeight}; word-break: break-word; overflow-wrap: break-word; white-space: break-spaces; ${color} ${textDecoration}">${escapeHtml(block.text || "Click here")}</a></div>`;
    }

    case BLOCK_TYPES.DIVIDER:
      return `<hr ${commonAttrs} data-thickness="${block.thickness}" data-style="${block.style}" data-color="${block.color || "#000000"}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="border: none; border-top: ${block.thickness}px ${block.style} ${block.color || "#000000"}; ${margin}" />`;

    case BLOCK_TYPES.IMAGE:
      return `<div ${commonAttrs} data-src="${escapeHtml(block.src)}" data-alt="${escapeHtml(block.alt)}" data-border-radius="${block.borderRadius}" data-max-height="${block.maxHeight}" data-alignment="${block.alignment}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" style="max-width: 100%; border-radius: ${block.borderRadius}px; max-height: ${block.maxHeight}px; display: block; margin: 0 auto;" /></div>`;

    case BLOCK_TYPES.TEXT_INPUT:
      return `<div ${commonAttrs} data-label="${escapeHtml(block.label)}" data-field-name="${block.fieldName}" data-placeholder="${escapeHtml(block.placeholder)}" data-required="${block.required}" data-validation="${block.validationType}" data-max-length="${block.maxLength || ""}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ""}</label>
  <input type="text" id="${block.fieldName}" name="${block.fieldName}" placeholder="${escapeHtml(block.placeholder)}"${block.required ? ' required aria-required="true"' : ""} style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" />
</div>`;

    case BLOCK_TYPES.TEXTAREA:
      return `<div ${commonAttrs} data-label="${escapeHtml(block.label)}" data-field-name="${block.fieldName}" data-placeholder="${escapeHtml(block.placeholder)}" data-required="${block.required}" data-rows="${block.rows}" data-max-length="${block.maxLength || ""}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ""}</label>
  <textarea id="${block.fieldName}" name="${block.fieldName}" rows="${block.rows}" placeholder="${escapeHtml(block.placeholder)}"${block.required ? ' required aria-required="true"' : ""} style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
</div>`;

    case BLOCK_TYPES.DROPDOWN:
      return `<div ${commonAttrs} data-label="${escapeHtml(block.label)}" data-field-name="${block.fieldName}" data-required="${block.required}" data-options="${escapeHtml(JSON.stringify(block.options || []))}" data-default-value="${escapeHtml(block.defaultValue || "")}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ""}</label>
  <select id="${block.fieldName}" name="${block.fieldName}"${block.required ? ' required aria-required="true"' : ""} style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; background: white;">
    <option value="">Select an option...</option>
    ${(block.options || []).map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join("\n    ")}
  </select>
</div>`;

    case BLOCK_TYPES.RADIO_GROUP:
      return `<fieldset ${commonAttrs} data-label="${escapeHtml(block.label)}" data-field-name="${block.fieldName}" data-required="${block.required}" data-options="${escapeHtml(JSON.stringify(block.options || []))}" data-layout="${block.layout}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}">
  <legend style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ""}</legend>
  <div style="display: flex; flex-direction: ${block.layout === "horizontal" ? "row" : "column"}; gap: 8px;">
    ${(block.options || []).map((opt, i) => `<label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer;"><input type="radio" name="${block.fieldName}" value="${escapeHtml(opt)}"${block.required && i === 0 ? ' required aria-required="true"' : ""} /> ${escapeHtml(opt)}</label>`).join("\n    ")}
  </div>
</fieldset>`;

    case BLOCK_TYPES.CHECKBOX_GROUP:
      return `<fieldset ${commonAttrs} data-label="${escapeHtml(block.label)}" data-field-name="${block.fieldName}" data-required="${block.required}" data-options="${escapeHtml(JSON.stringify(block.options || []))}" data-layout="${block.layout}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}">
  <legend style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ""}</legend>
  <div style="display: flex; flex-direction: ${block.layout === "horizontal" ? "row" : "column"}; gap: 8px;">
    ${(block.options || []).map((opt) => `<label style="display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer;"><input type="checkbox" name="${block.fieldName}" value="${escapeHtml(opt)}" /> ${escapeHtml(opt)}</label>`).join("\n    ")}
  </div>
</fieldset>`;

    case BLOCK_TYPES.SINGLE_CHECKBOX:
      return `<div ${commonAttrs} data-label="${escapeHtml(block.label)}" data-field-name="${block.fieldName}" data-required="${block.required}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}">
  <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 14px; cursor: pointer; line-height: 1.5;">
    <input type="checkbox" name="${block.fieldName}"${block.required ? ' required aria-required="true"' : ""} style="margin-top: 4px; flex-shrink: 0;" />
    <span>${preservePlaceholders(block.label)}</span>
  </label>
</div>`;

    case BLOCK_TYPES.DATE_PICKER:
      return `<div ${commonAttrs} data-label="${escapeHtml(block.label)}" data-field-name="${block.fieldName}" data-required="${block.required}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${margin}">
  <label for="${block.fieldName}" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${escapeHtml(block.label)}${block.required ? ' <span style="color: #ef4444;">*</span>' : ""}</label>
  <input type="date" id="${block.fieldName}" name="${block.fieldName}"${block.required ? ' required aria-required="true"' : ""} style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" />
</div>`;

    case BLOCK_TYPES.SIGNATURE: {
      const sigBlock = block as SignatureBlockProps;
      return `<div ${commonAttrs} id="${sigBlock.fieldName}" data-label="${escapeHtml(sigBlock.label)}" data-field-name="${sigBlock.fieldName}" data-required="${sigBlock.required}" data-signature-url="${escapeHtml(sigBlock.signatureUrl || "")}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" class="signature-area" style="${margin}">
  <div class="signature-display" style="display: none;"></div>
  <span class="sig-label">${preservePlaceholders(sigBlock.label || "Signature")}${sigBlock.required ? ' <span style="color:#ef4444;">*</span>' : ""}</span>
  <button type="button" data-signature-button data-field="${sigBlock.fieldName}" class="sign-button" aria-label="Sign: ${escapeHtml(sigBlock.label || "Signature")}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg> Sign</button>
  <input type="hidden" name="${sigBlock.fieldName}" value="" data-signature-value${sigBlock.required ? ' aria-required="true"' : ""} />
</div>`;
    }

    case BLOCK_TYPES.TABLE: {
      const tableBlock = block as TableBlockProps;
      const rows = tableBlock.rows || [];
      const colCount = rows[0]?.length || 1;
      const colWidths =
        tableBlock.columnWidths && tableBlock.columnWidths.length === colCount
          ? tableBlock.columnWidths
          : Array(colCount).fill(100 / colCount);
      let tableHtml = `<table ${commonAttrs} data-header-row="${tableBlock.headerRow}" data-rows="${escapeHtml(JSON.stringify(rows))}" data-column-widths="${escapeHtml(JSON.stringify(colWidths))}" data-row-heights="${escapeHtml(JSON.stringify(tableBlock.rowHeights || []))}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="width: 100%; border-collapse: collapse; table-layout: fixed; ${margin}">\n`;

      tableHtml += "  <colgroup>\n";
      colWidths.forEach((w) => {
        tableHtml += `    <col style="width: ${Math.round(w * 100) / 100}%;" />\n`;
      });
      tableHtml += "  </colgroup>\n";

      if (tableBlock.headerRow && rows.length > 0) {
        const headerHeight = tableBlock.rowHeights?.[0];
        tableHtml +=
          '  <thead>\n    <tr style="background-color: rgba(0,0,0,0.05);' +
          (headerHeight && headerHeight > 0
            ? " height: " + headerHeight + "px;"
            : "") +
          '">\n';
        rows[0].forEach((cell) => {
          tableHtml += `      <th style="padding: 8px; border: 1px solid #000; font-weight: bold; text-align: left; word-break: break-word; overflow-wrap: break-word; white-space: break-spaces;">${preservePlaceholders(cell)}</th>\n`;
        });
        tableHtml += "    </tr>\n  </thead>\n";
      }

      tableHtml += "  <tbody>\n";
      rows.slice(tableBlock.headerRow ? 1 : 0).forEach((row, rowIdx) => {
        const actualRowIdx = rowIdx + (tableBlock.headerRow ? 1 : 0);
        const bodyRowHeight = tableBlock.rowHeights?.[actualRowIdx];
        const rowStyles: string[] = [];
        if (rowIdx % 2 === 1)
          rowStyles.push("background-color: rgba(0,0,0,0.02)");
        if (bodyRowHeight && bodyRowHeight > 0)
          rowStyles.push("height: " + bodyRowHeight + "px");
        const bgColor =
          rowStyles.length > 0 ? ' style="' + rowStyles.join("; ") + ';"' : "";
        tableHtml += `    <tr${bgColor}>\n`;
        row.forEach((cell) => {
          tableHtml += `      <td style="padding: 8px; border: 1px solid #000; word-break: break-word; overflow-wrap: break-word; white-space: break-spaces;">${preservePlaceholders(cell)}</td>\n`;
        });
        tableHtml += "    </tr>\n";
      });
      tableHtml += "  </tbody>\n</table>";
      return tableHtml;
    }

    case BLOCK_TYPES.LIST: {
      const listBlock = block as ListBlockProps;
      const tag = listBlock.listType === "ordered" ? "ol" : "ul";
      const listStyle =
        listBlock.listType === "ordered"
          ? "list-style-type: decimal;"
          : "list-style-type: disc;";

      let listHtml = `<${tag} ${commonAttrs} data-list-type="${listBlock.listType}" data-items="${escapeHtml(JSON.stringify(listBlock.items || []))}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" style="${listStyle} margin-left: 24px; ${margin}">\n`;
      (listBlock.items || []).forEach((item) => {
        listHtml += `  <li style="padding: 4px 0;">${preservePlaceholders(item)}</li>\n`;
      });
      listHtml += `</${tag}>`;
      return listHtml;
    }

    case BLOCK_TYPES.BUTTON: {
      const btnBlock = block as ButtonBlockProps;
      const variantStyles: Record<string, string> = {
        primary: "background-color: #3b82f6; color: white; border: none;",
        secondary: "background-color: #f1f5f9; color: #1e293b; border: none;",
        outline:
          "background-color: transparent; color: #1e293b; border: 1px solid #e2e8f0;",
      };
      const btnId = btnBlock.buttonType === "submit" ? 'id="form-submit"' : "";

      return `<button ${commonAttrs} ${btnId} data-label="${escapeHtml(btnBlock.label)}" data-button-type="${btnBlock.buttonType}" data-variant="${btnBlock.variant}" data-margin-left="${block.marginLeft || 0}" data-margin-right="${block.marginRight || 0}" type="${btnBlock.buttonType}" style="padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; ${variantStyles[btnBlock.variant] || variantStyles.primary} ${margin}">${escapeHtml(btnBlock.label)}</button>`;
    }

    default:
      return `<div style="${margin}">Unknown block type</div>`;
  }
}

function renderSectionHTML(section: EditorSection): string {
  const sectionAttr = `${EDITOR_SECTION_ATTR}="true" ${EDITOR_LAYOUT_ATTR}="${section.columns}" data-section-id="${section.id}"`;
  const sectionGap = 24;
  const sectionPaddingTop = section.paddingTop ?? 12;
  const sectionPaddingRight = section.paddingRight ?? 12;
  const sectionPaddingBottom = section.paddingBottom ?? 12;
  const sectionPaddingLeft = section.paddingLeft ?? 12;
  const sectionColumnGap = section.columnGap ?? 24;
  const sectionBackground = section.backgroundColor || "";
  const sectionTextColor = section.textColor || "";
  const sectionDataAttrs = [
    `data-section-padding-top="${sectionPaddingTop}"`,
    `data-section-padding-right="${sectionPaddingRight}"`,
    `data-section-padding-bottom="${sectionPaddingBottom}"`,
    `data-section-padding-left="${sectionPaddingLeft}"`,
    `data-section-gap="${sectionColumnGap}"`,
    sectionBackground
      ? `data-section-bg="${escapeHtml(sectionBackground)}"`
      : "",
    sectionTextColor
      ? `data-section-text-color="${escapeHtml(sectionTextColor)}"`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  const sectionStyle = [
    `margin-bottom: ${sectionGap}px`,
    `padding: ${sectionPaddingTop}px ${sectionPaddingRight}px ${sectionPaddingBottom}px ${sectionPaddingLeft}px`,
    sectionBackground ? `background-color: ${sectionBackground}` : "",
    sectionTextColor ? `color: ${sectionTextColor}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  if (section.columns === 1) {
    const blocks = section.blocks[0] || [];
    return `<div ${sectionAttr} ${sectionDataAttrs} style="${sectionStyle}">
  <div ${EDITOR_COLUMN_ATTR}="0">
${blocks.map((b) => "    " + renderBlockHTML(b)).join("\n")}
  </div>
</div>`;
  }

  const colWidth = `${100 / section.columns}%`;
  const columns = section.blocks.map(
    (col, idx) =>
      `  <div ${EDITOR_COLUMN_ATTR}="${idx}" style="box-sizing: border-box;">
${col.map((b) => "    " + renderBlockHTML(b)).join("\n")}
  </div>`,
  );

  return `<div ${sectionAttr} ${sectionDataAttrs} style="display: grid; grid-template-columns: repeat(${section.columns}, 1fr); gap: ${sectionColumnGap}px; ${sectionStyle}">
${columns.join("\n")}
</div>`;
}

function generateFormScript(): string {
  return `
<script>
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');
    if (!form) return;

    // --- E-Sign Modal Flow ---
    var overlay = document.getElementById('esign-overlay');
    var reviewModal = document.getElementById('esign-review-modal');
    var adoptModal = document.getElementById('esign-adopt-modal');
    var agreeCheckbox = document.getElementById('esign-agree-checkbox');
    var continueBtn = document.getElementById('esign-continue-btn');
    var adoptBtn = document.getElementById('esign-adopt-btn');
    var cancelBtns = document.querySelectorAll('[data-esign-cancel]');
    var adoptedSigPreview = document.getElementById('esign-adopted-sig');
    var borrowerNameEl = document.getElementById('esign-borrower-name');
    var activeSignatureField = null;

    function getSignerName() {
      var firstEl = form.querySelector('[name*="irst"]') || form.querySelector('[name*="first"]');
      var lastEl = form.querySelector('[name*="ast"]') || form.querySelector('[name*="last"]');
      var firstName = (firstEl && firstEl.value) ? firstEl.value.trim() : 'Mafrook';
      var lastName = (lastEl && lastEl.value) ? lastEl.value.trim() : 'Doe';
      var fullNameEl = form.querySelector('[name*="full_name"]') || form.querySelector('[name*="name"]');
      if ((!firstEl || !firstEl.value) && fullNameEl && fullNameEl.value) {
        var parts = fullNameEl.value.trim().split(' ');
        firstName = parts[0] || 'Mafrook';
        lastName = parts.slice(1).join(' ') || 'Doe';
      }
      return { first: firstName, last: lastName, full: firstName + ' ' + lastName };
    }

    function openOverlay() { if (overlay) overlay.style.display = 'flex'; }
    function closeOverlay() {
      if (overlay) overlay.style.display = 'none';
      if (reviewModal) reviewModal.style.display = 'none';
      if (adoptModal) adoptModal.style.display = 'none';
      if (agreeCheckbox) agreeCheckbox.checked = false;
      if (continueBtn) continueBtn.disabled = true;
    }

    var signButtons = document.querySelectorAll('[data-signature-button]');
    signButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeSignatureField = btn.getAttribute('data-field');
        if (reviewModal) reviewModal.style.display = 'block';
        openOverlay();
      });
    });

    if (agreeCheckbox && continueBtn) {
      agreeCheckbox.addEventListener('change', function() {
        continueBtn.disabled = !agreeCheckbox.checked;
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', function() {
        if (!agreeCheckbox || !agreeCheckbox.checked) return;
        if (reviewModal) reviewModal.style.display = 'none';
        var signer = getSignerName();
        if (borrowerNameEl) borrowerNameEl.textContent = signer.full;
        if (adoptedSigPreview) adoptedSigPreview.textContent = signer.full;
        if (adoptModal) adoptModal.style.display = 'block';
      });
    }

    if (adoptBtn) {
      adoptBtn.addEventListener('click', function() {
        var signer = getSignerName();
        if (activeSignatureField) {
          var area = document.getElementById(activeSignatureField);
          if (area) {
            var display = area.querySelector('.signature-display');
            var btn = area.querySelector('.sign-button');
            var hidden = area.querySelector('[data-signature-value]');
            if (display) {
              var ts = new Date();
              display.innerHTML = '<span style="font-family: Allura, cursive; font-size: 26px; color: #0f172a;">' + signer.full + '</span><span style="font-size: 11px; color: #94a3b8; margin-left: 12px;">' + ts.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + '</span>';
              display.style.display = 'flex';
              display.style.alignItems = 'baseline';
              display.style.gap = '8px';
              display.style.borderBottom = '1px solid #e2e8f0';
              display.style.paddingBottom = '4px';
              display.style.flex = '1';
            }
            if (btn) btn.style.display = 'none';
            if (hidden) hidden.value = signer.full;
            area.style.borderColor = '#e2e8f0';
          }
        }
        closeOverlay();
      });
    }

    cancelBtns.forEach(function(btn) {
      btn.addEventListener('click', closeOverlay);
    });

    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeOverlay();
      });
    }

    // --- Inline Validation Helpers ---
    function getFieldLabel(field) {
      var wrapper = field.closest('[data-block-type]');
      if (wrapper) {
        var label = wrapper.querySelector('label');
        if (label) {
          var clone = label.cloneNode(true);
          var span = clone.querySelector('span');
          if (span) clone.removeChild(span);
          var txt = clone.textContent.trim();
          if (txt) return txt;
        }
        var legend = wrapper.querySelector('legend');
        if (legend) {
          var lClone = legend.cloneNode(true);
          var lSpan = lClone.querySelector('span');
          if (lSpan) lClone.removeChild(lSpan);
          var lTxt = lClone.textContent.trim();
          if (lTxt) return lTxt;
        }
      }
      return field.name || 'This field';
    }

    function showFieldError(field, msg) {
      clearFieldError(field);
      field.style.borderColor = '#ef4444';
      field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
      field.classList.add('field-invalid');
      var el = document.createElement('div');
      el.className = 'field-error-msg';
      el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ' + msg;
      var target = field.closest('[data-block-type]') || field.parentElement;
      target.appendChild(el);
    }

    function clearFieldError(field) {
      field.style.borderColor = '';
      field.style.boxShadow = '';
      field.classList.remove('field-invalid');
      var wrapper = field.closest('[data-block-type]') || field.parentElement;
      var existing = wrapper.querySelectorAll('.field-error-msg');
      existing.forEach(function(e) { e.remove(); });
    }

    // Live clear on input
    form.addEventListener('input', function(e) { clearFieldError(e.target); });
    form.addEventListener('change', function(e) { clearFieldError(e.target); });

    // --- Form Validation & Submit Logging ---
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Clear all previous errors
      form.querySelectorAll('.field-error-msg').forEach(function(el) { el.remove(); });
      form.querySelectorAll('.field-invalid').forEach(function(el) {
        el.style.borderColor = ''; el.style.boxShadow = ''; el.classList.remove('field-invalid');
      });

      var requiredFields = form.querySelectorAll('[required]');
      var firstInvalid = null;
      var errorCount = 0;

      requiredFields.forEach(function(field) {
        var isValid = true;
        var label = getFieldLabel(field);

        if (field.type === 'checkbox') {
          isValid = field.checked;
        } else if (field.type === 'radio') {
          var radios = form.querySelectorAll('input[name="' + field.name + '"]');
          isValid = Array.from(radios).some(function(r) { return r.checked; });
          if (!isValid) {
            showFieldError(radios[0], '"' + label + '" — please select an option');
            if (!firstInvalid) firstInvalid = radios[0];
            errorCount++;
            return;
          }
          return;
        } else if (field.tagName === 'SELECT') {
          isValid = field.value !== '';
        } else {
          isValid = field.value.trim() !== '';
        }

        if (!isValid) {
          var msg = field.type === 'checkbox'
            ? '"' + label + '" — you must agree to continue'
            : '"' + label + '" is required';
          showFieldError(field, msg);
          if (!firstInvalid) firstInvalid = field;
          errorCount++;
        }
      });

      // Validate required signatures
      var sigAreas = form.querySelectorAll('.signature-area[data-required="true"]');
      sigAreas.forEach(function(area) {
        var hidden = area.querySelector('[data-signature-value]');
        if (!hidden || !hidden.value) {
          var sigLabel = area.getAttribute('data-label') || 'Signature';
          area.style.borderColor = '#ef4444';
          area.style.borderStyle = 'dashed';
          area.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
          var existing = area.querySelector('.field-error-msg');
          if (!existing) {
            var el = document.createElement('div');
            el.className = 'field-error-msg';
            el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> "' + sigLabel + '" — signature is required';
            area.appendChild(el);
          }
          if (!firstInvalid) firstInvalid = area;
          errorCount++;
        }
      });

      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (firstInvalid.focus) firstInvalid.focus();
        return;
      }

      var formData = {};
      var inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(function(el) {
        var name = el.name;
        if (!name) return;
        if (el.type === 'radio') {
          if (el.checked) formData[name] = el.value;
        } else if (el.type === 'checkbox') {
          if (el.name in formData) {
            if (!Array.isArray(formData[name])) formData[name] = [formData[name]];
            if (el.checked) formData[name].push(el.value || true);
          } else {
            formData[name] = el.checked ? (el.value || true) : false;
          }
        } else {
          formData[name] = el.value;
        }
      });

      console.group('%c Form Submission Data', 'color: #1e3a5f; font-size: 14px; font-weight: bold;');
      console.log('%c Timestamp:', 'font-weight: bold;', new Date().toISOString());
      Object.keys(formData).forEach(function(key) {
        console.log('%c ' + key + ':', 'color: #2563eb; font-weight: 600;', formData[key]);
      });
      console.groupEnd();
      console.log('%c Complete form data object:', 'color: #16a34a; font-weight: bold;', formData);

      alert('Form submitted successfully! Check the browser console (F12) for all captured values.');
    });
  });
})();
</script>`;
}

export function exportToHTML(sections: EditorSection[]): string {
  const formScript = generateFormScript();
  const sectionsHTML = sections.map((s) => renderSectionHTML(s)).join("\n");

  // Architecture spec: warn if content exceeds 200KB
  try {
    const estimatedSize = new Blob([sectionsHTML]).size;
    if (estimatedSize > 200 * 1024) {
      console.warn(
        `[EXPORT] Content exceeds 200KB (${Math.round(estimatedSize / 1024)}KB). Consider reducing content.`,
      );
    }
  } catch {
    /* Blob not available in all envs */
  }

  return `<!DOCTYPE html>
<html lang="en" ${EDITOR_VERSION_ATTR}="${EDITOR_VERSION}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agreement Form</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Allura&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scrollbar-width: thin; scrollbar-color: transparent transparent; }
    html:hover { scrollbar-color: rgba(0,0,0,0.14) transparent; }
    html::-webkit-scrollbar { width: 6px; height: 6px; }
    html::-webkit-scrollbar-track { background: transparent; }
    html::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }
    html:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.14); }
    html:hover::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b; 
      background: #f1f5f9;
      font-size: 14px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    form { 
      max-width: 800px; 
      margin: 32px auto; 
      padding: 40px; 
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
    }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; line-height: 1.3; color: #0f172a; }
    p { word-wrap: break-word; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    td, th { padding: 8px; border: 1px solid #000; vertical-align: top; font-size: inherit; word-wrap: break-word; }
    th { font-weight: bold; }
    input, select, textarea { 
      outline: none; 
      font-family: inherit; 
      font-size: inherit;
      box-sizing: border-box;
    }
    input:focus, select:focus, textarea:focus { 
      border-color: #3b82f6; 
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1); 
    }
    fieldset { border: none; padding: 0; }
    legend { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .placeholder { 
      background-color: #b3d4fc; 
      padding: 0 2px; 
      border-radius: 2px;
    }
    .signature-area {
      border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px;
      text-align: left; position: relative; min-height: 48px;
      display: flex; align-items: center; gap: 12px;
      background: #fff; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .signature-area:hover { border-color: #94a3b8; }
    .sig-label {
      font-size: 14px; font-weight: 500; color: #334155; white-space: nowrap;
    }
    .sign-button {
      background: #1e293b; color: #fff; border: none;
      padding: 6px 16px; cursor: pointer; font-weight: 500; font-size: 13px;
      border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;
      transition: background 0.15s; margin-left: auto;
    }
    .sign-button:hover { background: #334155; }
    .sign-button:active { background: #0f172a; }
    a { color: #2563eb; text-decoration: underline; }
    a:hover { color: #1d4ed8; }
    ul, ol { margin-left: 24px; }
    li { padding: 4px 0; }
    .esign-overlay {
      display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 10000;
      align-items: center; justify-content: center;
    }
    .esign-modal {
      background: #fff; border-radius: 8px; width: 480px; max-width: 94vw;
      box-shadow: 0 16px 40px rgba(0,0,0,0.2); overflow: hidden;
      animation: esignFadeIn 0.15s ease-out;
    }
    @keyframes esignFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .esign-modal-header {
      background: #1e293b; color: #fff;
      padding: 16px 24px; font-size: 15px; font-weight: 600;
    }
    .esign-modal-body { padding: 20px 24px 16px; }
    .esign-modal-footer { padding: 4px 24px 20px; display: flex; gap: 10px; justify-content: flex-end; }
    .esign-btn {
      padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 500;
      cursor: pointer; border: none; transition: background 0.15s;
    }
    .esign-btn-primary { background: #1e293b; color: #fff; }
    .esign-btn-primary:hover { background: #334155; }
    .esign-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
    .esign-btn-danger { background: #fff; color: #64748b; border: 1px solid #e2e8f0; }
    .esign-btn-danger:hover { background: #f8fafc; color: #334155; }
    .esign-checkbox-label {
      display: flex; align-items: center; gap: 10px; font-size: 13px;
      cursor: pointer; padding: 10px 12px; border: 1px solid #e2e8f0;
      border-radius: 6px; transition: background 0.15s;
    }
    .esign-checkbox-label:hover { background: #f8fafc; }
    .esign-checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #1e293b; flex-shrink: 0; }
    .esign-sig-preview {
      font-family: 'Allura', cursive; font-size: 30px; color: #0f172a;
      padding: 10px 0 8px; border-bottom: 1px solid #cbd5e1; margin: 12px 0 6px;
    }
    .esign-legal { font-size: 12px; color: #94a3b8; line-height: 1.6; margin-top: 12px; }
    .field-error-msg {
      display: flex; align-items: center; gap: 6px;
      color: #dc2626; font-size: 12px; font-weight: 500;
      margin-top: 6px; padding: 0 2px;
      animation: errorSlideIn 0.25s ease-out;
    }
    .field-error-msg svg { flex-shrink: 0; }
    @keyframes errorSlideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .field-invalid { border-color: #ef4444 !important; }
    .field-invalid:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important; }
    @media (max-width: 768px) {
      form { margin: 16px; padding: 24px; }
      [${EDITOR_SECTION_ATTR}] { 
        grid-template-columns: 1fr !important; 
        flex-direction: column !important;
        gap: 16px !important;
      }
      [${EDITOR_COLUMN_ATTR}] { width: 100% !important; }
      .esign-modal { width: 95vw; }
    }
  </style>
</head>
<body>
  <form novalidate>
${sectionsHTML}
  </form>

  <div id="esign-overlay" class="esign-overlay">
    <div id="esign-review-modal" class="esign-modal" style="display:none;">
      <div class="esign-modal-header">Please review these documents carefully</div>
      <div class="esign-modal-body">
        <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">Please sign the documents electronically after your review.</p>
        <label class="esign-checkbox-label">
          <input type="checkbox" id="esign-agree-checkbox" />
          <span>I agree to use Electronic Signature on this website.</span>
        </label>
      </div>
      <div class="esign-modal-footer">
        <button type="button" id="esign-continue-btn" class="esign-btn esign-btn-primary" disabled>Continue</button>
        <button type="button" data-esign-cancel class="esign-btn esign-btn-danger">Cancel</button>
      </div>
    </div>
    <div id="esign-adopt-modal" class="esign-modal" style="display:none;">
      <div class="esign-modal-header">Adopt your signature</div>
      <div class="esign-modal-body">
        <p style="font-size: 14px; color: #475569;">Borrower's Name: <strong id="esign-borrower-name">Mafrook Doe</strong></p>
        <div style="margin-top: 12px; font-size: 14px; color: #475569;">Adopted Signature:</div>
        <div id="esign-adopted-sig" class="esign-sig-preview">Mafrook Doe</div>
        <p class="esign-legal">By clicking adopt and sign, I agree that the signature will be the electronic representation of my signature for all purposes when I (or my agent) use them on documents, including legally binding contracts &mdash; just the same as a pen-and-paper signature and initials. Further I have previously consented to the use of e-signatures and electronic communications.</p>
      </div>
      <div class="esign-modal-footer">
        <button type="button" id="esign-adopt-btn" class="esign-btn esign-btn-primary">Adopt and Sign</button>
        <button type="button" data-esign-cancel class="esign-btn esign-btn-danger">Cancel</button>
      </div>
    </div>
  </div>
${formScript}
</body>
</html>`;
}

export function exportBodyHTML(sections: EditorSection[]): string {
  return sections.map((s) => renderSectionHTML(s)).join("\n");
}
