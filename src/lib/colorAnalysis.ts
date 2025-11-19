import tinycolor from 'tinycolor2';
import type { ExtractedColor } from './types';
import { popularPalettes, type PopularPalette } from '../data/popularPalettes';

/**
 * Calculate similarity between two colors (0-100)
 */
function calculateColorSimilarity(hex1: string, hex2: string): number {
    const color1 = tinycolor(hex1).toHsl();
    const color2 = tinycolor(hex2).toHsl();

    // Calculate differences
    const hueDiff = Math.min(Math.abs(color1.h - color2.h), 360 - Math.abs(color1.h - color2.h));
    const satDiff = Math.abs(color1.s - color2.s);
    const lightDiff = Math.abs(color1.l - color2.l);

    // Weight the differences (hue is most important)
    const hueScore = (1 - hueDiff / 180) * 0.5;
    const satScore = (1 - satDiff) * 0.25;
    const lightScore = (1 - lightDiff) * 0.25;

    return (hueScore + satScore + lightScore) * 100;
}

/**
 * Find similar palettes from popular palettes database
 */
export function getSimilarPalettes(
    colors: ExtractedColor[],
    limit = 5
): Array<PopularPalette & { similarity: number }> {
    const userColorHexes = colors.map(c => c.hex);

    // Calculate similarity score for each popular palette
    const palettesWithScores = popularPalettes.map(palette => {
        let totalSimilarity = 0;
        let comparisons = 0;

        // Compare each color in user's palette with each color in popular palette
        userColorHexes.forEach(userColor => {
            palette.colors.forEach(paletteColor => {
                totalSimilarity += calculateColorSimilarity(userColor, paletteColor);
                comparisons++;
            });
        });

        const avgSimilarity = totalSimilarity / comparisons;

        return {
            ...palette,
            similarity: Math.round(avgSimilarity),
        };
    });

    // Sort by similarity and return top matches
    return palettesWithScores
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
}

/**
 * Calculate harmony score for a palette (0-100)
 * Based on color relationships and distribution
 */
export function calculateHarmonyScore(colors: ExtractedColor[]): number {
    if (colors.length < 2) return 0;

    let score = 0;
    const totalChecks = 4;

    // 1. Check for complementary relationships (25 points)
    let hasComplementary = false;
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const hue1 = tinycolor(colors[i].hex).toHsl().h;
            const hue2 = tinycolor(colors[j].hex).toHsl().h;
            const hueDiff = Math.abs(hue1 - hue2);

            // Check if colors are complementary (opposite, ~180 degrees)
            if ((hueDiff > 150 && hueDiff < 210) || (hueDiff > 330 || hueDiff < 30)) {
                hasComplementary = true;
                break;
            }
        }
        if (hasComplementary) break;
    }
    if (hasComplementary) score += 25;

    // 2. Check for analogous relationships (25 points)
    let hasAnalogous = false;
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const hue1 = tinycolor(colors[i].hex).toHsl().h;
            const hue2 = tinycolor(colors[j].hex).toHsl().h;
            const hueDiff = Math.abs(hue1 - hue2);

            // Check if colors are analogous (adjacent, <60 degrees)
            if (hueDiff > 10 && hueDiff < 60) {
                hasAnalogous = true;
                break;
            }
        }
        if (hasAnalogous) break;
    }
    if (hasAnalogous) score += 25;

    // 3. Check for good lightness distribution (25 points)
    const lightnesses = colors.map(c => tinycolor(c.hex).toHsl().l);
    const minL = Math.min(...lightnesses);
    const maxL = Math.max(...lightnesses);
    const lightnessRange = maxL - minL;

    if (lightnessRange > 0.3 && lightnessRange < 0.8) {
        score += 25;
    } else if (lightnessRange >= 0.2) {
        score += 15;
    }

    // 4. Check for balanced saturation (25 points)
    const saturations = colors.map(c => tinycolor(c.hex).toHsl().s);
    const avgSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;

    if (avgSaturation > 0.3 && avgSaturation < 0.8) {
        score += 25;
    } else if (avgSaturation >= 0.2) {
        score += 15;
    }

    return Math.round(score);
}

/**
 * Emotional associations for colors
 */
export interface ColorEmotion {
    primary: string[];
    secondary: string[];
}

