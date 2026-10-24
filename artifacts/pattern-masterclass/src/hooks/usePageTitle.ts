import { useEffect } from 'react';

/**
 * Dynamically updates document.title and optional meta description per route.
 */
export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title.includes('GoF') ? title : `${title} | GoF Design Patterns Masterclass`;
    document.title = fullTitle;

    if (description) {
      let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }
  }, [title, description]);
}
