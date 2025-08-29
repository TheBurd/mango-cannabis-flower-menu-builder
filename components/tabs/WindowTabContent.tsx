import React, { useState, useEffect } from 'react';
import { Theme } from '../../types';
import { 
  Cog6ToothIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  WindowIcon,
  ComputerDesktopIcon
} from '../common/Icon';

interface WindowTabContentProps {
  theme: Theme;
}

export const WindowTabContent: React.FC<WindowTabContentProps> = ({ theme }) => {
  const [windowPrefs, setWindowPrefs] = useState({
    alwaysOnTop: false,
    transparency: 100,
    startFullscreen: false,
    rememberSize: true,
    rememberPosition: true,
    minimizeToTray: false
  });

  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
  }, []);

  const buttonBaseClass = `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm`;
  
  const primaryButtonClass = theme === 'dark' 
    ? `${buttonBaseClass} bg-teal-600 text-white hover:bg-teal-500 focus:ring-teal-500`
    : `${buttonBaseClass} bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-400`;

  const secondaryButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500`
    : `${buttonBaseClass} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400`;

  // Don't render in web version
  if (!isElectron) {
    return (
      <div className="p-4">
        <div className={`p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <WindowIcon className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Window Controls
          </h3>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Window preferences are only available in the desktop app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Window Behavior */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Window Behavior
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Always on top
              </span>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Keep window above other applications
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={windowPrefs.alwaysOnTop}
              onChange={(e) => setWindowPrefs(prev => ({...prev, alwaysOnTop: e.target.checked}))}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Start fullscreen
              </span>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Launch in fullscreen mode
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={windowPrefs.startFullscreen}
              onChange={(e) => setWindowPrefs(prev => ({...prev, startFullscreen: e.target.checked}))}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Minimize to system tray
              </span>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Hide in system tray when minimized
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={windowPrefs.minimizeToTray}
              onChange={(e) => setWindowPrefs(prev => ({...prev, minimizeToTray: e.target.checked}))}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>
        </div>
      </div>

      {/* Window Transparency */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Window Transparency
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Opacity: {windowPrefs.transparency}%
            </span>
            {windowPrefs.transparency < 100 ? (
              <EyeSlashIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <EyeIcon className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <input 
            type="range" 
            min="30" 
            max="100" 
            step="5"
            value={windowPrefs.transparency}
            onChange={(e) => setWindowPrefs(prev => ({...prev, transparency: parseInt(e.target.value)}))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>30% (Very Transparent)</span>
            <span>100% (Opaque)</span>
          </div>
        </div>
      </div>

      {/* Memory & Position */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Window Memory
        </h3>
        
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Remember window size
            </span>
            <input 
              type="checkbox" 
              checked={windowPrefs.rememberSize}
              onChange={(e) => setWindowPrefs(prev => ({...prev, rememberSize: e.target.checked}))}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Remember window position
            </span>
            <input 
              type="checkbox" 
              checked={windowPrefs.rememberPosition}
              onChange={(e) => setWindowPrefs(prev => ({...prev, rememberPosition: e.target.checked}))}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>
        </div>
      </div>

      {/* Window Actions */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Window Actions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button className={secondaryButtonClass}>
            <WindowIcon className="w-4 h-4" />
            <span className="text-xs">Center Window</span>
          </button>
          
          <button className={secondaryButtonClass}>
            <ComputerDesktopIcon className="w-4 h-4" />
            <span className="text-xs">Reset Size</span>
          </button>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Performance
        </h3>
        
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium text-sm mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            Hardware Acceleration
          </h4>
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Enable GPU acceleration
            </span>
          </label>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Improves rendering performance but may use more power
          </p>
        </div>

        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium text-sm mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            Background Behavior
          </h4>
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Reduce activity when minimized
            </span>
          </label>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Conserve resources when app is not visible
          </p>
        </div>
      </div>

      {/* Current Window Info */}
      <div className="space-y-2">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Current Window
        </h3>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                Size:
              </span>
              <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                1400 × 900
              </span>
            </div>
            <div>
              <span className={`font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                Position:
              </span>
              <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Centered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className={primaryButtonClass + ' w-full justify-center'}>
          <Cog6ToothIcon className="w-4 h-4" />
          <span>Save Window Preferences</span>
        </button>
      </div>
    </div>
  );
};