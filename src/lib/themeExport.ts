import type { ExtractedColor } from './types'
import { getContrastRatio, hslToRgb, rgbToHex } from './colorUtils'

interface ShadcnTheme {
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
  }
  radius: string
}

function ensureContrast(bgColor: ExtractedColor, preferWhite: boolean = true): string {
  const whiteRgb = { r: 255, g: 255, b: 255 }
  const blackRgb = { r: 0, g: 0, b: 0 }

  const whiteContrast = getContrastRatio(bgColor.rgb, whiteRgb)
  const blackContrast = getContrastRatio(bgColor.rgb, blackRgb)

  if (whiteContrast >= 4.5) return 'oklch(1 0 0)'
  if (blackContrast >= 4.5) return 'oklch(0.2 0 0)'

  return preferWhite ? 'oklch(1 0 0)' : 'oklch(0.2 0 0)'
}

function adjustLightness(color: ExtractedColor, targetL: number): string {
  const { h, s } = color.hsl
  const adjustedRgb = hslToRgb({ h, s, l: targetL })
  const adjustedOklch = convertRgbToOklchString(adjustedRgb)
  return adjustedOklch
}

function convertRgbToOklchString(rgb: { r: number; g: number; b: number }): string {
  let r = rgb.r / 255
  let g = rgb.g / 255
  let b = rgb.b / 255

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const C = Math.sqrt(a * a + b_ * b_)
  let H = Math.atan2(b_, a) * (180 / Math.PI)
  if (H < 0) H += 360

  const oklchL = Math.round(L * 1000) / 1000
  const oklchC = Math.round(C * 1000) / 1000
  const oklchH = Math.round(H * 10) / 10

  return `oklch(${oklchL} ${oklchC} ${oklchH})`
}

export function generateShadcnTheme(colors: ExtractedColor[], textContrast: number = 0): ShadcnTheme {
  if (colors.length === 0) {
    throw new Error('No colors provided')
  }

  const vibrantColors = colors.filter(c => c.hsl.s > 30 && c.hsl.l > 25 && c.hsl.l < 75)
  const lightColors = colors.filter(c => c.hsl.l > 80)
  const darkColors = colors.filter(c => c.hsl.l < 30)

  const primary = vibrantColors[0] || colors[0]
  const accent = vibrantColors[1] || vibrantColors[0] || colors[1] || colors[0]
  const background = lightColors[0] || { ...colors[0], oklch: { l: 0.98, c: 0.005, h: primary.oklch.h } }

  const adjustedPrimary = Math.max(0.45, Math.min(0.55, primary.oklch.l))
  const adjustedPrimaryChroma = Math.max(0.12, primary.oklch.c)
  const primaryOklch = `oklch(${adjustedPrimary} ${adjustedPrimaryChroma} ${primary.oklch.h})`

  const adjustedAccent = Math.max(0.5, Math.min(0.65, accent.oklch.l))
  const adjustedAccentChroma = Math.max(0.15, accent.oklch.c)
  const accentOklch = `oklch(${adjustedAccent} ${adjustedAccentChroma} ${accent.oklch.h})`

  const secondaryL = Math.max(0.85, Math.min(0.92, 0.88))
  const secondaryOklch = `oklch(${secondaryL} 0.015 ${primary.oklch.h})`

  const foregroundL = Math.max(0.1, Math.min(0.25, 0.15 + (textContrast / 300)))

  return {
    colors: {
      background: `oklch(0.99 0.002 ${primary.oklch.h})`,
      foreground: `oklch(${foregroundL} 0.015 ${primary.oklch.h})`,
      card: `oklch(1 0 0)`,
      cardForeground: `oklch(${foregroundL} 0.015 ${primary.oklch.h})`,
      popover: `oklch(1 0 0)`,
      popoverForeground: `oklch(${foregroundL} 0.015 ${primary.oklch.h})`,
      primary: primaryOklch,
      primaryForeground: `oklch(0.99 0.002 ${primary.oklch.h})`,
      secondary: secondaryOklch,
      secondaryForeground: `oklch(${Math.min(0.25, 0.2 + (textContrast / 300))} 0.015 ${primary.oklch.h})`,
      muted: `oklch(0.94 0.008 ${primary.oklch.h})`,
      mutedForeground: `oklch(${Math.max(0.40, Math.min(0.50, 0.45 + (textContrast / 300)))} 0.015 ${primary.oklch.h})`,
      accent: accentOklch,
      accentForeground: `oklch(0.99 0.002 ${accent.oklch.h})`,
      destructive: `oklch(0.55 0.22 25)`,
      destructiveForeground: `oklch(0.99 0.002 ${primary.oklch.h})`,
      border: `oklch(0.88 0.008 ${primary.oklch.h})`,
      input: `oklch(0.90 0.008 ${primary.oklch.h})`,
      ring: accentOklch,
    },
    radius: '0.5rem',
  }
}

