
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { FlowerShelvesPanel } from './components/FlowerShelvesPanel';
import { MenuPreviewPanel } from './components/MenuPreviewPanel';
import { Shelf, Strain, PreviewSettings, SupportedStates, StrainType, ArtboardSize, SortCriteria } from './types';
import { 
  INITIAL_PREVIEW_SETTINGS, 
  getDefaultShelves, 
  DEFAULT_SHELVES_PANEL_WIDTH, 
  MIN_SHELVES_PANEL_WIDTH, 
  MIN_PREVIEW_PANEL_WIDTH, 
  DIVIDER_WIDTH,
  CSV_STRAIN_TYPE_MAP,
  APP_STRAIN_TYPE_TO_CSV_SUFFIX,
  THC_DECIMAL_PLACES,
  STRAIN_TYPES_ORDERED
} from './constants';




export interface ExportAction {
  type: 'png' | 'jpeg';
  filename: string;
  artboardSize: ArtboardSize; 
  timestamp: number; // To trigger effect even if other params are same
}

const sortStrains = (strains: Strain[], criteria: SortCriteria | null): Strain[] => {
  if (!criteria) return strains;

  const sortedStrains = [...strains]; // Create a copy to sort

  sortedStrains.sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (criteria.key) {
      case 'name':
        valA = a.name?.toLowerCase() || '';
        valB = b.name?.toLowerCase() || '';
        break;
      case 'grower':
        valA = a.grower?.toLowerCase() || '';
        valB = b.grower?.toLowerCase() || '';
        break;
      case 'type':
        valA = STRAIN_TYPES_ORDERED.indexOf(a.type);
        valB = STRAIN_TYPES_ORDERED.indexOf(b.type);
        break;
      case 'thc':
        // Nulls are considered "lesser"
        valA = a.thc === null ? -Infinity : a.thc;
        valB = b.thc === null ? -Infinity : b.thc;
        break;
      case 'isLastJar':
        valA = a.isLastJar;
        valB = b.isLastJar;
        break;
      default:
        return 0;
    }

    if (valA < valB) {
      return criteria.direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return criteria.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  return sortedStrains;
};


const App: React.FC = () => {
  const [currentAppState, setCurrentAppState] = useState<SupportedStates>(SupportedStates.OKLAHOMA);
  const [shelves, setShelves] = useState<Shelf[]>(() => getDefaultShelves(currentAppState));
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>(INITIAL_PREVIEW_SETTINGS);
  
  const [isPreviewRefreshPending, setIsPreviewRefreshPending] = useState<boolean>(false);
  const [hasUnrefreshedChanges, setHasUnrefreshedChanges] = useState<boolean>(false);

  const [newlyAddedStrainId, setNewlyAddedStrainId] = useState<string | null>(null);

  const [shelvesPanelWidth, setShelvesPanelWidth] = useState<number>(DEFAULT_SHELVES_PANEL_WIDTH);
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef<boolean>(false);

  const [exportFilename, setExportFilename] = useState<string>('mango-menu');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportAction, setExportAction] = useState<ExportAction | null>(null);
  const csvImportInputRef = useRef<HTMLInputElement | null>(null);
  const [showExportOverlay, setShowExportOverlay] = useState<boolean>(false);

  const [globalSortCriteria, setGlobalSortCriteria] = useState<SortCriteria | null>(null);


  useEffect(() => {
    setShelves(getDefaultShelves(currentAppState));
    setGlobalSortCriteria(null); // Reset global sort on state change
    setHasUnrefreshedChanges(true);
  }, [currentAppState]);

  const recordChange = (updater: () => void) => {
    updater();
    setHasUnrefreshedChanges(true);
    // Reset all sort criteria on any data change to ensure UI reflects fresh state
    setGlobalSortCriteria(null);
    setShelves(prevShelves => 
      prevShelves.map(shelf => ({ ...shelf, sortCriteria: null }))
    );
  };
  
  useEffect(() => {
    if (isPreviewRefreshPending) {
      const timer = setTimeout(() => setIsPreviewRefreshPending(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isPreviewRefreshPending]);

  useEffect(() => {
    if (newlyAddedStrainId) {
      const timer = setTimeout(() => setNewlyAddedStrainId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedStrainId]);


  const handleAddStrain = useCallback((shelfId: string) => {
    const newStrainId = crypto.randomUUID();
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId
            ? {
                ...shelf,
                strains: [
                  ...shelf.strains,
                  {
                    id: newStrainId,
                    name: '',
                    grower: '',
                    thc: null,
                    type: StrainType.HYBRID,
                    isLastJar: false,
                  },
                ],
              }
            : shelf
        )
      );
    });
    setNewlyAddedStrainId(newStrainId);
  }, []);

  const handleUpdateStrain = useCallback((shelfId: string, strainId: string, updatedStrain: Partial<Strain>) => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId
            ? {
                ...shelf,
                strains: shelf.strains.map(strain =>
                  strain.id === strainId ? { ...strain, ...updatedStrain } : strain
                ),
              }
            : shelf
        )
      );
    });
  }, []);

  const handleRemoveStrain = useCallback((shelfId: string, strainId: string) => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId
            ? { ...shelf, strains: shelf.strains.filter(s => s.id !== strainId) }
            : shelf
        )
      );
    });
  }, []);

  const handleCopyStrain = useCallback((shelfId: string, strainId: string, direction: 'above' | 'below') => {
    recordChange(() => {
      setShelves(prevShelves => {
        const shelfIndex = prevShelves.findIndex(s => s.id === shelfId);
        if (shelfIndex === -1) return prevShelves;

        const currentShelf = prevShelves[shelfIndex];
        const strainIndex = currentShelf.strains.findIndex(s => s.id === strainId);
        if (strainIndex === -1) return prevShelves;

        const strainToCopy = { ...currentShelf.strains[strainIndex], id: crypto.randomUUID() };
        const newStrains = [...currentShelf.strains];

        if (direction === 'above') {
          newStrains.splice(strainIndex, 0, strainToCopy);
        } else {
          newStrains.splice(strainIndex + 1, 0, strainToCopy);
        }
        
        const updatedShelves = [...prevShelves];
        updatedShelves[shelfIndex] = { ...currentShelf, strains: newStrains };
        return updatedShelves;
      });
    });
  }, []);

  const handleClearShelfStrains = useCallback((shelfId: string) => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId ? { ...shelf, strains: [] } : shelf
        )
      );
    });
  }, []);

  const handleClearAllShelves = useCallback(() => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf => ({ ...shelf, strains: [] }))
      );
    });
  }, []);

  const handleClearAllLastJars = useCallback(() => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf => ({
          ...shelf,
          strains: shelf.strains.map(strain => ({ ...strain, isLastJar: false })),
        }))
      );
    });
  }, []);

  const handleRefreshPreview = useCallback(() => {
    setIsPreviewRefreshPending(true);
    setHasUnrefreshedChanges(false);
  }, []);
  
  const handleUpdatePreviewSettings = useCallback((newSettings: Partial<PreviewSettings>) => {
     // For preview settings, we don't want to reset sorts, so don't use recordChange
     setPreviewSettings(prev => ({ ...prev, ...newSettings }));
     setHasUnrefreshedChanges(true); // Still mark as needing refresh
  }, []);

  const handleUpdateGlobalSortCriteria = useCallback((key: SortCriteria['key']) => {
    // Applying a global sort will reset shelf-specific sorts and any previous global sort.
    // It does not use recordChange directly to avoid double-resetting sorts.
    setGlobalSortCriteria(prevCriteria => {
      if (prevCriteria && prevCriteria.key === key) {
        return { ...prevCriteria, direction: prevCriteria.direction === 'asc' ? 'desc' : 'asc' };
      }
      let defaultDirection: 'asc' | 'desc' = 'asc';
      if (key === 'thc' || key === 'isLastJar') {
        defaultDirection = 'desc';
      }
      return { key, direction: defaultDirection };
    });
    setShelves(prevShelves => prevShelves.map(s => ({ ...s, sortCriteria: null })));
    setHasUnrefreshedChanges(true);
  }, []);

  const handleUpdateShelfSortCriteria = useCallback((shelfId: string, key: SortCriteria['key']) => {
    // Applying a shelf sort will reset global sort.
    // It does not use recordChange directly to avoid double-resetting sorts.
    setShelves(prevShelves =>
      prevShelves.map(shelf => {
        if (shelf.id === shelfId) {
          let newCriteria: SortCriteria;
          if (shelf.sortCriteria && shelf.sortCriteria.key === key) {
            newCriteria = { ...shelf.sortCriteria, direction: shelf.sortCriteria.direction === 'asc' ? 'desc' : 'asc' };
          } else {
            let defaultDirection: 'asc' | 'desc' = 'asc';
            if (key === 'thc' || key === 'isLastJar') {
              defaultDirection = 'desc';
            }
            newCriteria = { key, direction: defaultDirection };
          }
          return { ...shelf, sortCriteria: newCriteria };
        }
        return shelf;
      })
    );
    setGlobalSortCriteria(null); // Clear global sort
    setHasUnrefreshedChanges(true);
  }, []);


  const handleMouseDownOnDivider = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.classList.add('dragging-divider');

    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!isResizing.current || !mainContainerRef.current) return;

      const containerRect = mainContainerRef.current.getBoundingClientRect();
      let newWidth = event.clientX - containerRect.left;
      const totalWidth = mainContainerRef.current.offsetWidth;
      
      if (newWidth < MIN_SHELVES_PANEL_WIDTH) {
        newWidth = MIN_SHELVES_PANEL_WIDTH;
      } else if (totalWidth - newWidth - DIVIDER_WIDTH < MIN_PREVIEW_PANEL_WIDTH) {
        newWidth = totalWidth - MIN_PREVIEW_PANEL_WIDTH - DIVIDER_WIDTH;
      }
      setShelvesPanelWidth(newWidth);
    };

    const handleGlobalMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.classList.remove('dragging-divider');
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

  }, []);

  const triggerImageExport = useCallback((type: 'png' | 'jpeg') => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportOverlay(true); // Show overlay
    setExportAction({
      type,
      filename: exportFilename || 'mango-menu',
      artboardSize: previewSettings.artboardSize, 
      timestamp: Date.now(),
    });
  }, [isExporting, exportFilename, previewSettings.artboardSize]);

  const handleExportCSV = useCallback(() => {
    const header = ["Category", "Strain Name", "Grow/Brand", "THC Percentage", "Class", "lastjar"];
    
    const rows = shelves.flatMap(shelf => {
      if (shelf.strains.length === 0) return [];
      // Use sorted strains for CSV export based on current criteria
      const activeSortCriteria = shelf.sortCriteria || globalSortCriteria;
      const strainsToExport = sortStrains([...shelf.strains], activeSortCriteria);

      return strainsToExport.map(strain => {
        const thcPercentageString = strain.thc === null ? "-" : `${strain.thc.toFixed(THC_DECIMAL_PLACES)}%`;
        const classString = APP_STRAIN_TYPE_TO_CSV_SUFFIX[strain.type] || 'H';
        
        return [
          shelf.name,
          strain.name || "Unnamed Strain",
          strain.grower || "",
          thcPercentageString,
          classString,
          strain.isLastJar ? "lastjar" : ""
        ].map(field => `"${String(field).replace(/"/g, '""')}"`);
      });
    });

    if (rows.length === 0) {
      alert("No strain data to export.");
      return;
    }

    const csvContent = [header.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const filenameToUse = (exportFilename || 'mango-menu-export') + '.csv';
      link.setAttribute("href", url);
      link.setAttribute("download", filenameToUse);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [shelves, exportFilename, globalSortCriteria]);

  const handleImportCSVRequest = useCallback(() => {
    csvImportInputRef.current?.click();
  }, []);
  
  const processImportedCSVFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      if (!csvData) {
        alert("Failed to read CSV file.");
        return;
      }

      const lines = csvData.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        alert("CSV file is empty or contains only a header.");
        return;
      }

      const importedStrainsByShelf: Record<string, Strain[]> = {};
      let importedCount = 0;
      let skippedRowCount = 0;

      // Create a temporary map for faster shelf lookup by name
      const shelfNameMap = new Map(shelves.map(s => [s.name.toLowerCase(), s.id]));


      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        const cells = rawLine.split(',').map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        if (cells.length < 5) {
            console.warn(`SKIPPING Row ${i + 1}: Not enough cells (found ${cells.length}, expected at least 5). Line: "${rawLine}"`);
            skippedRowCount++;
            continue;
        }

        const csvCategory = cells[0].toLowerCase(); // Normalize category name for lookup
        const csvStrainName = cells[1];
        const csvGrower = cells[2];
        const csvThcPercentString = cells[3];
        const csvClassString = cells[4];
        const csvLastJar = cells.length > 5 ? cells[5]?.toLowerCase() === 'lastjar' : false;
        
        const targetShelfId = shelfNameMap.get(csvCategory);
        if (!targetShelfId) {
          console.warn(`SKIPPING Row ${i + 1}: Strain "${csvStrainName}" for unknown category "${cells[0]}".`);
          skippedRowCount++;
          continue;
        }

        let thcValue: number | null = null;
        if (csvThcPercentString && csvThcPercentString !== "-") {
            const thcNumericMatch = csvThcPercentString.match(/(\d*\.?\d+)/);
            if (thcNumericMatch && thcNumericMatch[1]) {
                thcValue = parseFloat(thcNumericMatch[1]);
                if (isNaN(thcValue)) thcValue = null;
            }
        }

        let strainType: StrainType = StrainType.HYBRID;
        const rawClass = csvClassString ? csvClassString.trim() : "";
        if (rawClass) {
            const normalizedClass = rawClass.toUpperCase().replace(/[\s-./]/g, '');
            const mappedType = CSV_STRAIN_TYPE_MAP[normalizedClass];
            if (mappedType) {
              strainType = mappedType;
            }
        }
        
        const newStrain: Strain = {
          id: crypto.randomUUID(),
          name: csvStrainName || 'Unnamed Strain',
          grower: csvGrower || '',
          thc: thcValue,
          type: strainType,
          isLastJar: csvLastJar,
        };

        if (!importedStrainsByShelf[targetShelfId]) {
          importedStrainsByShelf[targetShelfId] = [];
        }
        importedStrainsByShelf[targetShelfId].push(newStrain);
        importedCount++;
      }
      
      // Use recordChange for CSV import to ensure sorts are reset
      recordChange(() => {
        setShelves(prevShelves => 
          prevShelves.map(shelf => ({
            ...shelf,
            strains: importedStrainsByShelf[shelf.id] || [], 
            // sortCriteria will be reset by recordChange
          }))
        );
        // globalSortCriteria will be reset by recordChange
      });

      alert(`CSV Import Complete: ${importedCount} strains loaded. ${skippedRowCount > 0 ? `${skippedRowCount} rows skipped (see console for details).` : ''}`);
      if (csvImportInputRef.current) {
        csvImportInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      alert("Error reading CSV file.");
       if (csvImportInputRef.current) {
        csvImportInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }, [shelves, recordChange]); // Added recordChange to dependencies

  const processedShelves = useMemo(() => {
    return shelves.map(shelf => {
      const activeSortCriteria = shelf.sortCriteria || globalSortCriteria;
      return {
        ...shelf,
        strains: sortStrains(shelf.strains, activeSortCriteria) 
      };
    });
  }, [shelves, globalSortCriteria]);


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-50 font-sans antialiased">
      <Header appName="Mango Menu Maestro" currentOklahomaState={currentAppState} onStateChange={setCurrentAppState} />
      <Toolbar
        onRefreshPreview={handleRefreshPreview}
        onClearAllShelves={handleClearAllShelves}
        onClearAllLastJars={handleClearAllLastJars}
        hasUnrefreshedChanges={hasUnrefreshedChanges}
        exportFilename={exportFilename}
        onExportFilenameChange={setExportFilename}
        onExportPNG={() => triggerImageExport('png')}
        onExportJPEG={() => triggerImageExport('jpeg')}
        onExportCSV={handleExportCSV}
        onImportCSVRequest={handleImportCSVRequest}
        isExporting={isExporting}
        globalSortCriteria={globalSortCriteria}
        onUpdateGlobalSortCriteria={handleUpdateGlobalSortCriteria}
      />
      <main ref={mainContainerRef} className="flex flex-1 overflow-hidden pt-2 px-2 pb-2 bg-gray-800">
        <FlowerShelvesPanel
          style={{ width: `${shelvesPanelWidth}px`, flexShrink: 0 }}
          shelves={processedShelves} // Use processed (sorted) shelves
          onAddStrain={handleAddStrain}
          onUpdateStrain={handleUpdateStrain}
          onRemoveStrain={handleRemoveStrain}
          onCopyStrain={handleCopyStrain}
          onClearShelfStrains={handleClearShelfStrains}
          newlyAddedStrainId={newlyAddedStrainId}
          onUpdateShelfSortCriteria={handleUpdateShelfSortCriteria}
        />
        <div
          className={`panel-divider ${isResizing.current ? 'dragging' : ''}`}
          onMouseDown={handleMouseDownOnDivider}
          role="separator"
          aria-label="Resize panels"
          aria-orientation="vertical"
          aria-controls="flower-shelves-panel menu-preview-panel"
          aria-valuenow={shelvesPanelWidth}
          aria-valuemin={MIN_SHELVES_PANEL_WIDTH}
          aria-valuemax={mainContainerRef.current ? mainContainerRef.current.offsetWidth - MIN_PREVIEW_PANEL_WIDTH - DIVIDER_WIDTH : undefined}
        >
        </div>
        <MenuPreviewPanel
          shelves={processedShelves} // Use processed (sorted) shelves
          settings={previewSettings}
          onSettingsChange={handleUpdatePreviewSettings}
          needsRefreshSignal={isPreviewRefreshPending}
          hasUnrefreshedChanges={hasUnrefreshedChanges}
          exportAction={exportAction}
          onExportComplete={() => {
            setExportAction(null);
            setIsExporting(false);
            setShowExportOverlay(false); // Hide overlay
          }}
        />
      </main>
      <input
        type="file"
        ref={csvImportInputRef}
        accept=".csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processImportedCSVFile(e.target.files[0]);
          }
        }}
      />
      {showExportOverlay && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50"
          role="alertdialog"
          aria-live="assertive"
          aria-busy="true"
          aria-label="Exporting image, please wait"
        >
          <div className="bg-white p-8 rounded-lg shadow-xl text-gray-800 flex items-center space-x-4">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold">Exporting your masterpiece...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
