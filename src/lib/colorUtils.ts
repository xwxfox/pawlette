import type { RGBColor, HSLColor, OKLCHColor, ExtractedColor, GeneratedPalette } from './types'

export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
}

export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function rgbToOklch(rgb: RGBColor): OKLCHColor {
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

  return {
    l: Math.round(L * 1000) / 1000,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(H * 10) / 10,
  }
}

export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

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

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

function calculateColorVisualWeight(rgb: RGBColor, count: number, saturation: number, lightness: number): number {
  const normalizedSaturation = saturation / 100
  const normalizedLightness = lightness / 100
  
  const saturationBoost = Math.pow(normalizedSaturation, 1.5) * 2
  const lightnessBalance = 1 - Math.abs(normalizedLightness - 0.5) * 1.5
  const frequencyWeight = Math.sqrt(count)
  
  return frequencyWeight * (1 + saturationBoost) * (0.5 + lightnessBalance)
}

function isNearGrayscale(hsl: HSLColor): boolean {
  return hsl.s < 15
}

function colorsAreSimilar(hsl1: HSLColor, hsl2: HSLColor): boolean {
  const hueDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h))
  const satDiff = Math.abs(hsl1.s - hsl2.s)
  const lightDiff = Math.abs(hsl1.l - hsl2.l)
  
  if (hsl1.s < 20 && hsl2.s < 20) {
    return lightDiff < 15
  }
  
  return hueDiff < 30 && satDiff < 20 && lightDiff < 20
}

export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      const maxSize = 400
      let width = img.width
      let height = img.height

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width
        width = maxSize
      } else if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const pixels = imageData.data

      const colorMap = new Map<string, { count: number; r: number; g: number; b: number }>()

      for (let i = 0; i < pixels.length; i += 12) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        if (a < 128) continue

        const bucket = `${Math.floor(r / 15)},${Math.floor(g / 15)},${Math.floor(b / 15)}`
        const existing = colorMap.get(bucket)
        
        if (existing) {
          existing.count++
          existing.r += r
          existing.g += g
          existing.b += b
        } else {
          colorMap.set(bucket, { count: 1, r, g, b })
        }
      }

      const colorClusters: Array<{ rgb: RGBColor; hsl: HSLColor; count: number; weight: number }> = []
      
      for (const [, data] of colorMap.entries()) {
        const avgRgb = {
          r: Math.round(data.r / data.count),
          g: Math.round(data.g / data.count),
          b: Math.round(data.b / data.count)
        }
        
        const hsl = rgbToHsl(avgRgb)
        
        if (hsl.l < 10 || hsl.l > 95) continue
        
        const weight = calculateColorVisualWeight(avgRgb, data.count, hsl.s, hsl.l)
        
        colorClusters.push({
          rgb: avgRgb,
          hsl,
          count: data.count,
          weight
        })
      }

      colorClusters.sort((a, b) => b.weight - a.weight)

      const distinctColors: typeof colorClusters = []
      const maxColors = 10
      
      for (const cluster of colorClusters) {
        if (distinctColors.length >= maxColors) break
        
        const isSimilar = distinctColors.some(existing => 
          colorsAreSimilar(cluster.hsl, existing.hsl)
        )
        
        if (!isSimilar) {
          distinctColors.push(cluster)
        }
      }

      const vibrantColors = distinctColors.filter(c => !isNearGrayscale(c.hsl))
      const neutralColors = distinctColors.filter(c => isNearGrayscale(c.hsl)).slice(0, 2)
      
      const selectedColors = [...vibrantColors, ...neutralColors].slice(0, 8)
      
      const totalCount = selectedColors.reduce((sum, c) => sum + c.count, 0)

      const extractedColors: ExtractedColor[] = selectedColors.map((cluster) => {
        const rgb = cluster.rgb
        return {
          rgb,
          hsl: rgbToHsl(rgb),
          oklch: rgbToOklch(rgb),
          hex: rgbToHex(rgb),
          percentage: Math.round((cluster.count / totalCount) * 100 * 10) / 10,
        }
      })

      resolve(extractedColors)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = imageUrl
  })
}

