import React from 'react';
import type { Theme } from '../types';

interface ImportProgressBarProps {
  /** Current processing stage description */
  stage: string;
  /** Number of rows processed */
  processed: number;
  /** Total number of rows */
  total: number;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Whether the import can be cancelled */
  canCancel: boolean;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Theme for styling */
  theme: Theme;
}

/**
 * Progress bar component for CSV import operations.
 * Shows processing stage, row count, percentage, and cancel button.
 */
export const ImportProgressBar: React.FC<ImportProgressBarProps> = ({
  stage,
  processed,
  total,
  percentage,
  canCancel,
  onCancel,
  theme,
}) => {
  return (
    <div
      className={`rounded-lg p-4 border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="space-y-3">
        {/* Header with stage and cancel button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Spinning indicator */}
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" />
            <span
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {stage}
            </span>
          </div>
          {canCancel && (
            <button
              onClick={onCancel}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                theme === 'dark'
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            {processed.toLocaleString()} / {total.toLocaleString()} rows
          </span>
          <span
            className={`font-medium ${
              theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline progress indicator for use in modals/smaller spaces.
 */
export const ImportProgressInline: React.FC<{
  percentage: number;
  theme: Theme;
}> = ({ percentage, theme }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent" />
      <div
        className={`flex-1 h-1.5 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}
      >
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`text-xs font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        {percentage}%
      </span>
    </div>
  );
};
