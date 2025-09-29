import React, { useState, useCallback } from 'react';
import { Theme } from '../types';
import { RecentProject, ProjectData } from '../utils/SessionManager';

interface ProjectWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
  onLoadProject: (projectData: ProjectData) => void;
  onLoadFile: () => void;
  recentProjects: RecentProject[];
  autoSaveAvailable: boolean;
  onRecoverAutoSave: () => void;
  theme: Theme;
}

export const ProjectWelcomeModal: React.FC<ProjectWelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartNew,
  onLoadProject,
  onLoadFile,
  recentProjects,
  autoSaveAvailable,
  onRecoverAutoSave,
  theme
}) => {
  const [selectedProject, setSelectedProject] = useState<RecentProject | null>(null);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleProjectClick = useCallback((project: RecentProject) => {
    setSelectedProject(project);
    // For now, we'll implement file loading later
    // onLoadProject(project.data);
  }, []);

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
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`max-w-6xl w-full max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-8 py-6 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mango Cannabis Menu Builder</h1>
              <p className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Choose a project to continue or start fresh
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`px-8 py-6 max-h-[calc(90vh-180px)] overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Auto-save recovery section */}
          {autoSaveAvailable && (
            <div className={`p-6 rounded-xl border-2 border-dashed mb-8 ${
              theme === 'dark' 
                ? 'border-blue-600 bg-blue-900/20' 
                : 'border-blue-400 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    Auto-saved Work Available
                  </h3>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    We found work that was automatically saved. Would you like to recover it?
                  </p>
                </div>
                <button
                  onClick={onRecoverAutoSave}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  Recover Work
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Start New Project */}
            <button
              onClick={onStartNew}
              className={`p-8 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                theme === 'dark'
                  ? 'border-gray-600 hover:border-green-500 hover:bg-green-900/20'
                  : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <svg className={`w-8 h-8 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Start New Project</h3>
                <p className={`text-sm text-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Create a fresh menu from scratch
                </p>
              </div>
            </button>

            {/* Load Project File */}
            <button
              onClick={onLoadFile}
              className={`p-8 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                theme === 'dark'
                  ? 'border-gray-600 hover:border-blue-500 hover:bg-blue-900/20'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <svg className={`w-8 h-8 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Load Project File</h3>
                <p className={`text-sm text-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Open a saved project (.json file)
                </p>
              </div>
            </button>

            {/* Browse Templates */}
            <button
              className={`p-8 rounded-xl border-2 transition-all duration-200 hover:scale-105 opacity-60 cursor-not-allowed ${
                theme === 'dark'
                  ? 'border-gray-600'
                  : 'border-gray-300'
              }`}
              disabled
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <svg className={`w-8 h-8 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Templates</h3>
                <p className={`text-sm text-center ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Coming soon
                </p>
              </div>
            </button>
          </div>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Recent Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className={`p-6 rounded-lg border text-left transition-all duration-200 hover:scale-105 ${
                      theme === 'dark'
                        ? 'border-gray-600 hover:border-orange-500 hover:bg-orange-900/20'
                        : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                    }`}
                  >
                    {/* Project thumbnail placeholder */}
                    <div className={`w-full h-32 rounded-lg mb-4 flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-8 h-8 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    <h3 className="font-semibold mb-2 truncate">{project.name}</h3>
                    <div className={`text-sm space-y-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <p>{project.pages} page{project.pages !== 1 ? 's' : ''} • {project.items} items</p>
                      <p>{project.metadata.menuMode} • {project.metadata.currentState}</p>
                      <p className="text-xs">{formatLastModified(project.lastModified)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {recentProjects.length === 0 && !autoSaveAvailable && (
            <div className={`text-center py-12 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <svg className={`w-16 h-16 mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No Recent Projects</h3>
              <p className="text-sm">Start by creating a new project or loading an existing one</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-8 py-4 border-t flex justify-end ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};