export function getColorEmotions(color: string): ColorEmotion {
    const hsl = tinycolor(color).toHsl();
    const hue = hsl.h;
    const saturation = hsl.s;
    const lightness = hsl.l;

    let primary: string[] = [];
    let secondary: string[] = [];

    // Determine emotions based on hue
    if (hue >= 0 && hue < 15 || hue >= 345) {
        // Red
        primary = ['Passionate', 'Energetic', 'Bold'];
        secondary = ['Exciting', 'Intense', 'Powerful'];
    } else if (hue >= 15 && hue < 45) {
        // Orange
        primary = ['Enthusiastic', 'Warm', 'Creative'];
        secondary = ['Friendly', 'Confident', 'Adventurous'];
    } else if (hue >= 45 && hue < 75) {
        // Yellow
        primary = ['Happy', 'Optimistic', 'Cheerful'];
        secondary = ['Playful', 'Energetic', 'Innovative'];
    } else if (hue >= 75 && hue < 165) {
        // Green
        primary = ['Natural', 'Fresh', 'Calm'];
        secondary = ['Balanced', 'Growth', 'Harmonious'];
    } else if (hue >= 165 && hue < 195) {
        // Cyan
        primary = ['Refreshing', 'Clean', 'Tranquil'];
        secondary = ['Clear', 'Open', 'Professional'];
    } else if (hue >= 195 && hue < 255) {
        // Blue
        primary = ['Trustworthy', 'Calm', 'Professional'];
        secondary = ['Stable', 'Serene', 'Reliable'];
    } else if (hue >= 255 && hue < 285) {
        // Purple
        primary = ['Creative', 'Luxurious', 'Wise'];
        secondary = ['Imaginative', 'Spiritual', 'Mysterious'];
    } else {
        // Magenta/Pink
        primary = ['Romantic', 'Playful', 'Compassionate'];
        secondary = ['Youthful', 'Loving', 'Gentle'];
    }

    // Adjust based on saturation and lightness
    if (saturation < 0.2) {
        secondary = ['Neutral', 'Subtle', 'Sophisticated'];
    }
    if (lightness > 0.8) {
        secondary = [...secondary, 'Soft', 'Delicate', 'Airy'];
    } else if (lightness < 0.2) {
        secondary = [...secondary, 'Bold', 'Dramatic', 'Intense'];
    }

    return { primary, secondary };
}

/**
 * Get palette-level emotions
 */
export function getPaletteEmotions(colors: ExtractedColor[]): {
    overall: string[];
    detailed: Map<string, ColorEmotion>;
} {
    const detailed = new Map<string, ColorEmotion>();
    const allEmotions: string[] = [];

    colors.forEach(color => {
        const emotions = getColorEmotions(color.hex);
        detailed.set(color.hex, emotions);
        allEmotions.push(...emotions.primary, ...emotions.secondary);
    });

    // Count emotion frequency
    const emotionCounts = new Map<string, number>();
    allEmotions.forEach(emotion => {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    });

    // Get top 5 most common emotions
    const overall = Array.from(emotionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([emotion]) => emotion);

    return { overall, detailed };
}

/**
 * Industry/use case suggestions
 */
export interface IndustrySuggestion {
    industry: string;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
}

export function suggestIndustries(colors: ExtractedColor[]): IndustrySuggestion[] {
    const suggestions: IndustrySuggestion[] = [];

    const hues = colors.map(c => tinycolor(c.hex).toHsl().h);
    const saturations = colors.map(c => tinycolor(c.hex).toHsl().s);
    const lightnesses = colors.map(c => tinycolor(c.hex).toHsl().l);

    const avgSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;
    const avgLightness = lightnesses.reduce((a, b) => a + b, 0) / lightnesses.length;

    // Check for blue dominance (technology, finance)
    const blueCount = hues.filter(h => h >= 195 && h < 255).length;
    if (blueCount >= colors.length * 0.4) {
        suggestions.push({
            industry: 'Technology / Finance',
            confidence: 'high',
            reason: 'Blue tones suggest trustworthiness and professionalism',
        });
    }

    // Check for green (health, environment)
    const greenCount = hues.filter(h => h >= 75 && h < 165).length;
    if (greenCount >= colors.length * 0.4) {
        suggestions.push({
            industry: 'Health / Environment / Organic',
            confidence: 'high',
            reason: 'Green tones suggest natural and healthy associations',
        });
    }

    // Check for warm colors (food, entertainment)
    const warmCount = hues.filter(h => h >= 0 && h < 75).length;
    if (warmCount >= colors.length * 0.5 && avgSaturation > 0.5) {
        suggestions.push({
            industry: 'Food / Entertainment / Lifestyle',
            confidence: 'high',
            reason: 'Warm, saturated colors create appetizing and energetic feel',
        });
    }

    // Check for low saturation (luxury, professional services)
    if (avgSaturation < 0.3) {
        suggestions.push({
            industry: 'Luxury / Professional Services / Law',
            confidence: 'medium',
            reason: 'Muted tones suggest sophistication and elegance',
        });
    }

    // Check for purple (beauty, creativity)
    const purpleCount = hues.filter(h => h >= 255 && h < 300).length;
    if (purpleCount >= colors.length * 0.3) {
        suggestions.push({
            industry: 'Beauty / Creative / Arts',
            confidence: 'medium',
            reason: 'Purple tones suggest creativity and luxury',
        });
    }

    // Check for high contrast (fashion, design)
    const minL = Math.min(...lightnesses);
    const maxL = Math.max(...lightnesses);
    if (maxL - minL > 0.6) {
        suggestions.push({
            industry: 'Fashion / Design / Media',
            confidence: 'medium',
            reason: 'High contrast palette suggests bold visual identity',
        });
    }

    // Check for pastels (children, education)
    if (avgLightness > 0.7 && avgSaturation < 0.5 && avgSaturation > 0.2) {
        suggestions.push({
            industry: 'Children / Education / Healthcare',
            confidence: 'medium',
            reason: 'Soft pastel tones create friendly, approachable feel',
        });
    }

    // Fallback suggestion
    if (suggestions.length === 0) {
        suggestions.push({
            industry: 'General Purpose / Versatile',
            confidence: 'low',
            reason: 'Balanced palette suitable for various applications',
        });
    }

    return suggestions.slice(0, 4); // Return top 4
}

