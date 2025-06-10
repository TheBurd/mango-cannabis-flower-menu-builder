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
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ 
  onUpdateDismissed,
  updateAvailable,
  updateDownloaded,
  updateVersion,
  theme
}) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isSlideIn, setIsSlideIn] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Listen for update events
    const handleUpdateAvailable = (_event: any, info: UpdateInfo) => {
      setUpdateInfo(info);
      setIsVisible(true);
      setIsDownloaded(false);
      setIsDownloading(false);
      // Trigger slide-in animation
      setTimeout(() => setIsSlideIn(true), 100);
    };

    const handleDownloadProgress = (_event: any, progress: DownloadProgress) => {
      setDownloadProgress(progress);
      setIsDownloading(true);
    };

    const handleUpdateDownloaded = (_event: any, info: { version: string }) => {
      setIsDownloading(false);
      setIsDownloaded(true);
      setDownloadProgress(null);
    };

    window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
    window.electronAPI.onDownloadProgress(handleDownloadProgress);
    window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);

    return () => {
      window.electronAPI?.removeUpdateListeners();
    };
  }, []);

  // Show when update is available or downloaded
  useEffect(() => {
    if (updateAvailable || updateDownloaded) {
      setIsVisible(true);
      setTimeout(() => setIsSlideIn(true), 100);
    }
  }, [updateAvailable, updateDownloaded]);

  const handleDownloadUpdate = async () => {
    if (!window.electronAPI) return;
    
    setIsDownloading(true);
    try {
      await window.electronAPI.downloadUpdate();
    } catch (error) {
      console.error('Error downloading update:', error);
      setIsDownloading(false);
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
              {isDownloaded ? (
                <svg className={`w-6 h-6 text-green-600 ${theme === 'dark' ? 'text-green-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isDownloading ? (
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
              {isDownloaded ? 'Update Ready!' : isDownloading ? 'Downloading Update...' : 'New Update Available!'}
            </div>
            <div className={`text-sm ${subtextClasses} mt-1`}>
              {isDownloaded 
                ? `Version ${updateVersion} is ready to install.`
                : isDownloading 
                ? `Downloading version ${updateVersion}...`
                : `Version ${updateVersion} is available for download.`
              }
            </div>
            
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
            
            <div className="mt-4 flex space-x-2">
              {isDownloaded ? (
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
          </div>
          
          {!isDownloading && !isInstalling && (
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