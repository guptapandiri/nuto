import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Client-side navigation preserves scroll position by default, which lands you
 * halfway down a new page. Reset to the top whenever the path changes.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
