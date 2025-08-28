/**
 * Theme Utilities - TypeScript helpers for theme management
 * Works with CSS custom properties defined in styles/theme-variables.css
 */

export type Theme = 'light' | 'dark' | 'high-contrast' | 'auto';

export interface ThemeConfig {
  theme: Theme;
  enableTransitions: boolean;
  respectSystemPreference: boolean;
}

/**
 * Set the theme on the document root
 */
export const setTheme = (theme: Theme): void => {
  const root = document.documentElement;
  
  if (theme === 'auto') {
    // Remove data-theme to use system preference
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  
  // Store preference in localStorage
  if (theme !== 'auto') {
    localStorage.setItem('preferred-theme', theme);
  } else {
    localStorage.removeItem('preferred-theme');
  }
};

/**
 * Get the current theme from DOM or localStorage
 */
export const getCurrentTheme = (): Theme => {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme') as Theme;
  
  if (currentTheme) {
    return currentTheme;
  }
  
  // Check localStorage
  const storedTheme = localStorage.getItem('preferred-theme') as Theme;
  if (storedTheme) {
    return storedTheme;
  }
  
  // Default to auto (system preference)
  return 'auto';
};

/**
 * Toggle between light and dark themes
 */
export const toggleTheme = (): Theme => {
  const current = getCurrentTheme();
  const newTheme = current === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
};

/**
 * Initialize theme system on page load
 */
export const initializeTheme = (): void => {
  // Check for stored preference first
  const storedTheme = localStorage.getItem('preferred-theme') as Theme;
  
  if (storedTheme && storedTheme !== 'auto') {
    setTheme(storedTheme);
    return;
  }
  
  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
  
  // Listen for system preference changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't set a manual preference
      if (!localStorage.getItem('preferred-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
};

/**
 * Get a CSS custom property value
 */
export const getCSSVariable = (variableName: string, element?: HTMLElement): string => {
  const targetElement = element || document.documentElement;
  return getComputedStyle(targetElement).getPropertyValue(variableName).trim();
};

/**
 * Set a CSS custom property value
 */
export const setCSSVariable = (variableName: string, value: string, element?: HTMLElement): void => {
  const targetElement = element || document.documentElement;
  targetElement.style.setProperty(variableName, value);
};

/**
 * Color mapping for shelf backgrounds based on constants.ts
 */
export const SHELF_CSS_CLASS_MAP: Record<string, string> = {
  'bg-mango-gradient': 'bg-mango-gradient',
  'bg-amber-500': 'bg-shelf-amber',
  'bg-sky-500': 'bg-shelf-sky',
  'bg-slate-700': 'bg-shelf-slate',
  'bg-rose-500': 'bg-shelf-rose',
  'bg-violet-500': 'bg-shelf-violet',
  'bg-emerald-500': 'bg-shelf-emerald',
  'bg-indigo-500': 'bg-shelf-indigo',
  'bg-gray-500': 'bg-shelf-gray',
  'bg-lime-600': 'bg-shelf-lime',
  'bg-teal-600': 'bg-shelf-teal',
  'bg-purple-500': 'bg-shelf-purple',
  'bg-blue-500': 'bg-shelf-blue',
  'bg-pink-500': 'bg-shelf-pink',
};

/**
 * Convert Tailwind classes to theme-aware CSS classes
 */
export const convertToThemeClass = (tailwindClass: string): string => {
  return SHELF_CSS_CLASS_MAP[tailwindClass] || tailwindClass;
};

/**
 * Pre-packaged product color mappings
 */
export const PREPACKAGED_CSS_MAP: Record<string, string> = {
  '#F46A4E': 'bg-prepackaged-flower-28g',
  '#F7824A': 'bg-prepackaged-flower-14g',
  '#FA9B48': 'bg-prepackaged-flower-7g',
  '#FFA447': 'bg-prepackaged-flower-3_5g',
  '#2A9016': 'bg-prepackaged-shake-28g',
  '#3FA525': 'bg-prepackaged-shake-14g',
  '#55BA35': 'bg-prepackaged-shake-7g',
  '#79BC3F': 'bg-prepackaged-shake-3_5g',
};

/**
 * Convert hex color to CSS variable class
 */
export const hexToThemeClass = (hexColor: string): string => {
  return PREPACKAGED_CSS_MAP[hexColor] || '';
};

/**
 * Enable or disable CSS transitions for theme changes
 */
export const setThemeTransitions = (enabled: boolean): void => {
  const root = document.documentElement;
  
  if (enabled) {
    root.classList.add('transition-theme');
  } else {
    root.classList.remove('transition-theme');
  }
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Apply theme-aware styles to an element
 */
export const applyThemeStyles = (element: HTMLElement, styles: Record<string, string>): void => {
  Object.entries(styles).forEach(([property, value]) => {
    // Check if value contains CSS variables
    if (value.includes('var(--')) {
      element.style.setProperty(property, value);
    } else {
      // Convert to CSS variable if it's a known color
      const themeClass = convertToThemeClass(value) || hexToThemeClass(value);
      if (themeClass) {
        element.classList.add(themeClass);
      } else {
        element.style.setProperty(property, value);
      }
    }
  });
};

/**
 * Theme event listeners for React components
 */
export const useThemeListener = (callback: (theme: Theme) => void): () => void => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = getCurrentTheme();
        callback(newTheme);
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  // Return cleanup function
  return () => observer.disconnect();
};

/**
 * Export all theme constants for easy access
 */
export const THEME_CONSTANTS = {
  THEMES: ['light', 'dark', 'high-contrast', 'auto'] as Theme[],
  STORAGE_KEY: 'preferred-theme',
  ATTRIBUTE_NAME: 'data-theme',
  TRANSITION_CLASS: 'transition-theme',
} as const;