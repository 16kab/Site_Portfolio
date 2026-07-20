import { Toaster } from 'sonner';
import { getToastConfig } from '../config';
import { useIsDarkMode } from '../hooks';

/**
 * Toaster Sonner aligné sur le thème clair/sombre de l'application.
 */
export default function ThemedToaster() {
  const isDark = useIsDarkMode();
  return <Toaster {...getToastConfig(isDark)} />;
}
