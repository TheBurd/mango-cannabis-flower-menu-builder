
# Mango Cannabis Menu Builder - Project Overview

This document provides an overview of the Mango Cannabis Menu Builder application, its file structure, and the purpose of key components and functions.

## Project Goal

The application allows Mango Cannabis employees to build, customize, and preview menus for their cannabis flower strains. These menus can then be exported as images (PNG/JPEG) for printing or digital display, or as CSV data.

## Core Technologies

- **React 19**: For building the user interface.
- **TypeScript**: For static typing and improved code quality.
- **Tailwind CSS**: For utility-first styling (loaded via CDN).
- **dom-to-image**: For capturing the menu preview as an image (loaded via npm).
- **ES Modules**: Modern JavaScript module system.

## File Structure and Descriptions

### Root Directory

-   **`index.html`**:
    -   The main HTML entry point for the application.
    -   Loads Tailwind CSS, custom Google Fonts (`Inter`, `Poppins`).
    -   Includes basic global styles (scrollbar, print styles, divider styles).
    -   Sets up an `importmap` for resolving module specifiers (React).
    -   Contains the root `<div>` element where the React app is mounted.
    -   Imports and runs `index.tsx`.

-   **`index.tsx`**:
    -   The main JavaScript/TypeScript entry point for the React application.
    -   Imports React, ReactDOM, and the main `App` component.
    -   Renders the `App` component into the `#root` element defined in `index.html`.

-   **`metadata.json`**:
    -   Contains metadata for the development environment, such as the application name, description, and requested frame permissions (e.g., camera, microphone - currently none).

-   **`types.ts`**:
    -   Defines all major TypeScript interfaces and enums used throughout the application. This includes:
        -   `StrainType`: Enum for Sativa, Hybrid, Indica, etc.
        -   `Strain`: Interface for individual strain data (name, grower, THC, type, last jar).
        -   `PriceTiers`: Interface for pricing (g, eighth, quarter, etc.).
        -   `SortCriteria`: Interface for defining sorting parameters (key, direction).
        -   `Shelf`: Interface for a shelf/category of strains (name, pricing, color, strains array, sort criteria).
        -   `ArtboardSize`: Enum for different output dimensions (Letter Portrait, 16:9 Screen, etc.).
        -   `HeaderImageSize`: Enum for selecting different header image sizes (Large, Small, None).
        -   `ArtboardDimensions`: Interface for the pixel dimensions and aspect ratio of an artboard.
        -   `PreviewSettings`: Interface for user-configurable preview options (artboard size, font size, columns, zoom, header image).
        -   `SupportedStates`: Enum for different regional configurations (e.g., Oklahoma).

-   **`constants.ts`**:
    -   Stores constant values, default configurations, and static data mappings.
    -   `OKLAHOMA_PRICING_HIERARCHY`: Default shelf names, pricing, and colors for Oklahoma.
    -   `getDefaultShelves()`: Function to generate initial shelf data based on the selected state.
    -   `ARTBOARD_DIMENSIONS_MAP`: Maps `ArtboardSize` enums to their `ArtboardDimensions` (pixel sizes, aspect ratios).
    -   `INITIAL_PREVIEW_SETTINGS`: Default values for `PreviewSettings`.
    -   `HEADER_IMAGE_CONFIGS`: Maps artboard sizes and header image sizes to specific image asset paths and dimensions.
    -   `STRAIN_TYPES_ORDERED`: Defines the display order for strain types.
    -   `STRAIN_TYPE_VISUALS`: Maps `StrainType` to its visual representation (acronym, color, gradient).
    -   `MANGO_MAIN_ORANGE`, `MANGO_SUPPORT_ORANGE`, etc.: Brand color constants.
    -   `THC_DECIMAL_PLACES`: Constant for formatting THC values.
    -   Panel width constants (`MIN_SHELVES_PANEL_WIDTH`, `DEFAULT_SHELVES_PANEL_WIDTH`, etc.).
    -   `CSV_STRAIN_TYPE_MAP`: Maps various CSV input strings for strain types to the canonical `StrainType` enum.
    -   `APP_STRAIN_TYPE_TO_CSV_SUFFIX`: Maps `StrainType` enum to a short suffix for CSV export.

