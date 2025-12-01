import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MenuMode, PrePackagedShelf, PriceTiers, Shelf, SupportedStates } from '../types';
import { Button } from './common/Button';
import { ToggleSwitch } from './common/ToggleSwitch';
import { ColorPicker } from './common/ColorPicker';
import { getShelfAccentColor } from '../utils/colorUtils';
import { useToast } from './ToastContainer';

type ConfigShelf = Shelf | PrePackagedShelf;

interface ShelfConfiguratorModalProps {
  isOpen: boolean;
  mode: MenuMode;
  currentState: SupportedStates;
  initialShelves: ConfigShelf[];
  defaultShelves: ConfigShelf[];
  onClose: () => void;
  onSave: (shelves: ConfigShelf[]) => void;
  onResetToDefaults: () => void;
  onExportConfig: () => string;
  onImportConfig: (payload: string) => { success: boolean; error?: string };
}

const makeEmptyPricing = (): PriceTiers => ({
  g: 0,
  eighth: 0,
  quarter: 0,
  half: 0,
  oz: 0,
});

const createBlankShelf = (mode: MenuMode): ConfigShelf =>
  mode === MenuMode.BULK
    ? ({
        id: `shelf-${Date.now()}`,
        name: 'New Shelf',
        pricing: makeEmptyPricing(),
        medicalPricing: undefined,
        color: 'bg-gray-700',
        textColor: 'text-white',
        strains: [],
        sortCriteria: null,
      } as Shelf)
    : ({
        id: `shelf-${Date.now()}`,
        name: 'New Shelf',
        color: 'bg-gray-700',
        textColor: 'text-white',
        products: [],
        sortCriteria: null,
      } as PrePackagedShelf);

