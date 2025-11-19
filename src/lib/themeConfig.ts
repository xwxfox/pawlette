import type { CSSProperties } from 'react'

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
  }
  shadows: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  borders: 'none' | 'thin' | 'medium' | 'thick'
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  fontFamily: 'inter' | 'system' | 'mono' | 'serif'
  gradientType: 'none' | 'linear' | 'radial' | 'mesh' | 'fluid'
  buttonGradient: 'none' | 'linear' | 'radial' | 'custom'
  buttonCustomGradient?: string | null
  cardGradient: 'none' | 'linear' | 'radial' | 'mesh' | 'custom'
  cardCustomGradient?: string | null
  useGlass: boolean
  grainEnabled: boolean
  grainIntensity: number
  textContrast: number
  spacing: 'compact' | 'normal' | 'comfortable' | 'spacious'
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  headingWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  letterSpacing: 'tight' | 'normal' | 'wide'
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose'
  adaptGradientsForLightMode: boolean
}

export const defaultThemeConfig: ThemeConfig = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#ffffff',
    foreground: '#0a0a0a',
    muted: '#f5f5f5',
  },
  shadows: 'md',
  borders: 'thin',
  radius: 'md',
  fontFamily: 'inter',
  gradientType: 'mesh',
  buttonGradient: 'none',
  cardGradient: 'none',
  useGlass: false,
  grainEnabled: false,
  grainIntensity: 0.08,
  textContrast: 0,
  spacing: 'normal',
  fontSize: 'md',
  headingWeight: 'bold',
  letterSpacing: 'normal',
  lineHeight: 'normal',
  adaptGradientsForLightMode: true,
}

export function getShadowClass(shadow: ThemeConfig['shadows']): string {
  switch (shadow) {
    case 'none':
      return ''
    case 'sm':
      return 'shadow-sm'
    case 'md':
      return 'shadow-md'
    case 'lg':
      return 'shadow-lg'
    case 'xl':
      return 'shadow-xl'
  }
}

export function getBorderClass(border: ThemeConfig['borders']): string {
  switch (border) {
    case 'none':
      return ''
    case 'thin':
      return 'border'
    case 'medium':
      return 'border-2'
    case 'thick':
      return 'border-4'
  }
}

export function getRadiusClass(radius: ThemeConfig['radius']): string {
  switch (radius) {
    case 'none':
      return 'rounded-none'
    case 'sm':
      return 'rounded-sm'
    case 'md':
      return 'rounded-md'
    case 'lg':
      return 'rounded-lg'
    case 'xl':
      return 'rounded-xl'
    case 'full':
      return 'rounded-full'
  }
}

export function getFontFamilyClass(font: ThemeConfig['fontFamily']): string {
  switch (font) {
    case 'inter':
      return 'font-sans'
    case 'system':
      return 'font-system'
    case 'mono':
      return 'font-mono'
    case 'serif':
      return 'font-serif'
  }
}

export function getButtonGradient(
  config: ThemeConfig,
  color: string,
  color2?: string,
  isDarkMode?: boolean
): CSSProperties {
  if (config.buttonGradient === 'custom' && config.buttonCustomGradient) {
    const gradient = adaptGradientForLightMode(
      config.buttonCustomGradient,
      isDarkMode ?? true,
      config.adaptGradientsForLightMode
    )
    return { background: gradient }
  }

  if (config.buttonGradient === 'none') {
    return { background: color }
  }

  const c2 = color2 || config.colors.secondary
  let gradient = ''

  if (config.buttonGradient === 'linear') {
    gradient = `linear-gradient(135deg, ${color}, ${c2})`
  } else if (config.buttonGradient === 'radial') {
    gradient = `radial-gradient(ellipse at top left, ${color}, ${c2})`
  } else {
    return { background: color }
  }

  gradient = adaptGradientForLightMode(gradient, isDarkMode ?? true, config.adaptGradientsForLightMode)
  return { background: gradient }
}

