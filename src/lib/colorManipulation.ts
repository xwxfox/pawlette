import tinycolor from 'tinycolor2';
import type { ExtractedColor } from './types';

/**
 * Mix two colors together with optional ratio
 * @param color1 First color (hex)
 * @param color2 Second color (hex)
 * @param ratio Mix ratio (0-1, where 0 is color1 and 1 is color2)
 */
export function mixColors(color1: string, color2: string, ratio: number = 0.5): string {
    const c1 = tinycolor(color1);
    const c2 = tinycolor(color2);

    return tinycolor.mix(c1, c2, ratio * 100).toHexString();
}

/**
 * Generate a color scale between two colors
 * @param color1 Start color
 * @param color2 End color
 * @param steps Number of colors in the scale
 */
export function generateColorScale(color1: string, color2: string, steps: number = 7): string[] {
    const scale: string[] = [];

    for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        scale.push(mixColors(color1, color2, ratio));
    }

    return scale;
}

/**
 * Generate tints (lighter variations) of a color
 * @param color Base color
 * @param count Number of tints to generate
 */
export function generateTints(color: string, count: number = 5): string[] {
    const baseColor = tinycolor(color);
    const tints: string[] = [];

    for (let i = 1; i <= count; i++) {
        const amount = (i / (count + 1)) * 100;
        tints.push(tinycolor.mix(baseColor, '#ffffff', amount).toHexString());
    }

    return tints;
}

/**
 * Generate shades (darker variations) of a color
 * @param color Base color
 * @param count Number of shades to generate
 */
export function generateShades(color: string, count: number = 5): string[] {
    const baseColor = tinycolor(color);
    const shades: string[] = [];

    for (let i = 1; i <= count; i++) {
        const amount = (i / (count + 1)) * 100;
        shades.push(tinycolor.mix(baseColor, '#000000', amount).toHexString());
    }

    return shades;
}

/**
 * Generate complete tint and shade scale
 * @param color Base color
 * @param tintCount Number of tints
 * @param shadeCount Number of shades
 */
export function generateTintShadeScale(
    color: string,
    tintCount: number = 5,
    shadeCount: number = 5
): { tints: string[]; base: string; shades: string[] } {
    return {
        tints: generateTints(color, tintCount).reverse(),
        base: color,
        shades: generateShades(color, shadeCount),
    };
}

/**
 * Adjust color temperature (warmer = more red, cooler = more blue)
 * @param color Base color
 * @param amount Temperature adjustment (-100 to 100)
 */
export function adjustTemperature(color: string, amount: number): string {
    const c = tinycolor(color);
    const hsl = c.toHsl();

    // Shift hue towards red (warm) or blue (cool)
    if (amount > 0) {
        // Warmer: shift towards red (0-30 degrees)
        hsl.h = (hsl.h + (amount / 100) * 30) % 360;
    } else {
        // Cooler: shift towards blue (180-240 degrees)
        hsl.h = (hsl.h + (amount / 100) * 30 + 360) % 360;
    }

    return tinycolor(hsl).toHexString();
}

/**
 * Adjust color saturation
 * @param color Base color
 * @param amount Saturation adjustment (-100 to 100)
 */
export function adjustSaturation(color: string, amount: number): string {
    const c = tinycolor(color);

    if (amount > 0) {
        return c.saturate(amount).toHexString();
    } else {
        return c.desaturate(Math.abs(amount)).toHexString();
    }
}

/**
 * Adjust color brightness/lightness
 * @param color Base color
 * @param amount Brightness adjustment (-100 to 100)
 */
export function adjustBrightness(color: string, amount: number): string {
    const c = tinycolor(color);

    if (amount > 0) {
        return c.lighten(amount).toHexString();
    } else {
        return c.darken(Math.abs(amount)).toHexString();
    }
}

/**
 * Get complementary color (opposite on color wheel)
 */
