/** Loose domain/URL matcher for client-side form validation (ported from home/Search.jsx). */
export function isValidDomainString(url: string): boolean {
  const pattern = /^(https?:\/\/)?([a-z0-9-]+\.)?[a-z0-9-]+(\.[a-z]{2,6})(\/\S*)?$/i;
  return pattern.test(url);
}
