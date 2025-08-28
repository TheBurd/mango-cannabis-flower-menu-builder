import React, { useMemo } from 'react';
import { WeightOrganizationSettings } from '../utils/weightBasedOrganization';
import { Button } from './common/Button';
import { Select } from './common/Select';
import { ToggleSwitch } from './common/ToggleSwitch';
import { Icon } from './common/Icon';

interface WeightOrganizationControlsProps {
  settings: WeightOrganizationSettings;
  onSettingsChange: (settings: WeightOrganizationSettings) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  theme: 'light' | 'dark';
  disabled?: boolean;
  showAdvancedOptions?: boolean;
}

const PRIMARY_SORT_OPTIONS = [
  { value: 'weight', label: 'Weight (Size)' },
  { value: 'price', label: 'Price' },
  { value: 'brand', label: 'Brand' },
  { value: 'thc', label: 'THC %' },
  { value: 'name', label: 'Product Name' },
  { value: 'inventory', label: 'Inventory Status' },
];

const SECONDARY_SORT_OPTIONS = [
  { value: '', label: 'None' },
  ...PRIMARY_SORT_OPTIONS,
];

const GROUP_BY_OPTIONS = [
  { value: 'weight', label: 'Weight Categories' },
  { value: 'brand', label: 'Brand Groups' },
  { value: 'price-tier', label: 'Price Tiers' },
  { value: 'none', label: 'Single List' },
];

const SORT_DIRECTION_OPTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

export const WeightOrganizationControls: React.FC<WeightOrganizationControlsProps> = ({
  settings,
  onSettingsChange,
  isExpanded,
  onToggleExpanded,
  theme,
  disabled = false,
  showAdvancedOptions = false
}) => {
  const containerClass = useMemo(() => 
    `border rounded-lg transition-all duration-200 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    [theme, disabled]
  );

  const headerClass = useMemo(() => 
    `flex items-center justify-between p-3 cursor-pointer ${
      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    } ${disabled ? 'cursor-not-allowed' : ''}`,
    [theme, disabled]
  );

  const contentClass = useMemo(() => 
    `p-4 border-t space-y-4 ${
      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
    }`,
    [theme]
  );

  const handleSettingChange = (key: keyof WeightOrganizationSettings, value: any) => {
    if (disabled) return;
    
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const presetConfigurations = useMemo(() => [
    {
      name: 'Weight Categories',
      description: 'Organize by 3.5g, 7g, 14g, 28g with price tiers',
      settings: {
        ...settings,
        primarySort: 'weight' as const,
        secondarySort: 'price' as const,
        groupBy: 'weight' as const,
        separateShakeProducts: true,
      }
    },
    {
      name: 'Brand Showcase',
      description: 'Group by brand with weight sorting within each brand',
      settings: {
        ...settings,
        primarySort: 'brand' as const,
        secondarySort: 'weight' as const,
        groupBy: 'brand' as const,
        emphasizeBrands: true,
      }
    },
    {
      name: 'Price Tiers',
      description: 'Organize by price ranges across all weights',
      settings: {
        ...settings,
        primarySort: 'price' as const,
        secondarySort: 'weight' as const,
        groupBy: 'price-tier' as const,
        sortDirection: 'desc' as const,
      }
    },
    {
      name: 'Simple List',
      description: 'Single list sorted by weight and price',
      settings: {
        ...settings,
        primarySort: 'weight' as const,
        secondarySort: 'price' as const,
        groupBy: 'none' as const,
        separateShakeProducts: false,
      }
    }
  ], [settings]);

  const applyPreset = (presetSettings: WeightOrganizationSettings) => {
    if (disabled) return;
    onSettingsChange(presetSettings);
  };

  return (
    <div className={containerClass}>
      {/* Header */}
      <div 
        className={headerClass}
        onClick={() => !disabled && onToggleExpanded()}
      >
        <div className="flex items-center space-x-2">
          <Icon 
            name="sort" 
            className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} 
          />
          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Weight Organization
          </span>
        </div>
        <Icon 
          name={isExpanded ? "chevron-up" : "chevron-down"}
          className={`w-4 h-4 transition-transform ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
        />
      </div>

      {/* Content */}
      {isExpanded && (
        <div className={contentClass}>
          {/* Preset Configurations */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presetConfigurations.map((preset) => (
                <Button
                  key={preset.name}
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset(preset.settings)}
                  disabled={disabled}
                  className="text-left p-2 h-auto"
                  title={preset.description}
                >
                  <div className="text-xs font-medium">{preset.name}</div>
                  <div className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {preset.description}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Primary Sort */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Primary Sort
            </label>
            <Select
              value={settings.primarySort}
              onChange={(value) => handleSettingChange('primarySort', value)}
              options={PRIMARY_SORT_OPTIONS}
              disabled={disabled}
              theme={theme}
            />
          </div>

          {/* Secondary Sort */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Secondary Sort
            </label>
            <Select
              value={settings.secondarySort || ''}
              onChange={(value) => handleSettingChange('secondarySort', value || undefined)}
              options={SECONDARY_SORT_OPTIONS.filter(opt => opt.value !== settings.primarySort)}
              disabled={disabled}
              theme={theme}
            />
          </div>

          {/* Group By */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Group Products By
            </label>
            <Select
              value={settings.groupBy}
              onChange={(value) => handleSettingChange('groupBy', value)}
              options={GROUP_BY_OPTIONS}
              disabled={disabled}
              theme={theme}
            />
          </div>

          {/* Sort Direction */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Sort Direction
            </label>
            <Select
              value={settings.sortDirection}
              onChange={(value) => handleSettingChange('sortDirection', value)}
              options={SORT_DIRECTION_OPTIONS}
              disabled={disabled}
              theme={theme}
            />
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <ToggleSwitch
              label="Prioritize Inventory Alerts"
              description="Show low inventory items first"
              checked={settings.prioritizeInventoryStatus}
              onChange={(checked) => handleSettingChange('prioritizeInventoryStatus', checked)}
              disabled={disabled}
              theme={theme}
            />

            <ToggleSwitch
              label="Separate Shake Products"
              description="Group shake/trim separately from flower"
              checked={settings.separateShakeProducts}
              onChange={(checked) => handleSettingChange('separateShakeProducts', checked)}
              disabled={disabled}
              theme={theme}
            />

            <ToggleSwitch
              label="Emphasize Brand Names"
              description="Make brand names more prominent"
              checked={settings.emphasizeBrands}
              onChange={(checked) => handleSettingChange('emphasizeBrands', checked)}
              disabled={disabled}
              theme={theme}
            />
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className={`pt-4 border-t space-y-3 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Advanced Options
              </div>
              
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Additional customization options would appear here in a full implementation.
                This could include custom price tier ranges, brand priority ordering,
                inventory status keywords, and more.
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSettingsChange({
                primarySort: 'weight',
                secondarySort: 'price',
                groupBy: 'weight',
                sortDirection: 'asc',
                prioritizeInventoryStatus: true,
                separateShakeProducts: true,
                emphasizeBrands: true,
              })}
              disabled={disabled}
              className="w-full"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};