export function getComplementary(color: string): string {
    return tinycolor(color).complement().toHexString();
}

/**
 * Get triadic colors (evenly spaced on color wheel)
 */
export function getTriadic(color: string): [string, string, string] {
    const colors = tinycolor(color).triad();
    return [
        colors[0].toHexString(),
        colors[1].toHexString(),
        colors[2].toHexString(),
    ];
}

/**
 * Get tetradic colors (rectangular scheme on color wheel)
 */
export function getTetradic(color: string): [string, string, string, string] {
    const colors = tinycolor(color).tetrad();
    return [
        colors[0].toHexString(),
        colors[1].toHexString(),
        colors[2].toHexString(),
        colors[3].toHexString(),
    ];
}

/**
 * Get analogous colors (adjacent on color wheel)
 */
export function getAnalogous(color: string): [string, string, string] {
    const colors = tinycolor(color).analogous();
    return [
        colors[0].toHexString(),
        colors[1].toHexString(),
        colors[2].toHexString(),
    ];
}

/**
 * Get split complementary colors
 */
export function getSplitComplementary(color: string): [string, string, string] {
    const colors = tinycolor(color).splitcomplement();
    return [
        colors[0].toHexString(),
        colors[1].toHexString(),
        colors[2].toHexString(),
    ];
}

/**
 * Get monochromatic colors (variations in lightness)
 */
export function getMonochromatic(color: string, count: number = 5): string[] {
    const colors = tinycolor(color).monochromatic(count);
    return colors.map(c => c.toHexString());
}

/**
 * Get all color harmonies for a given color
 */
export function getColorHarmonies(color: string): {
    complementary: string;
    triadic: [string, string, string];
    tetradic: [string, string, string, string];
    analogous: [string, string, string];
    splitComplementary: [string, string, string];
    monochromatic: string[];
} {
    return {
        complementary: getComplementary(color),
        triadic: getTriadic(color),
        tetradic: getTetradic(color),
        analogous: getAnalogous(color),
        splitComplementary: getSplitComplementary(color),
        monochromatic: getMonochromatic(color, 6),
    };
}

/**
 * Invert a color
 */
export function invertColor(color: string): string {
    const c = tinycolor(color);
    const rgb = c.toRgb();

    return tinycolor({
        r: 255 - rgb.r,
        g: 255 - rgb.g,
        b: 255 - rgb.b,
    }).toHexString();
}

/**
 * Get grayscale version of a color
 */
export function toGrayscale(color: string): string {
    return tinycolor(color).greyscale().toHexString();
}

/**
 * Check if a color is light or dark
 */
export function isLight(color: string): boolean {
    return tinycolor(color).isLight();
}

/**
 * Check if a color is dark
 */
export function isDark(color: string): boolean {
    return tinycolor(color).isDark();
}

/**
 * Get luminance of a color (0-1)
 */
export function getLuminance(color: string): number {
    return tinycolor(color).getLuminance();
}

/**
 * Blend multiple colors together
 * @param colors Array of colors to blend
 */
export function blendColors(colors: string[]): string {
    if (colors.length === 0) return '#000000';
    if (colors.length === 1) return colors[0];

    let result = tinycolor(colors[0]);

    for (let i = 1; i < colors.length; i++) {
        result = tinycolor.mix(result, colors[i], 50);
    }

    return result.toHexString();
}

/**
 * Create a custom color scale with specific midpoint
 * @param startColor Start color
 * @param midColor Middle color
 * @param endColor End color
 * @param steps Number of colors in scale
 */
export function generateCustomScale(
    startColor: string,
    midColor: string,
    endColor: string,
    steps: number = 9
): string[] {
    const halfSteps = Math.floor(steps / 2);
    const firstHalf = generateColorScale(startColor, midColor, halfSteps + 1);
    const secondHalf = generateColorScale(midColor, endColor, halfSteps + 1).slice(1);

    return [...firstHalf, ...secondHalf];
}