/**
 * Analyze color distribution
 */
export interface ColorDistribution {
    dominant: 'warm' | 'cool' | 'neutral';
    warmPercentage: number;
    coolPercentage: number;
    neutralPercentage: number;
    averageSaturation: number;
    averageLightness: number;
}

export function analyzeColorDistribution(colors: ExtractedColor[]): ColorDistribution {
    let warmCount = 0;
    let coolCount = 0;
    let neutralCount = 0;

    const saturations: number[] = [];
    const lightnesses: number[] = [];

    colors.forEach(color => {
        const hsl = tinycolor(color.hex).toHsl();
        const hue = hsl.h;

        saturations.push(hsl.s);
        lightnesses.push(hsl.l);

        if (hsl.s < 0.1) {
            neutralCount++;
        } else if ((hue >= 0 && hue < 90) || hue >= 300) {
            warmCount++;
        } else {
            coolCount++;
        }
    });

    const total = colors.length;
    const warmPercentage = (warmCount / total) * 100;
    const coolPercentage = (coolCount / total) * 100;
    const neutralPercentage = (neutralCount / total) * 100;

    let dominant: 'warm' | 'cool' | 'neutral';
    if (warmPercentage > coolPercentage && warmPercentage > neutralPercentage) {
        dominant = 'warm';
    } else if (coolPercentage > neutralPercentage) {
        dominant = 'cool';
    } else {
        dominant = 'neutral';
    }

    const averageSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;
    const averageLightness = lightnesses.reduce((a, b) => a + b, 0) / lightnesses.length;

    return {
        dominant,
        warmPercentage: Math.round(warmPercentage),
        coolPercentage: Math.round(coolPercentage),
        neutralPercentage: Math.round(neutralPercentage),
        averageSaturation: Math.round(averageSaturation * 100),
        averageLightness: Math.round(averageLightness * 100),
    };
}

/**
 * Get color name from hex
 */
export function getColorName(hex: string): string {
    const color = tinycolor(hex);
    const hsl = color.toHsl();
    const hue = hsl.h;
    const saturation = hsl.s;
    const lightness = hsl.l;

    // Handle grayscale
    if (saturation < 0.1) {
        if (lightness > 0.9) return 'White';
        if (lightness > 0.7) return 'Light Gray';
        if (lightness > 0.5) return 'Gray';
        if (lightness > 0.3) return 'Dark Gray';
        if (lightness > 0.1) return 'Charcoal';
        return 'Black';
    }

    // Lightness modifiers
    let lightnessModifier = '';
    if (lightness > 0.8) lightnessModifier = 'Light ';
    else if (lightness < 0.3) lightnessModifier = 'Dark ';

    // Saturation modifiers
    let saturationModifier = '';
    if (saturation < 0.3) saturationModifier = 'Muted ';
    else if (saturation > 0.8) saturationModifier = 'Vivid ';

    // Base color name by hue
    let baseName = '';
    if (hue >= 0 && hue < 15 || hue >= 345) baseName = 'Red';
    else if (hue >= 15 && hue < 45) baseName = 'Orange';
    else if (hue >= 45 && hue < 75) baseName = 'Yellow';
    else if (hue >= 75 && hue < 105) baseName = 'Lime';
    else if (hue >= 105 && hue < 135) baseName = 'Green';
    else if (hue >= 135 && hue < 165) baseName = 'Teal';
    else if (hue >= 165 && hue < 195) baseName = 'Cyan';
    else if (hue >= 195 && hue < 225) baseName = 'Blue';
    else if (hue >= 225 && hue < 255) baseName = 'Indigo';
    else if (hue >= 255 && hue < 285) baseName = 'Purple';
    else if (hue >= 285 && hue < 315) baseName = 'Magenta';
    else baseName = 'Pink';

    return `${lightnessModifier}${saturationModifier}${baseName}`.trim();
}
