import React, { useState, useEffect } from 'react';

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
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ 
  onUpdateDismissed,
  updateAvailable,
  updateDownloaded,
  updateVersion
}) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Listen for update events
    const handleUpdateAvailable = (_event: any, info: UpdateInfo) => {
      setUpdateInfo(info);
      setIsVisible(true);
      setIsDownloaded(false);
      setIsDownloading(false);
    };

    const handleDownloadProgress = (_event: any, progress: DownloadProgress) => {
      setDownloadProgress(progress);
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
    setIsVisible(false);
    onUpdateDismissed();
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

  // Only show when update is downloaded and ready to install
  if (!updateDownloaded) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              New Update Available!
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Version {updateVersion} is ready to install.
            </div>
            
            {isDownloading && downloadProgress && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Downloading... {Math.round(downloadProgress.percent)}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.percent}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatBytes(downloadProgress.transferred)} / {formatBytes(downloadProgress.total)} • {formatSpeed(downloadProgress.bytesPerSecond)}
                </div>
              </div>
            )}
            
            {isDownloaded && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Update downloaded and ready to install
              </div>
            )}
            
            <div className="mt-4 flex space-x-2">
              {!isDownloading && !isDownloaded && (
                <>
                  <button
                    onClick={handleDownloadUpdate}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Download Now
                  </button>
                  <button
                    onClick={handleMaybeLater}
                    className="text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Maybe Later
                  </button>
                </>
              )}
              
              {isDownloaded && (
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
                    className="text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Later
                  </button>
                </>
              )}
            </div>
          </div>
          
          {!isDownloading && !isInstalling && (
            <button
              onClick={handleMaybeLater}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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