export function generateShadcnDarkTheme(colors: ExtractedColor[], textContrast: number = 0): ShadcnTheme {
  if (colors.length === 0) {
    throw new Error('No colors provided')
  }

  const vibrantColors = colors.filter(c => c.hsl.s > 30 && c.hsl.l > 25 && c.hsl.l < 75)

  const primary = vibrantColors[0] || colors[0]
  const accent = vibrantColors[1] || vibrantColors[0] || colors[1] || colors[0]

  const adjustedPrimary = Math.max(0.60, Math.min(0.70, primary.oklch.l + 0.15))
  const adjustedPrimaryChroma = Math.max(0.15, primary.oklch.c)
  const primaryOklch = `oklch(${adjustedPrimary} ${adjustedPrimaryChroma} ${primary.oklch.h})`

  const adjustedAccent = Math.max(0.55, Math.min(0.65, accent.oklch.l))
  const adjustedAccentChroma = Math.max(0.18, accent.oklch.c)
  const accentOklch = `oklch(${adjustedAccent} ${adjustedAccentChroma} ${accent.oklch.h})`

  const foregroundL = Math.max(0.90, Math.min(1.0, 0.98 - (textContrast / 300)))

  return {
    colors: {
      background: `oklch(0.12 0.01 ${primary.oklch.h})`,
      foreground: `oklch(${foregroundL} 0.002 ${primary.oklch.h})`,
      card: `oklch(0.15 0.01 ${primary.oklch.h})`,
      cardForeground: `oklch(${foregroundL} 0.002 ${primary.oklch.h})`,
      popover: `oklch(0.15 0.01 ${primary.oklch.h})`,
      popoverForeground: `oklch(${foregroundL} 0.002 ${primary.oklch.h})`,
      primary: primaryOklch,
      primaryForeground: `oklch(0.1 0.01 ${primary.oklch.h})`,
      secondary: `oklch(0.25 0.02 ${primary.oklch.h})`,
      secondaryForeground: `oklch(${foregroundL} 0.002 ${primary.oklch.h})`,
      muted: `oklch(0.2 0.015 ${primary.oklch.h})`,
      mutedForeground: `oklch(${Math.max(0.60, Math.min(0.70, 0.65 - (textContrast / 300)))} 0.01 ${primary.oklch.h})`,
      accent: accentOklch,
      accentForeground: `oklch(${foregroundL} 0.002 ${accent.oklch.h})`,
      destructive: `oklch(0.6 0.22 27)`,
      destructiveForeground: `oklch(${foregroundL} 0.002 ${primary.oklch.h})`,
      border: `oklch(0.25 0.015 ${primary.oklch.h})`,
      input: `oklch(0.25 0.015 ${primary.oklch.h})`,
      ring: accentOklch,
    },
    radius: '0.5rem',
  }
}

