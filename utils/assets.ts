// Asset utility to handle paths in both development and production
export function getAssetPath(path: string): string {
  // @ts-ignore - Vite provides import.meta.env
  if (import.meta.env?.DEV) {
    // In development, Vite serves assets from the root due to publicDir: 'assets'
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // In production (Electron), use relative path
  return path.startsWith('/') ? `.${path}` : `./${path}`;
}

// Specific asset getters for type safety
// Note: Since publicDir: 'assets', the assets/ prefix is removed in the served paths
export const getLogoPath = () => getAssetPath('/logos/mcLogo_V3.svg');
export const getIconPath = (iconName: string) => getAssetPath(`/icons/${iconName}`);
export const getImagePath = (imageName: string) => getAssetPath(`/images/${imageName}`);
export const getPatternPath = (patternName: string) => getAssetPath(`/patterns/${patternName}`);

// Available header images
export const HEADER_IMAGES = {
  small: {
    '150h': 'Flower Menu Page Header - 3300x150.jpg',
    '200h': 'Flower Menu Page Header - 2550x200.jpg',
    '300h_narrow': 'Flower Menu Page Header - 3300x300.jpg',
    '300h_wide': 'Flower Menu Page Header - 1872x300.jpg',
  },
  medium: {
    '450h': 'Flower Menu Page Header - 2550x450.jpg',
    '500h': 'Flower Menu Page Header - 3300x500.jpg',
  },
  large: {
    '600h_wide': 'Flower Menu Page Header - 2550x600.jpg',
    '600h_narrow': 'Flower Menu Page Header - 1872x600.jpg',
  }
} as const;

export const getHeaderImagePath = (size: keyof typeof HEADER_IMAGES, variant: string) => {
  const category = HEADER_IMAGES[size] as Record<string, string>;
  const imageName = category[variant];
  return imageName ? getImagePath(imageName) : null;
}; 