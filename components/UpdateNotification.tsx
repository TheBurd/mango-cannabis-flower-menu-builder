import React, { useState, useEffect } from 'react';
import { Theme } from '../types';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
}

interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

interface UpdateNotificationProps {
  onUpdateDismissed: () => void;
  updateAvailable: boolean;
  updateDownloaded: boolean;
  updateVersion: string;
  theme: Theme;
  isManualCheck?: boolean;
  isCheckingForUpdates?: boolean;
  noUpdatesFound?: boolean;
  isDownloading?: boolean;
  downloadProgress?: DownloadProgress | null;
  updateError?: string | null;
  updateErrorUrl?: string | null;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ 
  onUpdateDismissed,
  updateAvailable,
  updateDownloaded,
  updateVersion,
  theme,
  isManualCheck = false,
  isCheckingForUpdates = false,
  noUpdatesFound = false,
  isDownloading = false,
  downloadProgress = null,
  updateError = null,
  updateErrorUrl = null
}) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isSlideIn, setIsSlideIn] = useState(false);
  const [autoDismissTimer, setAutoDismissTimer] = useState<NodeJS.Timeout | null>(null);

  // Use updateDownloaded prop instead of local isDownloaded state
  const isDownloaded = updateDownloaded;

  // Remove duplicate event listeners - these are now handled in App.tsx

  // Show when update is available, downloaded, manual check states, or error occurs
  useEffect(() => {
    if (updateAvailable || updateDownloaded || isManualCheck || isCheckingForUpdates || noUpdatesFound || updateError) {
      setIsVisible(true);
      setTimeout(() => setIsSlideIn(true), 100);
      
      // Auto-dismiss for "no updates found" after 4 seconds
      if (noUpdatesFound && !autoDismissTimer) {
        const timer = setTimeout(() => {
          handleMaybeLater();
        }, 4000);
        setAutoDismissTimer(timer);
      }
    }
  }, [updateAvailable, updateDownloaded, isManualCheck, isCheckingForUpdates, noUpdatesFound, updateError]);

  // Cleanup auto-dismiss timer
  useEffect(() => {
    return () => {
      if (autoDismissTimer) {
        clearTimeout(autoDismissTimer);
      }
    };
  }, [autoDismissTimer]);

  const handleDownloadUpdate = async () => {
    if (!window.electronAPI) return;
    
    try {
      await window.electronAPI.downloadUpdate();
    } catch (error) {
      console.error('Error downloading update:', error);
    }
  };

  const handleInstallUpdate = async () => {
    if (!window.electronAPI) return;
    
    setIsInstalling(true);
    try {
      await window.electronAPI.installUpdate();
    } catch (error) {
      console.error('Error installing update:', error);
      setIsInstalling(false);
    }
  };

  const handleMaybeLater = () => {
    // Clear auto-dismiss timer if active
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
      setAutoDismissTimer(null);
    }
    
    setIsSlideIn(false);
    setTimeout(() => {
      setIsVisible(false);
      onUpdateDismissed();
    }, 300);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  // Don't show if not visible
  if (!isVisible) return null;

  const bgClasses = theme === 'dark' 
    ? 'bg-gray-800 border-gray-600' 
    : 'bg-white border-gray-200';
  
  const textClasses = theme === 'dark' 
    ? 'text-gray-100' 
    : 'text-gray-900';
    
  const subtextClasses = theme === 'dark' 
    ? 'text-gray-300' 
    : 'text-gray-600';

  const iconBgClasses = theme === 'dark'
    ? 'bg-blue-900'
    : 'bg-blue-100';

  const iconClasses = theme === 'dark'
    ? 'text-blue-400'
    : 'text-blue-600';

  const closeButtonClasses = theme === 'dark'
    ? 'text-gray-400 hover:text-gray-200'
    : 'text-gray-400 hover:text-gray-600';

  const laterButtonClasses = theme === 'dark'
    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  const progressBgClasses = theme === 'dark'
    ? 'bg-gray-700'
    : 'bg-gray-200';

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div 
        className={`${bgClasses} border rounded-lg shadow-2xl p-4 transition-all duration-300 ease-out transform ${
          isSlideIn ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{
          backdropFilter: 'blur(8px)',
          boxShadow: theme === 'dark' 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 ${iconBgClasses} rounded-lg flex items-center justify-center`}>
              {updateError ? (
                <svg className={`w-6 h-6 text-red-600 ${theme === 'dark' ? 'text-red-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : noUpdatesFound ? (
                <svg className={`w-6 h-6 text-green-600 ${theme === 'dark' ? 'text-green-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isDownloaded ? (
                <svg className={`w-6 h-6 text-green-600 ${theme === 'dark' ? 'text-green-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (isDownloading || isCheckingForUpdates) ? (
                <svg className={`w-6 h-6 ${iconClasses} animate-spin`} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className={`w-6 h-6 ${iconClasses}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold ${textClasses}`}>
              {updateError
                ? 'Update Failed'
                : noUpdatesFound 
                ? 'You have the latest version!' 
                : isCheckingForUpdates 
                ? 'Checking for Updates...' 
                : isDownloaded 
                ? 'Update Ready!' 
                : isDownloading 
                ? 'Downloading Update...' 
                : 'New Update Available!'
              }
            </div>
            <div className={`text-sm ${subtextClasses} mt-1`}>
              {updateError
                ? updateError
                : noUpdatesFound 
                ? "You're running the latest version!"
                : isCheckingForUpdates 
                ? 'Please wait while we check for new updates...'
                : isDownloaded 
                ? `Version ${updateVersion} is ready to install.`
                : isDownloading 
                ? `Downloading version ${updateVersion}...`
                : `Version ${updateVersion} is available for download.`
              }
            </div>
            
            {/* Manual download link for errors */}
            {updateError && updateErrorUrl && (
              <div className="mt-2">
                <button
                  onClick={() => {
                    if (window.electronAPI?.openExternal) {
                      window.electronAPI.openExternal(updateErrorUrl).catch((error) => {
                        console.error('❌ Failed to open GitHub URL:', error);
                        window.open(updateErrorUrl, '_blank');
                      });
                    } else {
                      window.open(updateErrorUrl, '_blank');
                    }
                  }}
                  className={`text-xs ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} underline transition-colors flex items-center space-x-1`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Manual download available at GitHub Releases</span>
                </button>
              </div>
            )}
            
            {/* GitHub release link for available updates AND downloaded updates */}
            {(updateAvailable || isDownloaded) && !isDownloading && !isCheckingForUpdates && (
              <div className="mt-2">
                {updateVersion && updateVersion.trim() !== '' ? (
                  <button
                    onClick={() => {
                      const url = `https://github.com/TheBurd/mango-cannabis-flower-menu-builder/releases/tag/v${updateVersion}`;
                      console.log('🔗 Opening GitHub release URL:', url);
                      console.log('📋 Update version:', updateVersion);
                      console.log('🌐 Using electronAPI:', !!window.electronAPI?.openExternal);
                      
                      if (window.electronAPI?.openExternal) {
                        window.electronAPI.openExternal(url).catch((error) => {
                          console.error('❌ Failed to open external URL:', error);
                          // Fallback to window.open if electronAPI fails
                          window.open(url, '_blank');
                        });
                      } else {
                        window.open(url, '_blank');
                      }
                    }}
                    className={`text-xs ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} underline transition-colors flex items-center space-x-1`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>View release notes & changes</span>
                  </button>
                ) : (
                  <div className={`text-xs ${subtextClasses} italic`}>
                    Release notes link unavailable (version info missing)
                  </div>
                )}
              </div>
            )}
            
            {isDownloading && downloadProgress && (
              <div className="mt-3">
                <div className={`text-xs ${subtextClasses} mb-1`}>
                  {Math.round(downloadProgress.percent)}% • {formatSpeed(downloadProgress.bytesPerSecond)}
                </div>
                <div className={`w-full ${progressBgClasses} rounded-full h-2`}>
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.percent}%` }}
                  ></div>
                </div>
                <div className={`text-xs ${subtextClasses} mt-1`}>
                  {formatBytes(downloadProgress.transferred)} / {formatBytes(downloadProgress.total)}
                </div>
              </div>
            )}
            
            {/* Only show buttons if not in checking state */}
            {!isCheckingForUpdates && (
              <div className="mt-4 flex space-x-2">
                {updateError ? (
                  <button
                    onClick={handleMaybeLater}
                    className={`text-xs px-3 py-1.5 ${laterButtonClasses} rounded-md transition-colors`}
                  >
                    Dismiss
                  </button>
                ) : noUpdatesFound ? (
                  <button
                    onClick={handleMaybeLater}
                    className={`text-xs px-3 py-1.5 ${laterButtonClasses} rounded-md transition-colors`}
                  >
                    Dismiss
                  </button>
                ) : isDownloaded ? (
                  <>
                    <button
                      onClick={handleInstallUpdate}
                      disabled={isInstalling}
                      className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isInstalling ? 'Installing...' : 'Install & Restart'}
                    </button>
                    <button
                      onClick={handleMaybeLater}
                      disabled={isInstalling}
                      className={`text-xs px-3 py-1.5 ${laterButtonClasses} rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Later
                    </button>
                  </>
                ) : isDownloading ? (
                  <div className={`text-xs ${subtextClasses} px-3 py-1.5`}>
                    Downloading in progress...
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleDownloadUpdate}
                      className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Download Now
                    </button>
                    <button
                      onClick={handleMaybeLater}
                      className={`text-xs px-3 py-1.5 ${laterButtonClasses} rounded-md transition-colors`}
                    >
                      Maybe Later
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {!isDownloading && !isInstalling && !isCheckingForUpdates && (
            <button
              onClick={handleMaybeLater}
              className={`flex-shrink-0 ${closeButtonClasses} transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 