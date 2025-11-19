export interface PopularPalette {
    id: string;
    name: string;
    colors: string[];
    category: 'modern' | 'vintage' | 'pastel' | 'vibrant' | 'dark' | 'nature' | 'professional' | 'playful';
    tags: string[];
}

export const popularPalettes: PopularPalette[] = [
    // Modern
    {
        id: 'modern-1',
        name: 'Midnight Slate',
        colors: ['#0f172a', '#1e293b', '#334155', '#64748b', '#cbd5e1'],
        category: 'modern',
        tags: ['dark', 'professional', 'tech'],
    },
    {
        id: 'modern-2',
        name: 'Ocean Breeze',
        colors: ['#0ea5e9', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'],
        category: 'modern',
        tags: ['blue', 'fresh', 'clean'],
    },
    {
        id: 'modern-3',
        name: 'Neon Nights',
        colors: ['#e879f9', '#c084fc', '#a78bfa', '#818cf8', '#60a5fa'],
        category: 'modern',
        tags: ['purple', 'gradient', 'vibrant'],
    },
    {
        id: 'modern-4',
        name: 'Forest Mist',
        colors: ['#065f46', '#047857', '#059669', '#10b981', '#34d399'],
        category: 'modern',
        tags: ['green', 'nature', 'calm'],
    },
    {
        id: 'modern-5',
        name: 'Sunset Glow',
        colors: ['#dc2626', '#ea580c', '#f59e0b', '#fbbf24', '#fde047'],
        category: 'modern',
        tags: ['warm', 'gradient', 'energetic'],
    },

    // Vintage
    {
        id: 'vintage-1',
        name: 'Retro Diner',
        colors: ['#dc2626', '#fbbf24', '#0ea5e9', '#f8fafc', '#1e293b'],
        category: 'vintage',
        tags: ['retro', 'classic', 'bold'],
    },
    {
        id: 'vintage-2',
        name: 'Autumn Harvest',
        colors: ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b'],
        category: 'vintage',
        tags: ['brown', 'warm', 'rustic'],
    },
    {
        id: 'vintage-3',
        name: 'Victorian Rose',
        colors: ['#881337', '#9f1239', '#be123c', '#e11d48', '#f43f5e'],
        category: 'vintage',
        tags: ['red', 'romantic', 'elegant'],
    },
    {
        id: 'vintage-4',
        name: 'Olive Garden',
        colors: ['#365314', '#3f6212', '#4d7c0f', '#65a30d', '#84cc16'],
        category: 'vintage',
        tags: ['green', 'muted', 'natural'],
    },
    {
        id: 'vintage-5',
        name: 'Sepia Tones',
        colors: ['#292524', '#44403c', '#78716c', '#a8a29e', '#d6d3d1'],
        category: 'vintage',
        tags: ['neutral', 'warm', 'classic'],
    },

    // Pastel
    {
        id: 'pastel-1',
        name: 'Cotton Candy',
        colors: ['#fecdd3', '#fbcfe8', '#ddd6fe', '#bfdbfe', '#bae6fd'],
        category: 'pastel',
        tags: ['soft', 'playful', 'sweet'],
    },
    {
        id: 'pastel-2',
        name: 'Spring Garden',
        colors: ['#fef08a', '#bef264', '#86efac', '#6ee7b7', '#5eead4'],
        category: 'pastel',
        tags: ['spring', 'fresh', 'light'],
    },
    {
        id: 'pastel-3',
        name: 'Lavender Dream',
        colors: ['#e9d5ff', '#d8b4fe', '#c4b5fd', '#a78bfa', '#8b5cf6'],
        category: 'pastel',
        tags: ['purple', 'dreamy', 'soft'],
    },
    {
        id: 'pastel-4',
        name: 'Peachy Keen',
        colors: ['#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c'],
        category: 'pastel',
        tags: ['orange', 'warm', 'friendly'],
    },
    {
        id: 'pastel-5',
        name: 'Mint Cream',
        colors: ['#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16'],
        category: 'pastel',
        tags: ['green', 'fresh', 'light'],
    },

    // Vibrant
    {
        id: 'vibrant-1',
        name: 'Electric Dreams',
        colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'],
        category: 'vibrant',
        tags: ['gradient', 'bold', 'modern'],
    },
    {
        id: 'vibrant-2',
        name: 'Tropical Paradise',
        colors: ['#f43f5e', '#f59e0b', '#84cc16', '#14b8a6', '#3b82f6'],
        category: 'vibrant',
        tags: ['rainbow', 'tropical', 'fun'],
    },
    {
        id: 'vibrant-3',
        name: 'Cyber Punk',
        colors: ['#f0abfc', '#c084fc', '#a78bfa', '#818cf8', '#22d3ee'],
        category: 'vibrant',
        tags: ['neon', 'futuristic', 'bold'],
    },
    {
        id: 'vibrant-4',
        name: 'Hot Sauce',
        colors: ['#991b1b', '#dc2626', '#ef4444', '#f87171', '#fca5a5'],
        category: 'vibrant',
        tags: ['red', 'intense', 'hot'],
    },
    {
        id: 'vibrant-5',
        name: 'Lime Punch',
        colors: ['#14532d', '#166534', '#16a34a', '#22c55e', '#4ade80'],
        category: 'vibrant',
        tags: ['green', 'energetic', 'fresh'],
    },

    // Dark
    {
        id: 'dark-1',
        name: 'Shadow Realm',
        colors: ['#000000', '#18181b', '#27272a', '#3f3f46', '#52525b'],
        category: 'dark',
        tags: ['black', 'minimal', 'modern'],
    },
    {
        id: 'dark-2',
        name: 'Deep Ocean',
        colors: ['#0c4a6e', '#075985', '#0369a1', '#0284c7', '#0ea5e9'],
        category: 'dark',
        tags: ['blue', 'deep', 'professional'],
    },
    {
        id: 'dark-3',
        name: 'Midnight Forest',
        colors: ['#14532d', '#166534', '#15803d', '#16a34a', '#22c55e'],
        category: 'dark',
        tags: ['green', 'dark', 'nature'],
    },
    {
        id: 'dark-4',
        name: 'Cosmic Purple',
        colors: ['#3b0764', '#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed'],
        category: 'dark',
        tags: ['purple', 'space', 'mystical'],
    },
    {
        id: 'dark-5',
        name: 'Ember Glow',
        colors: ['#431407', '#7c2d12', '#9a3412', '#c2410c', '#ea580c'],
        category: 'dark',
        tags: ['orange', 'warm', 'fire'],
    },

    // Nature
    {
        id: 'nature-1',
        name: 'Earth Tones',
        colors: ['#78350f', '#a16207', '#65a30d', '#0d9488', '#0891b2'],
        category: 'nature',
        tags: ['earth', 'organic', 'balanced'],
    },
    {
        id: 'nature-2',
        name: 'Mountain Meadow',
        colors: ['#065f46', '#047857', '#10b981', '#34d399', '#6ee7b7'],
        category: 'nature',
        tags: ['green', 'fresh', 'outdoor'],
    },
    {
        id: 'nature-3',
        name: 'Desert Sand',
        colors: ['#78350f', '#92400e', '#d97706', '#fbbf24', '#fde047'],
        category: 'nature',
        tags: ['brown', 'yellow', 'warm'],
    },
    {
        id: 'nature-4',
        name: 'Ocean Depths',
        colors: ['#164e63', '#155e75', '#0e7490', '#0891b2', '#06b6d4'],
        category: 'nature',
        tags: ['blue', 'water', 'calm'],
    },
    {
        id: 'nature-5',
        name: 'Sunset Valley',
        colors: ['#be185d', '#db2777', '#f472b6', '#fda4af', '#fecdd3'],
        category: 'nature',
        tags: ['pink', 'sunset', 'romantic'],
    },

    // Professional
    {
        id: 'professional-1',
        name: 'Corporate Blue',
        colors: ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa'],
        category: 'professional',
        tags: ['blue', 'trust', 'business'],
    },
    {
        id: 'professional-2',
        name: 'Executive Suite',
        colors: ['#1c1917', '#292524', '#44403c', '#78716c', '#a8a29e'],
        category: 'professional',
        tags: ['neutral', 'elegant', 'formal'],
    },
    {
        id: 'professional-3',
        name: 'Financial Green',
        colors: ['#14532d', '#166534', '#15803d', '#16a34a', '#22c55e'],
        category: 'professional',
        tags: ['green', 'money', 'growth'],
    },
    {
        id: 'professional-4',
        name: 'Tech Innovation',
        colors: ['#0c4a6e', '#1e40af', '#7c3aed', '#06b6d4', '#10b981'],
        category: 'professional',
        tags: ['tech', 'modern', 'innovative'],
    },
    {
        id: 'professional-5',
        name: 'Luxury Brand',
        colors: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'],
        category: 'professional',
        tags: ['luxury', 'minimalist', 'premium'],
    },

    // Playful
    {
        id: 'playful-1',
        name: 'Bubble Gum',
        colors: ['#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899'],
        category: 'playful',
        tags: ['pink', 'fun', 'sweet'],
    },
    {
        id: 'playful-2',
        name: 'Candy Store',
        colors: ['#fb7185', '#fb923c', '#fbbf24', '#a3e635', '#22d3ee'],
        category: 'playful',
        tags: ['rainbow', 'bright', 'happy'],
    },
    {
        id: 'playful-3',
        name: 'Toy Box',
        colors: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6'],
        category: 'playful',
        tags: ['primary', 'children', 'fun'],
    },
    {
        id: 'playful-4',
        name: 'Ice Cream',
        colors: ['#fef3c7', '#fed7aa', '#fecaca', '#ddd6fe', '#bae6fd'],
        category: 'playful',
        tags: ['pastel', 'sweet', 'soft'],
    },
    {
        id: 'playful-5',
        name: 'Party Time',
        colors: ['#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#eab308'],
        category: 'playful',
        tags: ['vibrant', 'celebration', 'energetic'],
    },

    // Additional Modern Palettes
    {
        id: 'modern-6',
        name: 'Monochrome',
        colors: ['#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'],
        category: 'modern',
        tags: ['black', 'white', 'minimalist'],
    },
    {
        id: 'modern-7',
        name: 'Nordic Snow',
        colors: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#06b6d4'],
        category: 'modern',
        tags: ['blue', 'light', 'clean'],
    },
    {
        id: 'modern-8',
        name: 'Rose Gold',
        colors: ['#f4e4e8', '#e8c4d0', '#d494a7', '#c16481', '#b7385c'],
        category: 'modern',
        tags: ['pink', 'luxury', 'elegant'],
    },

    // Additional Nature Palettes
    {
        id: 'nature-6',
        name: 'Cherry Blossom',
        colors: ['#fef2f2', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e'],
        category: 'nature',
        tags: ['pink', 'spring', 'delicate'],
    },
    {
        id: 'nature-7',
        name: 'Autumn Leaves',
        colors: ['#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316'],
        category: 'nature',
        tags: ['orange', 'fall', 'warm'],
    },
    {
        id: 'nature-8',
        name: 'Tropical Forest',
        colors: ['#14532d', '#15803d', '#16a34a', '#4ade80', '#86efac'],
        category: 'nature',
        tags: ['green', 'jungle', 'lush'],
    },

    // Additional Professional Palettes
    {
        id: 'professional-6',
        name: 'Medical Blue',
        colors: ['#f0f9ff', '#e0f2fe', '#7dd3fc', '#0ea5e9', '#0284c7'],
        category: 'professional',
        tags: ['blue', 'clean', 'medical'],
    },
    {
        id: 'professional-7',
        name: 'Law & Order',
        colors: ['#18181b', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'],
        category: 'professional',
        tags: ['gray', 'serious', 'formal'],
    },
    {
        id: 'professional-8',
        name: 'Banking Trust',
        colors: ['#1e3a8a', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
        category: 'professional',
        tags: ['blue', 'trust', 'stable'],
    },

    // Additional Vibrant Palettes
    {
        id: 'vibrant-6',
        name: 'Neon Rainbow',
        colors: ['#ff0080', '#ff00ff', '#8000ff', '#0080ff', '#00ffff'],
        category: 'vibrant',
        tags: ['neon', 'fluorescent', 'intense'],
    },
    {
        id: 'vibrant-7',
        name: 'Fire & Ice',
        colors: ['#dc2626', '#f97316', '#fbbf24', '#06b6d4', '#0ea5e9'],
        category: 'vibrant',
        tags: ['contrast', 'bold', 'dynamic'],
    },
    {
        id: 'vibrant-8',
        name: 'Digital Art',
        colors: ['#e11d48', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6'],
        category: 'vibrant',
        tags: ['artistic', 'colorful', 'creative'],
    },

    // Additional Dark Palettes
    {
        id: 'dark-6',
        name: 'Gothic Night',
        colors: ['#450a0a', '#7f1d1d', '#991b1b', '#b91c1c', '#dc2626'],
        category: 'dark',
        tags: ['red', 'dark', 'dramatic'],
    },
    {
        id: 'dark-7',
        name: 'Deep Space',
        colors: ['#0c0a09', '#1c1917', '#292524', '#44403c', '#57534e'],
        category: 'dark',
        tags: ['black', 'space', 'minimal'],
    },
    {
        id: 'dark-8',
        name: 'Navy Command',
        colors: ['#082f49', '#0c4a6e', '#075985', '#0369a1', '#0284c7'],
        category: 'dark',
        tags: ['blue', 'navy', 'authority'],
    },

    // Additional Pastel Palettes
    {
        id: 'pastel-6',
        name: 'Baby Shower',
        colors: ['#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5', '#f3e8ff'],
        category: 'pastel',
        tags: ['soft', 'baby', 'gentle'],
    },
    {
        id: 'pastel-7',
        name: 'Macarons',
        colors: ['#fce7f3', '#fed7aa', '#fef3c7', '#d9f99d', '#e0e7ff'],
        category: 'pastel',
        tags: ['sweet', 'delicate', 'french'],
    },
    {
        id: 'pastel-8',
        name: 'Watercolor',
        colors: ['#dbeafe', '#e0e7ff', '#ede9fe', '#fce7f3', '#fef2f2'],
        category: 'pastel',
        tags: ['soft', 'artistic', 'light'],
    },

    // Additional Vintage Palettes
    {
        id: 'vintage-6',
        name: '70s Retro',
        colors: ['#78350f', '#ea580c', '#eab308', '#15803d', '#0e7490'],
        category: 'vintage',
        tags: ['70s', 'retro', 'groovy'],
    },
    {
        id: 'vintage-7',
        name: 'Art Deco',
        colors: ['#292524', '#78716c', '#d6d3d1', '#fbbf24', '#dc2626'],
        category: 'vintage',
        tags: ['20s', 'elegant', 'classic'],
    },
    {
        id: 'vintage-8',
        name: 'Old Hollywood',
        colors: ['#18181b', '#7f1d1d', '#b91c1c', '#fbbf24', '#f5f5f4'],
        category: 'vintage',
        tags: ['glamour', 'classic', 'luxurious'],
    },

    // Additional Playful Palettes
    {
        id: 'playful-6',
        name: 'Circus',
        colors: ['#dc2626', '#eab308', '#3b82f6', '#ec4899', '#ffffff'],
        category: 'playful',
        tags: ['carnival', 'fun', 'bright'],
    },
    {
        id: 'playful-7',
        name: 'Unicorn Magic',
        colors: ['#fae8ff', '#f0abfc', '#e879f9', '#c084fc', '#a78bfa'],
        category: 'playful',
        tags: ['purple', 'pink', 'magical'],
    },
    {
        id: 'playful-8',
        name: 'Lemonade Stand',
        colors: ['#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308'],
        category: 'playful',
        tags: ['yellow', 'cheerful', 'sunny'],
    },
];

/**
 * Get palettes by category
 */
export function getPalettesByCategory(category: PopularPalette['category']): PopularPalette[] {
    return popularPalettes.filter(p => p.category === category);
}

/**
 * Get palettes by tag
 */
export function getPalettesByTag(tag: string): PopularPalette[] {
    return popularPalettes.filter(p => p.tags.includes(tag.toLowerCase()));
}

/**
 * Search palettes by name or tag
 */
export function searchPalettes(query: string): PopularPalette[] {
    const lowerQuery = query.toLowerCase();
    return popularPalettes.filter(
        p => p.name.toLowerCase().includes(lowerQuery) ||
            p.tags.some(tag => tag.includes(lowerQuery))
    );
}
