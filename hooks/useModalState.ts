/**
 * Hook for managing modal visibility states.
 *
 * Consolidates all modal show/hide state into a single hook,
 * reducing the number of useState calls in App.tsx and providing
 * a cleaner API for modal management.
 */

import { useState, useCallback, useMemo } from 'react';

export interface ModalStates {
  // User-initiated modals
  showInstructions: boolean;
  showWhatsNew: boolean;
  showCsvImportModal: boolean;
  showCsvExportModal: boolean;
  showUnifiedExportModal: boolean;
  showHeaderMenu: boolean;
  showShelfConfigurator: boolean;

  // System/feedback modals
  showWelcomeModal: boolean;
  showSkippedModal: boolean;
  showImportDetailsModal: boolean;
  showExportOverlay: boolean;
}

export interface ModalActions {
  // Instructions modal
  openInstructions: () => void;
  closeInstructions: () => void;

  // What's New modal
  openWhatsNew: () => void;
  closeWhatsNew: () => void;

  // CSV Import modal
  openCsvImport: () => void;
  closeCsvImport: () => void;

  // CSV Export modal
  openCsvExport: () => void;
  closeCsvExport: () => void;

  // Unified Export modal
  openUnifiedExport: () => void;
  closeUnifiedExport: () => void;

  // Header Menu modal
  openHeaderMenu: () => void;
  closeHeaderMenu: () => void;

  // Shelf Configurator modal
  openShelfConfigurator: () => void;
  closeShelfConfigurator: () => void;

  // Welcome modal
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;

  // Skipped rows modal (CSV import feedback)
  openSkippedModal: () => void;
  closeSkippedModal: () => void;

  // Import details modal
  openImportDetailsModal: () => void;
  closeImportDetailsModal: () => void;

  // Export overlay
  showExportOverlayFn: () => void;
  hideExportOverlay: () => void;

  // Generic setter for direct access
  setModalState: <K extends keyof ModalStates>(modal: K, value: boolean) => void;

  // Close all modals
  closeAll: () => void;
}

export type UseModalStateReturn = ModalStates & ModalActions;

const WELCOME_SEEN_KEY = 'mango-has-seen-welcome';

/**
 * Custom hook for managing all modal visibility states.
 *
 * @returns Object containing modal states and actions
 *
 * @example
 * ```tsx
 * const modals = useModalState();
 *
 * // Open a modal
 * modals.openCsvImport();
 *
 * // Check if modal is open
 * if (modals.showCsvImportModal) { ... }
 *
 * // Close a modal
 * modals.closeCsvImport();
 * ```
 */
