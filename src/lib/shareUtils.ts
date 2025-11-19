import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { ExtractedColor } from './types';
import type { ThemeConfig } from './themeConfig';
import type { CustomGradientConfig } from '@/components/GradientEditorModal';

/**
 * Shareable palette data structure
 */
export interface ShareablePalette {
    name: string;
    colors: ExtractedColor[];
    themeConfig?: ThemeConfig;
    customGradients?: CustomGradientConfig[];
    createdAt: number;
    author?: string;
}

/**
 * Encode palette data to URL-safe string using LZ-String URI encoding
 */
export function encodePalette(palette: ShareablePalette): string {
    try {
        const jsonString = JSON.stringify(palette);
        // Use compressToEncodedURIComponent which produces URL-safe strings
        const compressed = compressToEncodedURIComponent(jsonString);
        return compressed;
    } catch (error) {
        console.error('Failed to encode palette:', error);
        throw new Error('Failed to encode palette');
    }
}

/**
 * Decode palette data from URL-safe string
 */
export function decodePalette(encoded: string): ShareablePalette | null {
    try {
        // Use matching decompression function
        const decompressed = decompressFromEncodedURIComponent(encoded);
        if (!decompressed) return null;
        return JSON.parse(decompressed);
    } catch (error) {
        console.error('Failed to decode palette:', error);
        return null;
    }
}

/**
 * Generate shareable URL for a palette
 */
export function generateShareUrl(palette: ShareablePalette): string {
    const encoded = encodePalette(palette);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?palette=${encoded}`;
}

/**
 * Get palette from URL query parameter
 */
export function getPaletteFromUrl(): ShareablePalette | null {
    const params = new URLSearchParams(window.location.search);
    const paletteParam = params.get('palette');
    if (!paletteParam) return null;
    return decodePalette(paletteParam);
}

/**
 * Generate QR code data URL for a shareable URL
 */
export async function generateQRCode(url: string): Promise<string> {
    try {
        const QRCode = await import('qrcode');
        return await QRCode.toDataURL(url, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw error;
    }
}

/**
 * Export palette as JSON file
 */
export function exportPaletteAsJson(palette: ShareablePalette): void {
    const { saveAs } = require('file-saver');
    const jsonString = JSON.stringify(palette, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `${palette.name.toLowerCase().replace(/\s+/g, '-')}-palette.json`;
    saveAs(blob, fileName);
}

/**
 * Import palette from JSON file
 */
export async function importPaletteFromJson(file: File): Promise<ShareablePalette | null> {
    try {
        const text = await file.text();
        const palette = JSON.parse(text) as ShareablePalette;

        // Validate required fields
        if (!palette.name || !palette.colors || !Array.isArray(palette.colors)) {
            throw new Error('Invalid palette format');
        }

        return palette;
    } catch (error) {
        console.error('Failed to import palette:', error);
        return null;
    }
}

/**
 * Export multiple palettes as a ZIP file
 */
export async function exportPalettesAsZip(palettes: ShareablePalette[]): Promise<void> {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();

    palettes.forEach((palette, index) => {
        const jsonString = JSON.stringify(palette, null, 2);
        const fileName = `${palette.name.toLowerCase().replace(/\s+/g, '-')}-palette.json`;
        zip.file(fileName, jsonString);
    });

    // Add README
    const readme = `# Palette Collection
  
This archive contains ${palettes.length} color palette(s) exported from Pawlette.

## How to use

1. Import these JSON files back into Pawlette using the "Import" button
2. Or use the palette data in your own projects

## Palette Files

${palettes.map((p, i) => `${i + 1}. ${p.name} (${p.colors.length} colors)`).join('\n')}

Generated on: ${new Date().toLocaleString()}
`;

    zip.file('README.md', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `Pawlette-palettes-${Date.now()}.zip`);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Generate palette preview image as data URL
 */
export function generatePalettePreview(colors: ExtractedColor[], width = 600, height = 200): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    const swatchWidth = width / colors.length;

    colors.forEach((color, index) => {
        ctx.fillStyle = color.hex;
        ctx.fillRect(index * swatchWidth, 0, swatchWidth, height);
    });

    return canvas.toDataURL('image/png');
}

/**
 * Download palette preview as PNG
 */
export async function downloadPalettePreview(
    palette: ShareablePalette,
    width = 1200,
    height = 400
): Promise<void> {
    const { saveAs } = await import('file-saver');

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const swatchWidth = width / palette.colors.length;

    // Draw color swatches
    palette.colors.forEach((color, index) => {
        ctx.fillStyle = color.hex;
        ctx.fillRect(index * swatchWidth, 0, swatchWidth, height * 0.7);
    });

    // Draw palette name
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(palette.name, width / 2, height * 0.85);

    // Draw color codes
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    palette.colors.forEach((color, index) => {
        const x = (index + 0.5) * swatchWidth;

        // Text with background for readability
        const textWidth = ctx.measureText(color.hex).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - textWidth / 2 - 8, height * 0.6 - 16, textWidth + 16, 32);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(color.hex, x, height * 0.6);
    });

    canvas.toBlob((blob) => {
        if (blob) {
            const fileName = `${palette.name.toLowerCase().replace(/\s+/g, '-')}-preview.png`;
            saveAs(blob, fileName);
        }
    });
}