export function exportThemeAsCSS(theme: ShadcnTheme, config?: any): string {
  const radiusValue = config?.radius === 'sm' ? '0.25rem' :
    config?.radius === 'md' ? '0.5rem' :
      config?.radius === 'lg' ? '0.75rem' :
        config?.radius === 'xl' ? '1rem' :
          config?.radius === 'full' ? '9999px' :
            config?.radius === 'none' ? '0' : theme.radius

  const isDark = config?.isDark === true

  const spacingCSS = config?.spacing && config.spacing !== 'normal' ? `
  /* Spacing adjustments */
  ${config.spacing === 'compact' ? '.space-compact > * + * { margin-top: 0.75rem; }' : ''}
  ${config.spacing === 'comfortable' ? '.space-comfortable > * + * { margin-top: 1.25rem; }' : ''}
  ${config.spacing === 'spacious' ? '.space-spacious > * + * { margin-top: 1.5rem; }' : ''}
  ` : ''

  const typographyCSS = config ? `
  /* Typography settings */
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ${config.fontSize === 'sm' ? 'font-size: 0.875rem;' : ''}
    ${config.fontSize === 'lg' ? 'font-size: 1.125rem;' : ''}
    ${config.fontSize === 'xl' ? 'font-size: 1.25rem;' : ''}
    ${config.letterSpacing === 'tight' ? 'letter-spacing: -0.025em;' : ''}
    ${config.letterSpacing === 'wide' ? 'letter-spacing: 0.025em;' : ''}
    ${config.lineHeight === 'tight' ? 'line-height: 1.25;' : ''}
    ${config.lineHeight === 'relaxed' ? 'line-height: 1.625;' : ''}
    ${config.lineHeight === 'loose' ? 'line-height: 2;' : ''}
  }
  
  h1, h2, h3, h4, h5, h6 {
    ${config.headingWeight === 'normal' ? 'font-weight: 400;' : ''}
    ${config.headingWeight === 'medium' ? 'font-weight: 500;' : ''}
    ${config.headingWeight === 'semibold' ? 'font-weight: 600;' : ''}
    ${config.headingWeight === 'bold' ? 'font-weight: 700;' : ''}
    ${config.headingWeight === 'extrabold' ? 'font-weight: 800;' : ''}
  }
  ` : `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  `

  const customGradientCSS = (config?.buttonGradient === 'custom' && config?.buttonCustomGradient) || (config?.cardGradient === 'custom' && config?.cardCustomGradient) ? `

/* Custom Gradient Classes */
${config?.buttonGradient === 'custom' && config?.buttonCustomGradient ? `
.button-custom-gradient {
  background: ${config.buttonCustomGradient};
}
` : ''}
${config?.cardGradient === 'custom' && config?.cardCustomGradient ? `
.card-custom-gradient {
  background: ${config.cardCustomGradient};
}
` : ''}` : ''

  const themeSettingsComment = config ? `
/* Theme Configuration Settings:
 * - Adapt Gradients for Light Mode: ${config.adaptGradientsForLightMode ? 'enabled' : 'disabled'}
 *   (Automatically adjusts gradient colors to work better in light mode)
 */
` : ''

  const selector = isDark ? '.dark' : ':root'

  return `@import 'tailwindcss';
@import "tw-animate-css";
${themeSettingsComment}
@layer base {
  * {
    @apply border-border;
  }
  ${typographyCSS}${spacingCSS}${customGradientCSS}
}

${selector} {
  --background: ${theme.colors.background};
  --foreground: ${theme.colors.foreground};
  --card: ${theme.colors.card};
  --card-foreground: ${theme.colors.cardForeground};
  --popover: ${theme.colors.popover};
  --popover-foreground: ${theme.colors.popoverForeground};
  --primary: ${theme.colors.primary};
  --primary-foreground: ${theme.colors.primaryForeground};
  --secondary: ${theme.colors.secondary};
  --secondary-foreground: ${theme.colors.secondaryForeground};
  --muted: ${theme.colors.muted};
  --muted-foreground: ${theme.colors.mutedForeground};
  --accent: ${theme.colors.accent};
  --accent-foreground: ${theme.colors.accentForeground};
  --destructive: ${theme.colors.destructive};
  --destructive-foreground: ${theme.colors.destructiveForeground};
  --border: ${theme.colors.border};
  --input: ${theme.colors.input};
  --ring: ${theme.colors.ring};
  --radius: ${radiusValue};
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  
  --radius-sm: calc(var(--radius) * 0.5);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) * 1.5);
  --radius-xl: calc(var(--radius) * 2);
  --radius-2xl: calc(var(--radius) * 3);
  --radius-full: 9999px;
}`
}

export function exportThemeAsJSON(theme: ShadcnTheme): string {
  return JSON.stringify(theme, null, 2)
}