export const ShelfConfiguratorModal: React.FC<ShelfConfiguratorModalProps> = ({
  isOpen,
  mode,
  currentState,
  initialShelves,
  defaultShelves,
  onClose,
  onSave,
  onResetToDefaults,
  onExportConfig,
  onImportConfig,
}) => {
  const [shelvesDraft, setShelvesDraft] = useState<ConfigShelf[]>(initialShelves);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openPricing, setOpenPricing] = useState<Set<string>>(new Set());
  const { addToast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const normalizeColorForPicker = (val: string, type: 'bg' | 'text') => {
    const bracketMatch = val.match(/^bg-\[(.+)\]$/) || val.match(/^text-\[(.+)\]$/);
    if (bracketMatch?.[1]) return bracketMatch[1];
    const accent = getShelfAccentColor(val);
    if (accent) return accent;
    if (val.startsWith(`${type}-`)) return val;
    return val;
  };

  const wrapColorForShelf = (val: string, type: 'bg' | 'text') => {
    if (val.startsWith(`${type}-`)) return val;
    if (val.match(/^#|^rgba|^hsla?|^cmyk/i)) {
      return `${type}-[${val}]`;
    }
    return `${type}-${val}`;
  };

  useEffect(() => {
    setShelvesDraft(initialShelves);
    setError(null);
  }, [initialShelves, mode]);

  const isBulk = mode === MenuMode.BULK;

  const validateShelves = (shelves: ConfigShelf[]): string | null => {
    const names = shelves.map((shelf) => shelf.name.trim().toLowerCase());
    const hasDupes = names.some((name, idx) => name && names.indexOf(name) !== idx);
    if (hasDupes) return 'Shelf names must be unique.';
    if (shelves.length === 0) return 'Add at least one shelf.';
    return null;
  };

  const handleSave = () => {
    const validationError = validateShelves(shelvesDraft);
    if (validationError) {
      setError(validationError);
      addToast({
        type: 'error',
        title: 'Cannot save shelves',
        message: validationError,
        duration: 4000,
      });
      return;
    }
    onSave(shelvesDraft);
  };

  const handleReset = () => {
    if (confirmReset) {
      onResetToDefaults();
      setConfirmReset(false);
      addToast({
        type: 'warning',
        title: 'Shelves reset to defaults',
        message: 'All custom shelves cleared and defaults restored.',
        duration: 4000,
      });
    } else {
      setConfirmReset(true);
      addToast({
        type: 'info',
        title: 'Confirm reset',
        message: 'Click reset again within 5 seconds to restore default shelves.',
        duration: 4000,
      });
      setTimeout(() => setConfirmReset(false), 5000);
    }
  };

  const updateShelf = (index: number, updates: Partial<ConfigShelf>) => {
    setShelvesDraft((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const updatePricing = (index: number, key: keyof PriceTiers, value: number) => {
    if (!isBulk) return;
    setShelvesDraft((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...(s as Shelf),
              pricing: { ...(s as Shelf).pricing, [key]: value },
            }
          : s
      )
    );
  };

  const updateMedicalPricing = (index: number, key: keyof PriceTiers, value: number) => {
    if (!isBulk) return;
    setShelvesDraft((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...(s as Shelf),
              medicalPricing: {
                ...(s as Shelf).medicalPricing,
                [key]: value,
              },
            }
          : s
      )
    );
  };

  const handleAddShelf = () => {
    setShelvesDraft((prev) => [...prev, createBlankShelf(mode)]);
  };

  const handleRemoveShelf = (index: number) => {
    setShelvesDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const moveShelf = (index: number, direction: -1 | 1) => {
    setShelvesDraft((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      copy.splice(target, 0, removed);
      return copy;
    });
  };

  const handleExport = () => {
    const payload = onExportConfig();
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shelf-config-${currentState}-${mode}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file?: File | null) => {
    if (!file) return;
    file.text().then((text) => {
      const result = onImportConfig(text);
      if (result.success) {
        // force reload from store via parent re-render (parent re-fetches initialShelves)
        setError(null);
      } else {
        setError(result.error || 'Failed to import config');
      }
    });
  };

  const priceFields = useMemo(() => ['g', 'eighth', 'quarter', 'half', 'oz'] as (keyof PriceTiers)[], []);

  const togglePricing = (id: string) => {
    setOpenPricing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Configure {isBulk ? 'Bulk' : 'Pre-Packaged'} Shelves</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">State: {currentState}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Defaults: {defaultShelves.length} shelves available</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              Export Config
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Import Config
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleImport(file || null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {shelvesDraft.map((shelf, index) => {
            const isFirst = index === 0;
            const isLast = index === shelvesDraft.length - 1;
            return (
              <div
                key={shelf.id}
                className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <label className="text-xs text-gray-600 dark:text-gray-300">Shelf Name</label>
                        <input
                          value={shelf.name}
                          onChange={(e) => updateShelf(index, { name: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                      <ColorPicker
                        label="Background Color"
                        value={normalizeColorForPicker(shelf.color, 'bg')}
                        onChange={(val) => updateShelf(index, { color: wrapColorForShelf(val, 'bg') })}
                        className="md:col-span-1"
                      />
                      <ColorPicker
                        label="Text Color"
                        value={normalizeColorForPicker(shelf.textColor, 'text')}
                        onChange={(val) => updateShelf(index, { textColor: wrapColorForShelf(val, 'text') })}
                        className="md:col-span-1"
                      />
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        onClick={() => togglePricing(shelf.id)}
                        className="px-3 py-2 text-sm rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-2"
                      >
                        <span>{openPricing.has(shelf.id) ? 'Hide Pricing' : 'Show Pricing'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">(click to expand)</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moveShelf(index, -1)}
                        disabled={isFirst}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moveShelf(index, 1)}
                        disabled={isLast}
                      >
                        ↓
                      </Button>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveShelf(index)}>
                      Remove
                    </Button>
                  </div>
                </div>

                    {openPricing.has(shelf.id) && (
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <ToggleSwitch
                            id={`show-pricing-${shelf.id}`}
                            checked={!shelf.hidePricing}
                            onChange={(val) => updateShelf(index, { hidePricing: !val })}
                            label="Show pricing in preview"
                            theme="light"
                          />
                          {isBulk && (
                            <ToggleSwitch
                              id={`med-pricing-${shelf.id}`}
                              checked={Boolean((shelf as Shelf).medicalPricing)}
                              onChange={(val) =>
                                updateShelf(index, {
                                  medicalPricing: val ? (shelf as Shelf).medicalPricing || makeEmptyPricing() : undefined,
                                })
                              }
                              label="Enable medical pricing"
                              theme="light"
                            />
                          )}
                        </div>
                    {isBulk && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Rec Pricing</p>
                          <div className="grid grid-cols-3 gap-2">
                            {priceFields.map((field) => (
                              <div key={field}>
                                <label className="text-[11px] text-gray-500 dark:text-gray-400 uppercase">{field}</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={(shelf as Shelf).pricing?.[field] ?? ''}
                                  onChange={(e) => updatePricing(index, field, parseFloat(e.target.value) || 0)}
                                  className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Med Pricing</p>
                          <div className="grid grid-cols-3 gap-2">
                            {priceFields.map((field) => (
                              <div key={field}>
                                <label className="text-[11px] text-gray-500 dark:text-gray-400 uppercase">{field}</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={(shelf as Shelf).medicalPricing?.[field] ?? ''}
                                  onChange={(e) => updateMedicalPricing(index, field, parseFloat(e.target.value) || 0)}
                                  className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                  disabled={!(shelf as Shelf).medicalPricing}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {!isBulk && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Pricing visibility will be applied to this shelf in the preview/export. (Pre-packaged shelves use per-product prices; no shelf-level fields.)
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Button variant="secondary" onClick={handleAddShelf}>
            Add Shelf
          </Button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>

        <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Defaults shown for {currentState}. Mode: {isBulk ? 'Bulk' : 'Pre-Packaged'}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Shelves
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
