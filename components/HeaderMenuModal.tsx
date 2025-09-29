import React, { useState, useCallback } from 'react';
import { Theme, MenuMode, SupportedStates } from '../types';
import { ProjectState, RecentProject } from '../utils/SessionManager';

interface HeaderMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  projectState: ProjectState;
  recentProjects: RecentProject[];
  autoSaveAvailable: boolean;
  // Project management functions
  onQuickSave: () => void;
  onSaveAs: () => void;
  onLoadProject: () => void;
  onLoadRecentProject: (projectPath: string, projectName: string) => void;
  onExportProject: () => void;
  onRecoverAutoSave: () => void;
  // Export functions (duplicated for convenience)
  onExport: () => void;
  onImportCSV: () => void;
  // App functions
  currentState: SupportedStates;
  menuMode: MenuMode;
  lastSaveTime: Date | null;
}

export const HeaderMenuModal: React.FC<HeaderMenuModalProps> = ({
  isOpen,
  onClose,
  theme,
  projectState,
  recentProjects,
  autoSaveAvailable,
  onQuickSave,
  onSaveAs,
  onLoadProject,
  onLoadRecentProject,
  onExportProject,
  onRecoverAutoSave,
  onExport,
  onImportCSV,
  currentState,
  menuMode,
  lastSaveTime
}) => {
  const [activeTab, setActiveTab] = useState<'project' | 'recent' | 'export'>('project');

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const formatLastModified = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-start z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`mt-16 ml-4 w-96 rounded-xl shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Project Menu</h2>
            <button
              onClick={onClose}
              className={`p-1 rounded transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {['project', 'recent', 'export'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? theme === 'dark'
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-500 text-white'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 max-h-96 overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Project Tab */}
          {activeTab === 'project' && (
            <div className="space-y-4">
              {/* Project Status */}
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <h3 className="font-medium mb-2">Current Project</h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {projectState.currentProjectName}
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {projectState.isNewProject ? 'Unsaved project' : `Saved project`}
                  {lastSaveTime && ` • Last saved ${lastSaveTime.toLocaleTimeString()}`}
                  {projectState.hasUnsavedChanges && ' • Has unsaved changes'}
                </p>
              </div>

              {/* Auto-save recovery */}
              {autoSaveAvailable && (
                <div className={`p-4 rounded-lg border-2 border-dashed ${
                  theme === 'dark' 
                    ? 'border-blue-600 bg-blue-900/20' 
                    : 'border-blue-400 bg-blue-50'
                }`}>
                  <h3 className={`font-medium mb-2 ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    Auto-saved Work Available
                  </h3>
                  <button
                    onClick={onRecoverAutoSave}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    Recover Auto-saved Work
                  </button>
                </div>
              )}

              {/* Project Actions */}
              <div className="space-y-2">
                {/* Save (only for saved projects with changes) */}
                {!projectState.isNewProject && (
                  <button
                    onClick={onQuickSave}
                    disabled={!projectState.hasUnsavedChanges}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                      projectState.hasUnsavedChanges
                        ? theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Save{projectState.hasUnsavedChanges ? ' Changes' : ' (No Changes)'}
                  </button>
                )}

                {/* Load */}
                <button
                  onClick={() => {
                    onLoadProject();
                    onClose(); // Close hamburger menu when opening file picker
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  Load Project File
                </button>

                {/* Save As */}
                <button
                  onClick={() => {
                    onSaveAs();
                    onClose(); // Close hamburger menu after save as
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  Save As New Project
                </button>
              </div>
            </div>
          )}

          {/* Recent Projects Tab */}
          {activeTab === 'recent' && (
            <div>
              <h3 className="font-medium mb-4">Recent Projects</h3>
              {recentProjects.length > 0 ? (
                <div className="space-y-2">
                  {recentProjects.slice(0, 5).map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onLoadRecentProject(project.path, project.name);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-600 hover:border-orange-500 hover:bg-orange-900/20'
                          : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                      }`}
                    >
                      <div className="font-medium truncate">{project.name}</div>
                      <div className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {project.pages} page{project.pages !== 1 ? 's' : ''} • {project.items} items
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {formatLastModified(project.lastModified)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <p className="text-sm">No recent projects</p>
                  <p className="text-xs mt-1">Projects will appear here after saving</p>
                </div>
              )}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="font-medium mb-4">Export & Import</h3>
              
              {/* Quick Export */}
              <button
                onClick={() => {
                  onExport();
                  onClose(); // Close hamburger menu when opening export modal
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                Export Menu (PNG/JPEG/CSV)
              </button>

              {/* Project Export */}
              <button
                onClick={() => {
                  onExportProject();
                  onClose(); // Close hamburger menu after export
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                Export Complete Project
              </button>

              {/* Import CSV */}
              <button
                onClick={() => {
                  onImportCSV();
                  onClose(); // Close hamburger menu when opening import modal
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                Import CSV Data
              </button>

              {/* Project Info */}
              <div className={`p-3 rounded-lg text-xs ${
                theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}>
                <p><strong>Current:</strong> {menuMode} • {currentState}</p>
                <p><strong>Status:</strong> {projectState.hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};