-   **`App.tsx`**:
    -   The root React component that orchestrates the entire application.
    -   **State Management**: Manages global application state including:
        -   `currentAppState`: The selected region (e.g., Oklahoma).
        -   `shelves`: An array of `Shelf` objects, representing the main data structure.
        -   `previewSettings`: User-configurable settings for the menu preview.
        -   `shelvesPanelWidth`: Width of the left panel containing strain inputs.
        -   `exportFilename`: User-defined filename for exports.
        -   `isExporting`, `exportAction`, `showExportOverlay`: State related to the image export process.
        -   `globalSortCriteria`: Sorting criteria applied to all shelves if no shelf-specific sort is active.
    -   **Event Handlers**: Contains callback functions for:
        -   Adding, updating, removing, and copying strains within shelves.
        -   Clearing all strains from a shelf or all shelves.
        -   Clearing "Last Jar" flags.
        -   Refreshing the menu preview.
        -   Updating preview settings.
        -   Updating global and per-shelf sort criteria.
        -   Resizing the panels.
        -   Triggering image exports (PNG/JPEG) and CSV export/import.
    -   **Helper Functions**:
        -   `sortStrains()`: Sorts an array of strains based on given criteria.
        -   `recordChange()`: A utility to mark that changes have occurred and reset sort criteria.
    -   **Layout**: Renders the main layout including `Header`, `Toolbar`, `FlowerShelvesPanel`, and `MenuPreviewPanel`.
    -   **CSV Processing**: Includes logic for parsing imported CSV files and generating CSV content for export.
    -   **Memoization**: Uses `useMemo` to optimize the processing of shelves for display (e.g., applying sort criteria).

---

### `components/` Directory

#### Main UI Sections

-   **`Header.tsx`**:
    -   Renders the application's main header.
    -   Displays the application name (`appName`).
    -   Includes a `Select` component for changing the `currentOklahomaState` (region).

-   **`Toolbar.tsx`**:
    -   Renders the toolbar below the header.
    -   Provides buttons for:
        -   "Refresh Preview".
        -   "Clear All Shelves" (with confirmation).
        -   "Clear All Last Jars" (with confirmation).
    -   Includes a section for file operations:
        -   "Import CSV".
        -   Input field for `exportFilename`.
        -   Buttons for "Export PNG", "Export JPEG", "Export CSV".
    -   Includes controls for `globalSortCriteria` (Sort by Name, Grower, Class, THC%, Last Jar).
    -   Uses a `SortButton` sub-component for sort option buttons.

-   **`FlowerShelvesPanel.tsx`**:
    -   The left panel of the main application area, responsible for displaying and managing flower shelves.
    -   Receives the (potentially sorted) `shelves` data.
    -   Iterates over `shelves` and renders a `ShelfComponent` for each.
    -   Passes down callbacks for strain manipulation and shelf-specific sorting to `ShelfComponent`.
    -   Its width is dynamically adjustable.

-   **`ShelfComponent.tsx`**:
    -   Renders a single shelf/category of strains.
    -   Displays the shelf name and pricing information.
    -   Includes a "Clear" button for removing all strains from this specific shelf (with confirmation).
    -   Provides per-shelf sorting controls using `SortButtonShelf` sub-component.
    -   Iterates over the strains in the shelf and renders a `StrainInputRow` for each.
    -   Includes "Add Strain" and "Delete Last Strain" buttons for the shelf.

-   **`StrainInputRow.tsx`**:
    -   Renders the input fields for a single strain:
        -   Name (text input).
        -   Grower/Brand (text input).
        -   THC % (number input with '%' suffix).
        -   Strain Type (a series of toggle buttons for Sativa, Sativa-Hybrid, etc.).
        -   "Last Jar?" (toggle switch).
    -   Provides action buttons:
        -   "Copy Above", "Copy Below".
        -   "Delete Strain".
    -   Highlights newly added strains and focuses the name input.

