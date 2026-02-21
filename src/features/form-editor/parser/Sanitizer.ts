// HTML Sanitizer - Uses DOMPurify for safe, non-destructive sanitization
// Removes scripts and dangerous handlers while preserving styles, classes, and data attributes

import DOMPurify from "dompurify";

// Configure DOMPurify to be permissive with styles and attributes
const DOMPURIFY_CONFIG: any = {
  // Allow all safe tags
  ALLOWED_TAGS: [
    "html",
    "head",
    "body",
    "style",
    "title",
    "div",
    "span",
    "p",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "del",
    "ins",
    "sub",
    "sup",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "caption",
    "colgroup",
    "col",
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    "blockquote",
    "pre",
    "code",
    "form",
    "input",
    "textarea",
    "select",
    "option",
    "optgroup",
    "button",
    "label",
    "fieldset",
    "legend",
    "section",
    "article",
    "header",
    "footer",
    "nav",
    "aside",
    "main",
    "figure",
    "figcaption",
    "address",
    "time",
    "mark",
    "small",
    "big",
    "font",
    "center", // Legacy support
  ],
  // Allow all safe attributes including styles and data-*
  ALLOWED_ATTR: [
    "id",
    "class",
    "style",
    "title",
    "lang",
    "dir",
    "href",
    "src",
    "alt",
    "width",
    "height",
    "type",
    "name",
    "value",
    "placeholder",
    "required",
    "disabled",
    "readonly",
    "checked",
    "selected",
    "rows",
    "cols",
    "maxlength",
    "minlength",
    "pattern",
    "min",
    "max",
    "step",
    "for",
    "form",
    "action",
    "method",
    "enctype",
    "target",
    "colspan",
    "rowspan",
    "headers",
    "scope",
    "border",
    "cellpadding",
    "cellspacing",
    "align",
    "valign",
    "bgcolor",
    "color",
    "data-*", // All data attributes
    "aria-*", // Accessibility
    "role",
  ],
  // Allow data: URIs for images (base64)
  ALLOW_DATA_ATTR: true,
  // Keep the structure intact
  KEEP_CONTENT: true,
  // Return full document
  WHOLE_DOCUMENT: false,
  // Don't add missing tags
  FORCE_BODY: false,
  // Allow style tags
  FORBID_TAGS: ["script", "iframe", "object", "embed", "applet", "noscript"],
  // Forbid dangerous attributes
  FORBID_ATTR: [
    "onerror",
    "onload",
    "onclick",
    "onmouseover",
    "onmouseout",
    "onmousedown",
    "onmouseup",
    "onfocus",
    "onblur",
    "onchange",
    "onsubmit",
    "onreset",
    "onkeydown",
    "onkeypress",
    "onkeyup",
    "ondblclick",
    "oncontextmenu",
    "onscroll",
    "onresize",
    "oninput",
    "onselect",
    "onabort",
    "ondrag",
    "ondrop",
    "onpaste",
    "oncopy",
    "oncut",
  ],
};

/**
 * Sanitize HTML using DOMPurify
 * Preserves styles, classes, and data attributes while removing scripts
 */
export function sanitizeHTML(html: string): string {
  if (!html) return "";

  // Use DOMPurify with permissive config
  const sanitized = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);

  // Post-process to clean up any javascript: URLs that might have slipped through
  return (sanitized as unknown as string).replace(/javascript:/gi, "");
}

/**
 * Light sanitization for internal content (less aggressive)
 * Used for content already processed by the editor
 */
export function lightSanitize(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ...DOMPURIFY_CONFIG,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  }) as unknown as string;
}

/**
 * Escape HTML special characters for text content
 */
export function escapeHTML(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Unescape HTML entities
 */
export function unescapeHTML(str: string): string {
  if (!str) return "";
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.body.textContent || "";
}

/**
 * Check if string contains potential XSS vectors
 */
export function hasDangerousContent(html: string): boolean {
  const dangerous = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i,
    /url\s*\(\s*["']?\s*javascript:/i,
  ];
  return dangerous.some((pattern) => pattern.test(html));
}
