export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface HSLColor {
  h: number
  s: number
  l: number
}

export interface OKLCHColor {
  l: number
  c: number
  h: number
}

export interface ExtractedColor {
  rgb: RGBColor
  hsl: HSLColor
  oklch: OKLCHColor
  hex: string
  percentage: number
}

export interface ColorAnalysis {
  id: string
  imageUrl: string
  imageName: string
  timestamp: number
  dominantColors: ExtractedColor[]
  semanticColors: {
    primary?: ExtractedColor
    accent?: ExtractedColor
    background?: ExtractedColor
  }
}

export interface GeneratedPalette {
  type: 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'tetradic' | 'split-complementary'
  colors: ExtractedColor[]
  baseColor: ExtractedColor
}
