import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes AI-generated / upstream HTML before rendering with
 * dangerouslySetInnerHTML (fabcode-security Rule 4). Used for the streamed
 * chat responses and the PageSpeed report renderer — both untrusted sources.
 * Works in both Server and Client Components (isomorphic-dompurify runs on
 * jsdom server-side); called server-side again before persisting saved
 * content, so stored HTML is never trusted from the client either.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "a", "b", "i", "em", "strong", "p", "ul", "ol", "li", "br", "h1", "h2", "h3", "h4", "h5", "h6",
      "table", "thead", "tbody", "tr", "td", "th", "span", "div", "code", "pre",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
  });
}
