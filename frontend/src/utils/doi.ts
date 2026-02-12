/**
 * Extracts only the DOI identifier (e.g., 10.1590/...) from a string or URL.
 */
export const extractDoiCode = (doi: string | undefined | null): string | null => {
  if (!doi) return null;
  const trimmed = doi.trim();
  if (!trimmed) return null;

  // Handle URL cases
  if (trimmed.includes('doi.org/')) {
    const parts = trimmed.split('doi.org/');
    if (parts.length > 1) return parts[parts.length - 1];
  }

  // Handle other URL prefixes (http/https)
  if (trimmed.startsWith('http')) {
    const parts = trimmed.split('/');
    return parts[parts.length - 1];
  }

  return trimmed;
};

/**
 * Normalizes a DOI string or URL to the standard http://dx.doi.org/ format for storage.
 */
export const normalizeDoi = (doi: string | undefined | null): string | null => {
  const code = extractDoiCode(doi);
  if (!code) return null;

  // We only prefix it if it looks like a DOI code (typically starts with 10.)
  // or if we want to force everything to be a DOI URL.
  // The user requested it to be saved as http://dx.doi.org/ identifier
  if (code.startsWith('10.')) {
     return `http://dx.doi.org/${code}`;
  }

  // If it doesn't look like a standard DOI code but was a URL, keep it as is
  if (doi && (doi.startsWith('http://') || doi.startsWith('https://'))) {
    return doi.trim();
  }

  return code;
};
