import React, { useEffect, useMemo, useState } from 'react';

type ColorMode = 'hex' | 'rgba' | 'hsl' | 'cmyk';

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clamp255 = (v: number) => Math.min(255, Math.max(0, Math.round(v)));

const toHex = (num: number) => num.toString(16).padStart(2, '0');

const rgbaToHex = ({ r, g, b }: RGBA) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

const hexToRgba = (hex: string): RGBA | null => {
  const cleaned = hex.replace('#', '').trim();
  if (![3, 6, 8].includes(cleaned.length)) return null;
  let r = 0, g = 0, b = 0, a = 255;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
    if (cleaned.length === 8) {
      a = parseInt(cleaned.slice(6, 8), 16);
    }
  }
  return { r, g, b, a: a / 255 };
};

const parseRgba = (input: string): RGBA | null => {
  const cleaned = input.replace(/rgba?\(/i, '').replace(')', '');
  const parts = cleaned.split(',').map(p => p.trim());
  if (parts.length < 3) return null;
  const r = clamp255(Number(parts[0]));
  const g = clamp255(Number(parts[1]));
  const b = clamp255(Number(parts[2]));
  const a = parts.length === 4 ? clamp01(Number(parts[3])) : 1;
  if ([r, g, b].some(v => Number.isNaN(v))) return null;
  return { r, g, b, a };
};

const parseHsl = (input: string): RGBA | null => {
  const cleaned = input.replace(/hsla?\(/i, '').replace(')', '').replace(/%/g, '');
  const parts = cleaned.split(',').map(p => p.trim());
  if (parts.length < 3) return null;
  const h = Number(parts[0]);
  const s = Number(parts[1]) / 100;
  const l = Number(parts[2]) / 100;
  const a = parts.length === 4 ? clamp01(Number(parts[3])) : 1;
  if ([h, s, l].some(v => Number.isNaN(v))) return null;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }

  return {
    r: clamp255((r1 + m) * 255),
    g: clamp255((g1 + m) * 255),
    b: clamp255((b1 + m) * 255),
    a,
  };
};

const parseCmyk = (input: string): RGBA | null => {
  const cleaned = input.replace(/cmyk\(/i, '').replace(')', '').replace(/%/g, '');
  const parts = cleaned.split(',').map(p => p.trim());
  if (parts.length < 4) return null;
  const [c, m, y, k] = parts.map(Number).map(v => clamp01(v / 100));
  if ([c, m, y, k].some(v => Number.isNaN(v))) return null;
  const r = clamp255(255 * (1 - c) * (1 - k));
  const g = clamp255(255 * (1 - m) * (1 - k));
  const b = clamp255(255 * (1 - y) * (1 - k));
  return { r, g, b, a: 1 };
};

const rgbaToRgbaString = ({ r, g, b, a }: RGBA) => `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;

const rgbaToHsl = ({ r, g, b, a }: RGBA) => {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    if (max === r1) h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0));
    else if (max === g1) h = ((b1 - r1) / d + 2);
    else h = ((r1 - g1) / d + 4);
    h *= 60;
  }
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return `hsla(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${Number(a.toFixed(2))})`;
};

const rgbaToCmyk = ({ r, g, b }: RGBA) => {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const k = 1 - Math.max(r1, g1, b1);
  if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';
  const c = ((1 - r1 - k) / (1 - k)) * 100;
  const m = ((1 - g1 - k) / (1 - k)) * 100;
  const y = ((1 - b1 - k) / (1 - k)) * 100;
  return `cmyk(${Math.round(c)}%, ${Math.round(m)}%, ${Math.round(y)}%, ${Math.round(k * 100)}%)`;
};

const swatches = ['#111827', '#1f2937', '#6b7280', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#f97316', '#ffffff'];

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, className = '' }) => {
  const [mode, setMode] = useState<ColorMode>('hex');
  const [rgba, setRgba] = useState<RGBA>({ r: 0, g: 0, b: 0, a: 1 });
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    const parsed =
      hexToRgba(value) ||
      parseRgba(value) ||
      parseHsl(value) ||
      parseCmyk(value);
    if (parsed) setRgba(parsed);
  }, [value]);

  const displayHex = useMemo(() => rgbaToHex(rgba), [rgba]);
  const displayRgba = useMemo(() => rgbaToRgbaString(rgba), [rgba]);
  const displayHsl = useMemo(() => rgbaToHsl(rgba), [rgba]);
  const displayCmyk = useMemo(() => rgbaToCmyk(rgba), [rgba]);

  const getDisplayForMode = (m: ColorMode) => {
    switch (m) {
      case 'hex':
        return displayHex;
      case 'rgba':
        return displayRgba;
      case 'hsl':
        return displayHsl;
      case 'cmyk':
      default:
        return displayCmyk;
    }
  };

  useEffect(() => {
    setInputValue(getDisplayForMode(mode));
  }, [mode, displayHex, displayRgba, displayHsl, displayCmyk]);

  const handleModeInput = (nextMode: ColorMode, text: string) => {
    setInputValue(text);
    let parsed: RGBA | null = null;
    switch (nextMode) {
      case 'hex':
        parsed = hexToRgba(text);
        break;
      case 'rgba':
        parsed = parseRgba(text);
        break;
      case 'hsl':
        parsed = parseHsl(text);
        break;
      case 'cmyk':
        parsed = parseCmyk(text);
        break;
      default:
        break;
    }
    if (parsed) {
      setRgba(parsed);
      const nextValue = parsed.a === 1 ? rgbaToHex(parsed) : rgbaToRgbaString(parsed);
      onChange(nextValue);
    }
  };

  const renderInputForMode = () => {
    const shared = 'w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-sm';
    if (mode === 'hex') {
      return (
        <input
          value={inputValue}
          onChange={(e) => handleModeInput('hex', e.target.value)}
          className={shared}
        />
      );
    }
    if (mode === 'rgba') {
      return (
        <input
          value={inputValue}
          onChange={(e) => handleModeInput('rgba', e.target.value)}
          className={shared}
        />
      );
    }
    if (mode === 'hsl') {
      return (
        <input
          value={inputValue}
          onChange={(e) => handleModeInput('hsl', e.target.value)}
          className={shared}
        />
      );
    }
    return (
      <input
        value={inputValue}
        onChange={(e) => handleModeInput('cmyk', e.target.value)}
        className={shared}
      />
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</p>}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded border dark:border-gray-600"
          style={{ background: displayRgba }}
        />
        <div className="flex-1 space-y-1">
          <div className="flex gap-2">
            {(['hex', 'rgba', 'hsl', 'cmyk'] as ColorMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-xs px-2 py-1 rounded border ${mode === m ? 'bg-orange-500 text-white border-orange-500' : 'dark:border-gray-700 border-gray-300 text-gray-700 dark:text-gray-300'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          {renderInputForMode()}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {swatches.map((hex) => (
          <button
            key={hex}
            className="w-8 h-8 rounded border dark:border-gray-700"
            style={{ background: hex }}
            onClick={() => {
              setRgba(hexToRgba(hex) || rgba);
              onChange(hex);
            }}
            title={hex}
          />
        ))}
      </div>
    </div>
  );
};
