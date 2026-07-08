import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change - body is the scrolling element
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}