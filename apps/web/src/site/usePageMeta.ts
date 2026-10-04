import { useEffect } from 'react';

const SUFFIX = 'Chess Arena';

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title === SUFFIX ? SUFFIX : `${title} · ${SUFFIX}`;
    if (description === undefined) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);
}
