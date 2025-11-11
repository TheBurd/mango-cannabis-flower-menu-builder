export const getShelfAccentColor = (colorClass: string): string | null => {
  if (!colorClass) return null;

  const trimmed = colorClass.trim();

  const gradientColorMap: Record<string, string> = {
    'bg-mango-gradient': '#f46a4e',
    'bg-gradient-to-r from-red-500 to-orange-500': '#f97316',
    'bg-gradient-to-r from-rose-600 to-pink-600': '#db2777',
    'bg-gradient-to-r from-emerald-600 to-teal-600': '#0f766e',
    'bg-gradient-to-r from-gray-600 to-slate-600': '#475569',
    'bg-gradient-to-r from-orange-500 to-yellow-400': '#facc15',
    'bg-gradient-to-r from-amber-400 to-orange-400': '#fb923c',
  };

  const solidColorMap: Record<string, string> = {
    'bg-purple-600': '#9333ea',
    'bg-amber-500': '#f59e0b',
    'bg-sky-500': '#0ea5e9',
    'bg-slate-700': '#334155',
    'bg-rose-500': '#f43f5e',
    'bg-emerald-500': '#10b981',
    'bg-indigo-500': '#6366f1',
    'bg-gray-500': '#6b7280',
    'bg-lime-600': '#65a30d',
    'bg-teal-600': '#0d9488',
    'bg-violet-500': '#8b5cf6',
    'bg-orange-500': '#f97316',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-pink-500': '#ec4899',
    'bg-red-500': '#ef4444',
    'bg-yellow-500': '#eab308',
    'bg-[#F46A4E]': '#f46a4e',
    'bg-[#F7824A]': '#f7824a',
    'bg-[#FA9B48]': '#fa9b48',
    'bg-[#FFA447]': '#ffa447',
    'bg-[#2A9016]': '#2a9016',
    'bg-[#3FA525]': '#3fa525',
    'bg-[#55BA35]': '#55ba35',
    'bg-[#79BC3F]': '#79bc3f',
    'bg-[#F46A4E] bg-[#F46A4E]': '#f46a4e',
  };

  if (gradientColorMap[trimmed]) {
    return gradientColorMap[trimmed];
  }

  if (solidColorMap[trimmed]) {
    return solidColorMap[trimmed];
  }

  const bracketMatch = trimmed.match(/^bg-\[#([0-9a-fA-F]{6})\]$/);
  if (bracketMatch) {
    return `#${bracketMatch[1]}`;
  }

  return null;
};

export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
