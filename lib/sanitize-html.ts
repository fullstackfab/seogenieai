import sanitize from "sanitize-html";

/**
 * Sanitizes AI-generated / upstream HTML before rendering with
 * dangerouslySetInnerHTML (fabcode-security Rule 4). Used for the streamed
 * chat responses and the PageSpeed report renderer — both untrusted sources.
 * Uses sanitize-html (no jsdom) so it works identically in Server and Client
 * Components without pulling in jsdom's ESM-only transitive deps, which broke
 * under Vercel's serverless bundling; called server-side again before
 * persisting saved content, so stored HTML is never trusted from the client
 * either.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: [
      "a", "b", "i", "em", "strong", "p", "ul", "ol", "li", "br", "h1", "h2", "h3", "h4", "h5", "h6",
      "table", "thead", "tbody", "tr", "td", "th", "span", "div", "code", "pre",
    ],
    allowedAttributes: {
      "*": ["href", "target", "rel", "class", "style"],
    },
  });
}