#### Menu Preview

-   **`MenuPreviewPanel.tsx`**:
    -   The right panel of the main application area, responsible for displaying the menu preview.
    -   Manages the state for panning (`panOffset`) and zooming (`settings.zoomLevel`) of the artboard.
    -   Handles mouse events (drag to pan, wheel to zoom) on the artboard container.
    -   Renders `PreviewControls` and `PreviewArtboard`.
    -   **Export Logic**: Contains the `useEffect` hook that triggers `dom-to-image` when `exportAction` prop is set.
        -   Temporarily re-parents and resizes the `PreviewArtboard` node to capture it at its natural dimensions.
        -   Waits for fonts and images within the artboard to load before capture.
        -   Calls `dom-to-image` to generate the image data.
        -   Converts the data URL to a Blob and initiates a download.
        -   Restores the artboard's original state and position after capture.

-   **`PreviewControls.tsx`**:
    -   Renders the control bar above the menu preview artboard.
    -   Provides controls for:
        -   `ArtboardSize` (e.g., Letter Portrait, 16:9 Screen) via a `Select` component.
        -   `HeaderImageSize` (Large, Small, None) via a `Select` component.
        -   Number of `columns` via a `Select` component.
        -   `baseFontSizePx` (base font size for the preview) via a direct input and a range slider.
        -   `forceShelfFit` (to control if shelves can break across columns) via a `ToggleSwitch`.
    -   Provides view controls:
        -   Zoom In/Out buttons.
        -   Direct zoom percentage input.
        -   "Fit to Window" button.
        -   "Reset Zoom" button.

-   **`PreviewArtboard.tsx`**:
    -   Renders the actual visual representation of the menu that will be exported.
    -   Its dimensions are set based on `artboardSpecs.naturalWidth` and `artboardSpecs.naturalHeight`.
    -   Styled with a white background and shadow to simulate paper/screen.
    -   Displays an optional header image based on `headerImageDetails`.
    -   Calculates `contentPadding`, `columnGap`, and `rowGap` based on `baseFontSizePx`.
    -   Arranges `MenuTable` components within a multi-column layout defined by `contentAreaStyle`.
    -   If no strains are present, displays a placeholder message.
    -   `forwardRef` is used to pass a ref to the main `div` for `dom-to-image` capture.

-   **`MenuTable.tsx`**:
    -   Renders a single shelf as a table for the preview.
    -   Receives `shelf`, `strainsToRender`, `baseFontSizePx`, and styling props.
    -   Styles are dynamically calculated based on `baseFontSizePx` for scalability.
    -   Displays the shelf header (name and pricing) with the shelf's specific background color.
    -   Renders an HTML `<table>` with columns for Strain, Grower/Brand, Type, and THC %.
    -   Uses `StrainTypeIndicator` to display the strain type.
    -   Highlights "Last Jar" strains with an orange dot and bolder text.
    -   Applies `break-inside: avoid-column` to the root `div` if `applyAvoidBreakStyle` is true, to try and prevent the shelf from splitting across columns in the preview.

---

#### Common Reusable Components (`components/common/`)

-   **`Button.tsx`**:
    -   A generic, styled button component.
    -   Supports `variant` (primary, secondary, danger, warning, custom) and `size` (sm, md, lg) props.
    -   Uses Mango brand colors for the primary variant.

-   **`IconButton.tsx`**:
    -   A generic button component specifically for icons.
    -   Provides base styling for icon buttons (padding, hover effects).

-   **`Select.tsx`**:
    -   A generic, styled HTML `<select>` (dropdown) component.
    -   Takes an `options` array (value/label pairs).

-   **`ToggleSwitch.tsx`**:
    -   A generic, styled toggle switch component.
    -   Visually indicates on/off state, often used for boolean settings.

-   **`Icon.tsx`**:
    -   A collection of SVG icon components used throughout the UI (e.g., `PlusIcon`, `TrashIcon`, `RefreshIcon`, `ZoomInIcon`, etc.).
    -   Each icon is a separate React functional component.

