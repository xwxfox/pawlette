import Color from 'color';

/**
 * Calculate relative luminance of a color according to WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(color: ReturnType<typeof Color>): number {
    const rgb = color.rgb().array();
    const [r, g, b] = rgb.map((val) => {
        const normalized = val / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function calculateContrastRatio(color1: string, color2: string): number {
    try {
        const c1 = Color(color1);
        const c2 = Color(color2);

        const l1 = getRelativeLuminance(c1);
        const l2 = getRelativeLuminance(c2);

        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);

        return (lighter + 0.05) / (darker + 0.05);
    } catch (error) {
        console.error('Error calculating contrast ratio:', error);
        return 1;
    }
}

/**
 * WCAG compliance levels
 */
export type WCAGLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';

export interface WCAGCompliance {
    normalText: WCAGLevel;
    largeText: WCAGLevel;
    uiComponents: WCAGLevel;
}

/**
 * Check WCAG 2.1 compliance for a contrast ratio
 */
export function getWCAGCompliance(ratio: number): WCAGCompliance {
    return {
        normalText: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail',
        largeText: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA Large' : 'Fail',
        uiComponents: ratio >= 3 ? 'AA' : 'Fail',
    };
}

/**
 * Color pair with accessibility information
 */
export interface AccessibleColorPair {
    foreground: string;
    background: string;
    contrastRatio: number;
    compliance: WCAGCompliance;
    passes: boolean;
}

/**
 * Check if a color pair is accessible
 */
export function checkAccessibility(
    foreground: string,
    background: string
): AccessibleColorPair {
    const ratio = calculateContrastRatio(foreground, background);
    const compliance = getWCAGCompliance(ratio);
    const passes = compliance.normalText !== 'Fail';

    return {
        foreground,
        background,
        contrastRatio: ratio,
        compliance,
        passes,
    };
}

/**
 * Suggest accessible alternatives for a color pair
 */
export function suggestAccessibleColors(
    foreground: string,
    background: string,
    targetRatio: number = 4.5
): { foreground: string; background: string }[] {
    const suggestions: { foreground: string; background: string }[] = [];

    try {
        const fg = Color(foreground);
        const bg = Color(background);

        // Try darkening/lightening the foreground
        for (let i = 0; i <= 100; i += 10) {
            const darkerFg = fg.darken(i / 100).hex();
            if (calculateContrastRatio(darkerFg, background) >= targetRatio) {
                suggestions.push({ foreground: darkerFg, background });
                break;
            }
        }

        for (let i = 0; i <= 100; i += 10) {
            const lighterFg = fg.lighten(i / 100).hex();
            if (calculateContrastRatio(lighterFg, background) >= targetRatio) {
                suggestions.push({ foreground: lighterFg, background });
                break;
            }
        }

        // Try darkening/lightening the background
        for (let i = 0; i <= 100; i += 10) {
            const darkerBg = bg.darken(i / 100).hex();
            if (calculateContrastRatio(foreground, darkerBg) >= targetRatio) {
                suggestions.push({ foreground, background: darkerBg });
                break;
            }
        }

        for (let i = 0; i <= 100; i += 10) {
            const lighterBg = bg.lighten(i / 100).hex();
            if (calculateContrastRatio(foreground, lighterBg) >= targetRatio) {
                suggestions.push({ foreground, background: lighterBg });
                break;
            }
        }

        // Remove duplicates
        return Array.from(
            new Map(
                suggestions.map(s => [s.foreground + s.background, s])
            ).values()
        ).slice(0, 4);
    } catch (error) {
        console.error('Error suggesting colors:', error);
        return [];
    }
}

/**
 * Get color label for WCAG level
 */
export function getWCAGLevelColor(level: WCAGLevel): string {
    switch (level) {
        case 'AAA':
            return 'hsl(142, 76%, 36%)'; // Green
        case 'AA':
            return 'hsl(142, 52%, 46%)'; // Light green
        case 'AA Large':
            return 'hsl(45, 93%, 47%)'; // Yellow
        case 'Fail':
            return 'hsl(0, 72%, 51%)'; // Red
    }
}

/**
 * Get description for WCAG level
 */
export function getWCAGLevelDescription(level: WCAGLevel): string {
    switch (level) {
        case 'AAA':
            return 'Enhanced contrast - highest level of accessibility';
        case 'AA':
            return 'Minimum contrast - meets standard accessibility';
        case 'AA Large':
            return 'Meets requirements for large text only (18pt+ or 14pt+ bold)';
        case 'Fail':
            return 'Does not meet accessibility standards';
    }
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
    return ratio.toFixed(2) + ':1';
}
