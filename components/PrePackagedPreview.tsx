// LEGACY COMPONENT - This component has been replaced with the new PrePackagedArtboard
// It's kept for backwards compatibility during the transition
// The new implementation follows the MenuPreviewPanel/PreviewArtboard architecture
// TODO: Remove this file once transition to PrePackagedArtboard is complete

import React, { forwardRef } from 'react';
import { PrePackagedShelf, PreviewSettings, SupportedStates } from '../types';
import { PrePackagedArtboard } from './PrePackagedArtboard';

interface PrePackagedPreviewProps {
  shelves: PrePackagedShelf[];
  settings: PreviewSettings;
  currentState: SupportedStates;
  onOverflowDetected?: (hasOverflow: boolean) => void;
}

// Legacy wrapper that forwards to the new PrePackagedArtboard component
export const PrePackagedPreview = forwardRef<HTMLDivElement, PrePackagedPreviewProps>((
  { shelves, settings, currentState, onOverflowDetected }, ref
) => {
  return (
    <PrePackagedArtboard
      ref={ref}
      shelves={shelves}
      settings={settings}
      currentState={currentState}
      onOverflowDetected={onOverflowDetected}
    />
  );
});

PrePackagedPreview.displayName = 'PrePackagedPreview';