-   **`StrainTypeIndicator.tsx`**:
    -   (Note: Also listed as `components/StrainTypeIndicator.tsx` in user's prompt, but this is the common one.)
    -   Renders a small, colored visual indicator for a given `StrainType`.
    -   Displays an acronym (S, SH, H, IH, I).
    -   Uses colors and gradients defined in `STRAIN_TYPE_VISUALS` from `constants.ts`.
    -   Its size and padding scale dynamically based on the `baseFontSizePx` prop passed from `MenuTable`.

## Key Functionalities and Logic Flows

1.  **Data Management**:
    -   Strains are organized within `Shelf` objects.
    -   All data modifications (add, update, delete strains) go through `App.tsx` state and update callbacks, triggering re-renders.
    -   `recordChange` utility ensures that any data change marks the preview as needing a refresh and resets sort criteria to prevent stale views.

2.  **Sorting**:
    -   **Global Sort**: Applies to all shelves unless a shelf has its own specific sort. Controlled from `Toolbar`.
    -   **Shelf Sort**: Applies only to a specific shelf. Controlled from `ShelfComponent`.
    -   Setting a shelf sort clears the global sort, and vice-versa.
    -   `sortStrains` function in `App.tsx` handles the actual sorting logic based on various keys (name, grower, type, THC, last jar) and directions (asc/desc).
    -   Sorted strains are passed down to display components.

3.  **Preview Rendering**:
    -   `MenuPreviewPanel` handles the view (pan/zoom) of `PreviewArtboard`.
    -   `PreviewArtboard` constructs the menu layout:
        -   Optional header image.
        -   Content area with columns.
        -   Each shelf with strains is rendered by a `MenuTable`.
    -   `MenuTable` dynamically scales font sizes, padding, etc., based on `baseFontSizePx`.
    -   `forceShelfFit` setting determines if `MenuTable` instances (shelves) try to avoid breaking across columns (`break-inside: avoid-column`).

4.  **Image Export (`dom-to-image`)**:
    -   Triggered by `exportAction` prop in `MenuPreviewPanel`.
    -   The `PreviewArtboard` DOM node is temporarily moved and restyled to its natural export dimensions (e.g., 2550x3300 for Letter Portrait).
    -   Crucially, the export process *waits* for `document.fonts.ready` and for all `<img>` tags within the artboard to load before `dom-to-image` is called. This is key to improving export quality and avoiding rendering issues.
    -   `dom-to-image` captures the prepared DOM node.
    -   The resulting data URL is converted to a Blob (PNG or JPEG) and downloaded.

5.  **CSV Import/Export**:
    -   **Export**: Gathers strain data from all shelves (respecting current sort order), formats it into CSV rows, and initiates a download.
    -   **Import**: Parses a selected CSV file.
        -   Maps CSV column data (Category, Strain Name, Grower, THC, Class, lastjar) to `Strain` objects.
        -   Attempts to match the CSV "Category" to existing shelf names.
        -   Replaces strains on matched shelves with imported data.
        -   Provides feedback on successful imports and skipped rows.

6.  **Panel Resizing**:
    -   The divider between `FlowerShelvesPanel` and `MenuPreviewPanel` is draggable.
    -   `App.tsx` handles `mousedown`, `mousemove`, and `mouseup` events on the divider to update `shelvesPanelWidth`.

## UI/UX Considerations

-   **Responsiveness**: The app is designed for desktop use. Panels are resizable.
-   **Accessibility**: ARIA attributes are used on some interactive elements (e.g., panel divider, export overlay). Focus management is implemented for newly added strains and some controls.
-   **User Feedback**:
    -   Confirmation steps for destructive actions (Clear Shelves, Clear Last Jars).
    -   Loading indicator (spinner overlay) during image export.
    -   Alerts for CSV import/export status.
-   **Aesthetics**: Uses Mango Cannabis brand colors. Clean, modern font (`Inter`). Custom scrollbars.

This README should serve as a good starting point for understanding the application's architecture.
