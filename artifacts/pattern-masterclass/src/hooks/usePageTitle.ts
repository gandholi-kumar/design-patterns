import { useSEO, type SEOProps } from './useSEO';

export { useSEO, type SEOProps };

/**
 * Backwards compatibility wrapper for usePageTitle.
 */
export function usePageTitle(title: string, description?: string) {
  useSEO({ title, description });
}
