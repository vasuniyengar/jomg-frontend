const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "br",
  "p",
  "div",
  "ul",
  "ol",
  "li",
  "a",
]);

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function looksLikeHtml(value) {
  const raw = String(value);
  if (/<[a-z][\s\S]*>/i.test(raw)) return true;
  if (/&(?:nbsp|#\d+|#x[\da-f]+|[a-z]{2,10});/i.test(raw)) return true;
  return false;
}

function normalizeNbsp(value) {
  return String(value).replace(/&amp;nbsp;/gi, " ").replace(/&nbsp;/gi, " ");
}

/** Normalize contenteditable output (nbsp, div blocks) for storage and display. */
export function normalizeRichTextForStorage(value) {
  let html = normalizeNbsp(value);
  html = html.replace(/<div>/gi, "<p>").replace(/<\/div>/gi, "</p>");
  html = html.replace(/<p>\s*<\/p>/gi, "");
  html = html.replace(/<p>\s*(<br\s*\/?>)\s*<\/p>/gi, "$1");
  return html;
}

function sanitizeAllowlistedHtml(html) {
  let safe = String(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  safe = safe.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  return safe.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag, attrs) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";

    if (lower === "br") return "<br>";

    if (match.startsWith("</")) {
      return `</${lower}>`;
    }

    if (lower === "a") {
      const hrefMatch = String(attrs).match(/href\s*=\s*["']([^"']+)["']/i);
      const href = hrefMatch?.[1] || "";
      if (!/^(https?:|mailto:)/i.test(href)) return "";
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">`;
    }

    return `<${lower}>`;
  });
}

/** True when rich text / HTML has no visible content. */
export function richTextIsEmpty(value) {
  const text = String(value ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return !text;
}

/** Plain text or sanitized HTML safe for dangerouslySetInnerHTML on the player site. */
export function richTextToDisplayHtml(value) {
  const raw = String(value ?? "");
  if (richTextIsEmpty(raw)) return "";
  const normalized = normalizeRichTextForStorage(raw);
  if (!looksLikeHtml(normalized)) {
    return escapeHtml(normalized).replace(/\n/g, "<br>");
  }
  return sanitizeAllowlistedHtml(normalized);
}