export function getCardGradient(
  config: ThemeConfig,
  color1: string,
  color2?: string,
  color3?: string,
  isDarkMode?: boolean
): CSSProperties | undefined {
  if (config.cardGradient === 'custom' && config.cardCustomGradient) {
    const gradient = adaptGradientForLightMode(
      config.cardCustomGradient,
      isDarkMode ?? true,
      config.adaptGradientsForLightMode
    )
    return { background: gradient }
  }

  if (config.cardGradient === 'none') {
    return undefined
  }

  const c2 = color2 || config.colors.secondary
  const c3 = color3 || config.colors.accent
  let gradient = ''

  if (config.cardGradient === 'linear') {
    gradient = `linear-gradient(135deg, ${color1}15, ${c2}15)`
  } else if (config.cardGradient === 'radial') {
    gradient = `radial-gradient(ellipse at top left, ${color1}10, ${c2}10)`
  } else if (config.cardGradient === 'mesh') {
    gradient = `radial-gradient(ellipse 80% 80% at 20% 30%, ${color1}15, transparent 50%), radial-gradient(ellipse 70% 70% at 80% 40%, ${c2}15, transparent 50%), radial-gradient(ellipse 60% 80% at 50% 80%, ${c3}10, transparent 50%)`
  } else {
    return undefined
  }

  gradient = adaptGradientForLightMode(gradient, isDarkMode ?? true, config.adaptGradientsForLightMode)
  return { background: gradient }
}

export function getSpacingClass(spacing: ThemeConfig['spacing']): string {
  switch (spacing) {
    case 'compact':
      return 'space-compact'
    case 'normal':
      return ''
    case 'comfortable':
      return 'space-comfortable'
    case 'spacious':
      return 'space-spacious'
  }
}

export function getFontSizeClass(size: ThemeConfig['fontSize']): string {
  switch (size) {
    case 'sm':
      return 'text-sm'
    case 'md':
      return 'text-base'
    case 'lg':
      return 'text-lg'
    case 'xl':
      return 'text-xl'
  }
}

export function getHeadingWeightClass(weight: ThemeConfig['headingWeight']): string {
  switch (weight) {
    case 'normal':
      return 'font-normal'
    case 'medium':
      return 'font-medium'
    case 'semibold':
      return 'font-semibold'
    case 'bold':
      return 'font-bold'
    case 'extrabold':
      return 'font-extrabold'
  }
}

export function getLetterSpacingClass(spacing: ThemeConfig['letterSpacing']): string {
  switch (spacing) {
    case 'tight':
      return 'tracking-tight'
    case 'normal':
      return 'tracking-normal'
    case 'wide':
      return 'tracking-wide'
  }
}

export function getLineHeightClass(height: ThemeConfig['lineHeight']): string {
  switch (height) {
    case 'tight':
      return 'leading-tight'
    case 'normal':
      return 'leading-normal'
    case 'relaxed':
      return 'leading-relaxed'
    case 'loose':
      return 'leading-loose'
  }
}

/**
 * Adjusts gradient colors to work better in light mode while preserving the feel
 * @param gradient Original gradient string
 * @param isDarkMode Whether the current theme is dark mode
 * @param shouldAdapt Whether to apply the adaptation
 * @returns Adjusted gradient string
 */
export function adaptGradientForLightMode(
  gradient: string,
  isDarkMode: boolean,
  shouldAdapt: boolean
): string {
  // If in dark mode, adaptation disabled, or no gradient, return as-is
  if (isDarkMode || !shouldAdapt || !gradient) {
    return gradient
  }

  // Light mode adaptation: make gradients lighter and more subtle
  // This regex finds hex colors in the gradient string
  const hexColorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})([0-9a-fA-F]{2})?/g

  return gradient.replace(hexColorRegex, (match, hex, alpha) => {
    // Parse the hex color
    const fullHex = hex.length === 3
      ? hex.split('').map(c => c + c).join('')
      : hex

    const r = parseInt(fullHex.substring(0, 2), 16)
    const g = parseInt(fullHex.substring(2, 4), 16)
    const b = parseInt(fullHex.substring(4, 6), 16)

    // Convert to HSL for easier manipulation
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r / 255: h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6; break
        case g / 255: h = ((b / 255 - r / 255) / d + 2) / 6; break
        case b / 255: h = ((r / 255 - g / 255) / d + 4) / 6; break
      }
    }

    // Increase lightness and reduce saturation for light mode
    l = Math.min(0.95, l + 0.2) // Make lighter
    s = s * 0.7 // Reduce saturation to make more subtle

    // Convert back to RGB
    const hsl2rgb = (h: number, s: number, l: number) => {
      let r, g, b

      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1 / 6) return p + (q - p) * 6 * t
          if (t < 1 / 2) return q
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
          return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
      }

      return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
      ]
    }

    const [newR, newG, newB] = hsl2rgb(h, s, l)
    const newHex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`

    // Preserve alpha if it exists
    return alpha ? `${newHex}${alpha}` : newHex
  })
}