export function useModalState(): UseModalStateReturn {
  // User-initiated modals
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [showCsvExportModal, setShowCsvExportModal] = useState(false);
  const [showUnifiedExportModal, setShowUnifiedExportModal] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showShelfConfigurator, setShowShelfConfigurator] = useState(false);

  // System/feedback modals
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    // Check if user has seen the welcome modal before
    const hasSeen = localStorage.getItem(WELCOME_SEEN_KEY);
    return !hasSeen;
  });
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [showImportDetailsModal, setShowImportDetailsModal] = useState(false);
  const [showExportOverlay, setShowExportOverlay] = useState(false);

  // Actions - memoized to prevent unnecessary re-renders
  const openInstructions = useCallback(() => setShowInstructions(true), []);
  const closeInstructions = useCallback(() => setShowInstructions(false), []);

  const openWhatsNew = useCallback(() => setShowWhatsNew(true), []);
  const closeWhatsNew = useCallback(() => setShowWhatsNew(false), []);

  const openCsvImport = useCallback(() => setShowCsvImportModal(true), []);
  const closeCsvImport = useCallback(() => setShowCsvImportModal(false), []);

  const openCsvExport = useCallback(() => setShowCsvExportModal(true), []);
  const closeCsvExport = useCallback(() => setShowCsvExportModal(false), []);

  const openUnifiedExport = useCallback(() => setShowUnifiedExportModal(true), []);
  const closeUnifiedExport = useCallback(() => setShowUnifiedExportModal(false), []);

  const openHeaderMenu = useCallback(() => setShowHeaderMenu(true), []);
  const closeHeaderMenu = useCallback(() => setShowHeaderMenu(false), []);

  const openShelfConfigurator = useCallback(() => setShowShelfConfigurator(true), []);
  const closeShelfConfigurator = useCallback(() => setShowShelfConfigurator(false), []);

  const openWelcomeModal = useCallback(() => setShowWelcomeModal(true), []);
  const closeWelcomeModal = useCallback(() => {
    setShowWelcomeModal(false);
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
  }, []);

  const openSkippedModal = useCallback(() => setShowSkippedModal(true), []);
  const closeSkippedModal = useCallback(() => setShowSkippedModal(false), []);

  const openImportDetailsModal = useCallback(() => setShowImportDetailsModal(true), []);
  const closeImportDetailsModal = useCallback(() => setShowImportDetailsModal(false), []);

  const showExportOverlayFn = useCallback(() => setShowExportOverlay(true), []);
  const hideExportOverlay = useCallback(() => setShowExportOverlay(false), []);

  // Generic setter for flexibility
  const setModalState = useCallback(<K extends keyof ModalStates>(modal: K, value: boolean) => {
    switch (modal) {
      case 'showInstructions': setShowInstructions(value); break;
      case 'showWhatsNew': setShowWhatsNew(value); break;
      case 'showCsvImportModal': setShowCsvImportModal(value); break;
      case 'showCsvExportModal': setShowCsvExportModal(value); break;
      case 'showUnifiedExportModal': setShowUnifiedExportModal(value); break;
      case 'showHeaderMenu': setShowHeaderMenu(value); break;
      case 'showShelfConfigurator': setShowShelfConfigurator(value); break;
      case 'showWelcomeModal': setShowWelcomeModal(value); break;
      case 'showSkippedModal': setShowSkippedModal(value); break;
      case 'showImportDetailsModal': setShowImportDetailsModal(value); break;
      case 'showExportOverlay': setShowExportOverlay(value); break;
    }
  }, []);

  // Close all modals
  const closeAll = useCallback(() => {
    setShowInstructions(false);
    setShowWhatsNew(false);
    setShowCsvImportModal(false);
    setShowCsvExportModal(false);
    setShowUnifiedExportModal(false);
    setShowHeaderMenu(false);
    setShowShelfConfigurator(false);
    setShowSkippedModal(false);
    setShowImportDetailsModal(false);
    setShowExportOverlay(false);
    // Note: Welcome modal not included in closeAll
  }, []);

  // Return combined state and actions
  return useMemo(
    () => ({
      // States
      showInstructions,
      showWhatsNew,
      showCsvImportModal,
      showCsvExportModal,
      showUnifiedExportModal,
      showHeaderMenu,
      showShelfConfigurator,
      showWelcomeModal,
      showSkippedModal,
      showImportDetailsModal,
      showExportOverlay,

      // Actions
      openInstructions,
      closeInstructions,
      openWhatsNew,
      closeWhatsNew,
      openCsvImport,
      closeCsvImport,
      openCsvExport,
      closeCsvExport,
      openUnifiedExport,
      closeUnifiedExport,
      openHeaderMenu,
      closeHeaderMenu,
      openShelfConfigurator,
      closeShelfConfigurator,
      openWelcomeModal,
      closeWelcomeModal,
      openSkippedModal,
      closeSkippedModal,
      openImportDetailsModal,
      closeImportDetailsModal,
      showExportOverlayFn,
      hideExportOverlay,
      setModalState,
      closeAll,
    }),
    [
      showInstructions,
      showWhatsNew,
      showCsvImportModal,
      showCsvExportModal,
      showUnifiedExportModal,
      showHeaderMenu,
      showShelfConfigurator,
      showWelcomeModal,
      showSkippedModal,
      showImportDetailsModal,
      showExportOverlay,
      openInstructions,
      closeInstructions,
      openWhatsNew,
      closeWhatsNew,
      openCsvImport,
      closeCsvImport,
      openCsvExport,
      closeCsvExport,
      openUnifiedExport,
      closeUnifiedExport,
      openHeaderMenu,
      closeHeaderMenu,
      openShelfConfigurator,
      closeShelfConfigurator,
      openWelcomeModal,
      closeWelcomeModal,
      openSkippedModal,
      closeSkippedModal,
      openImportDetailsModal,
      closeImportDetailsModal,
      showExportOverlayFn,
      hideExportOverlay,
      setModalState,
      closeAll,
    ]
  );
}
