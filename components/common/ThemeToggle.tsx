import React, { useState, useEffect } from 'react';
import { setTheme, getCurrentTheme, toggleTheme, initializeTheme, Theme } from '../../utils/themeUtils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * ThemeToggle Component - Demonstrates the new CSS custom properties theme system
 * 
 * Features:
 * - Instant theme switching without JavaScript recalculation
 * - Smooth transitions using CSS variables
 * - System preference detection
 * - Persistent theme storage
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');

  useEffect(() => {
    // Initialize theme system on mount
    initializeTheme();
    setCurrentTheme(getCurrentTheme());

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          setCurrentTheme(getCurrentTheme());
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setCurrentTheme(newTheme);
  };

  const handleThemeSelect = (theme: Theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  return (
    <div className={`theme-toggle ${className}`}>
      {showLabel && (
        <span className="text-theme-secondary text-sm mr-3">
          Theme: {currentTheme}
        </span>
      )}
      
      {/* Simple Toggle Button */}
      <button
        onClick={handleToggle}
        className="btn-secondary px-3 py-2 rounded-md shadow-theme-sm border border-theme-light hover:shadow-theme-md transition-theme"
        title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}
      >
        {currentTheme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Advanced Dropdown (optional) */}
      <div className="relative inline-block ml-2">
        <select
          value={currentTheme}
          onChange={(e) => handleThemeSelect(e.target.value as Theme)}
          className="btn-secondary px-2 py-1 rounded text-sm border border-theme-light transition-theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="high-contrast">High Contrast</option>
          <option value="auto">Auto</option>
        </select>
      </div>
    </div>
  );
};

/**
 * Theme Demo Component - Shows how CSS variables work with different elements
 */
export const ThemeDemo: React.FC = () => {
  return (
    <div className="theme-demo p-6 bg-theme-primary border border-theme-light rounded-lg shadow-theme-md transition-theme">
      <h3 className="text-xl font-semibold text-theme-primary mb-4">
        CSS Custom Properties Theme Demo
      </h3>

      {/* Color Swatches */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-shelf-amber text-white p-3 rounded text-center text-sm">
          Amber Shelf
        </div>
        <div className="bg-shelf-emerald text-white p-3 rounded text-center text-sm">
          Emerald Shelf
        </div>
        <div className="bg-shelf-rose text-white p-3 rounded text-center text-sm">
          Rose Shelf
        </div>
        <div className="bg-mango-gradient text-white p-3 rounded text-center text-sm">
          Mango Premium
        </div>
      </div>

      {/* Form Elements */}
      <div className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Theme-aware input"
          className="w-full px-3 py-2 border rounded transition-theme"
        />
        <textarea
          placeholder="Theme-aware textarea"
          className="w-full px-3 py-2 border rounded h-20 transition-theme"
        />
      </div>

      {/* Status Indicators */}
      <div className="flex gap-3 flex-wrap mb-6">
        <div className="status-success px-3 py-1 rounded border">
          Success Status
        </div>
        <div className="status-warning px-3 py-1 rounded border">
          Warning Status  
        </div>
        <div className="status-error px-3 py-1 rounded border">
          Error Status
        </div>
        <div className="status-info px-3 py-1 rounded border">
          Info Status
        </div>
      </div>

      {/* Strain Type Indicators */}
      <div className="flex gap-2 flex-wrap">
        <div className="bg-strain-sativa text-white px-3 py-1 rounded-full text-sm">
          Sativa
        </div>
        <div className="bg-strain-hybrid text-white px-3 py-1 rounded-full text-sm">
          Hybrid
        </div>
        <div className="bg-strain-indica text-white px-3 py-1 rounded-full text-sm">
          Indica
        </div>
      </div>

      <p className="text-theme-secondary text-sm mt-4">
        All elements above use CSS custom properties and will instantly adapt to theme changes.
      </p>
    </div>
  );
};

export default ThemeToggle;