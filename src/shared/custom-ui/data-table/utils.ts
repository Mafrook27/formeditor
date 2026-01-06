/**
 * Measure text width using canvas
 */
export function measureTextWidth(
  text: string,
  font = "14px system-ui, sans-serif",
): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return text.length * 8;
  context.font = font;
  return Math.ceil(context.measureText(text).width);
}

/**
 * Calculate optimal column width from header and data
 */
export function calculateColumnWidth<T>(
  header: string,
  data: T[],
  minWidth = 80,
  maxWidth = 300,
): number {
  const headerWidth = measureTextWidth(
    header,
    "600 14px system-ui, sans-serif",
  );

  let maxContentWidth = 0;
  for (const value of data) {
    const text = String(value ?? "");
    const width = measureTextWidth(text, "14px system-ui, sans-serif");
    if (width > maxContentWidth) {
      maxContentWidth = width;
    }
  }

  // Add padding (px-2 = 8px left + 8px right = 16px) + sort icon space (12px icon + 2px gap = 14px)
  const calculatedWidth = Math.max(headerWidth, maxContentWidth) + 30;

  return Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
}