export function identifySemanticColors(colors: ExtractedColor[]): {
  primary?: ExtractedColor
  accent?: ExtractedColor
  background?: ExtractedColor
} {
  if (colors.length === 0) return {}

  const vibrantColors = colors.filter(c => c.hsl.s > 30 && c.hsl.l > 25 && c.hsl.l < 75)
  const neutralColors = colors.filter(c => c.hsl.s <= 30)
  
  const primary = vibrantColors.length > 0 
    ? vibrantColors.sort((a, b) => (b.hsl.s * b.percentage) - (a.hsl.s * a.percentage))[0]
    : colors[0]
  
  const accent = vibrantColors.length > 1
    ? vibrantColors
        .filter(c => {
          const hueDiff = Math.min(Math.abs(c.hsl.h - primary.hsl.h), 360 - Math.abs(c.hsl.h - primary.hsl.h))
          return hueDiff > 30
        })
        .sort((a, b) => b.hsl.s - a.hsl.s)[0] || vibrantColors[1]
    : vibrantColors[0] || colors[1]
  
  const lightColors = colors.filter(c => c.hsl.l > 80)
  const background = lightColors.length > 0
    ? lightColors.sort((a, b) => b.hsl.l - a.hsl.l)[0]
    : neutralColors.sort((a, b) => b.hsl.l - a.hsl.l)[0] || colors[colors.length - 1]

  return { primary, accent, background }
}

export function generatePalette(baseColor: ExtractedColor, type: GeneratedPalette['type']): GeneratedPalette {
  const colors: ExtractedColor[] = []
  const baseHue = baseColor.hsl.h
  const baseSat = baseColor.hsl.s
  const baseLight = baseColor.hsl.l

  switch (type) {
    case 'complementary':
      colors.push(
        baseColor,
        createColorFromHsl({ h: (baseHue + 180) % 360, s: baseSat, l: baseLight })
      )
      break

    case 'analogous':
      colors.push(
        createColorFromHsl({ h: (baseHue - 30 + 360) % 360, s: baseSat, l: baseLight }),
        baseColor,
        createColorFromHsl({ h: (baseHue + 30) % 360, s: baseSat, l: baseLight })
      )
      break

    case 'triadic':
      colors.push(
        baseColor,
        createColorFromHsl({ h: (baseHue + 120) % 360, s: baseSat, l: baseLight }),
        createColorFromHsl({ h: (baseHue + 240) % 360, s: baseSat, l: baseLight })
      )
      break

    case 'tetradic':
      colors.push(
        baseColor,
        createColorFromHsl({ h: (baseHue + 90) % 360, s: baseSat, l: baseLight }),
        createColorFromHsl({ h: (baseHue + 180) % 360, s: baseSat, l: baseLight }),
        createColorFromHsl({ h: (baseHue + 270) % 360, s: baseSat, l: baseLight })
      )
      break

    case 'split-complementary':
      colors.push(
        baseColor,
        createColorFromHsl({ h: (baseHue + 150) % 360, s: baseSat, l: baseLight }),
        createColorFromHsl({ h: (baseHue + 210) % 360, s: baseSat, l: baseLight })
      )
      break

    case 'monochromatic':
      for (let i = 0; i < 5; i++) {
        const lightness = Math.max(20, Math.min(90, baseLight + (i - 2) * 15))
        colors.push(createColorFromHsl({ h: baseHue, s: baseSat, l: lightness }))
      }
      break
  }

  return { type, colors, baseColor }
}

function createColorFromHsl(hsl: HSLColor): ExtractedColor {
  const rgb = hslToRgb(hsl)
  return {
    rgb,
    hsl,
    oklch: rgbToOklch(rgb),
    hex: rgbToHex(rgb),
    percentage: 0,
  }
}

export function getContrastRatio(color1: RGBColor, color2: RGBColor): number {
  const getLuminance = (rgb: RGBColor) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      const v = val / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

export function isColorLight(color: RGBColor): boolean {
  const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255
  return luminance > 0.5
}
