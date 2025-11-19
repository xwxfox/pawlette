import { useState } from 'react'
import { Palette, Swatches, Copy, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ColorSwatch } from './ColorSwatch'
import { GrainOverlay } from './GrainOverlay'
import { generatePalette, hslToRgb, rgbToHex } from '@/lib/colorUtils'
import { toast } from 'sonner'
import type { ExtractedColor, GeneratedPalette } from '@/lib/types'

interface PaletteGeneratorProps {
  baseColor: ExtractedColor
}

const paletteTypes: Array<{
  type: GeneratedPalette['type']
  label: string
  description: string
}> = [
  { type: 'complementary', label: 'Complementary', description: 'Opposite on color wheel' },
  { type: 'analogous', label: 'Analogous', description: 'Adjacent colors' },
  { type: 'triadic', label: 'Triadic', description: 'Three evenly spaced' },
  { type: 'tetradic', label: 'Tetradic', description: 'Four evenly spaced' },
  { type: 'split-complementary', label: 'Split Complementary', description: 'Base + two adjacent to complement' },
  { type: 'monochromatic', label: 'Monochromatic', description: 'Single hue variations' },
]

type GradientStyle = 'linear' | 'radial' | 'mesh' | 'stripe'

export function PaletteGenerator({ baseColor }: PaletteGeneratorProps) {
  const [selectedPalette, setSelectedPalette] = useState<GeneratedPalette | null>(null)
  const [gradientStyle, setGradientStyle] = useState<GradientStyle>('linear')
  const [showGrain, setShowGrain] = useState(false)
  const [grainIntensity, setGrainIntensity] = useState(0.08)
  const [luminosityAdjustment, setLuminosityAdjustment] = useState(0)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGeneratePalette = (type: GeneratedPalette['type']) => {
    const palette = generatePalette(baseColor, type)
    setSelectedPalette(palette)
  }

  const handleCopyColor = async (hex: string, index: number) => {
    await navigator.clipboard.writeText(hex)
    setCopiedIndex(index)
    toast.success(`Copied ${hex}`)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const adjustColorLuminosity = (color: ExtractedColor, adjustment: number): ExtractedColor => {
    const newLightness = Math.max(0, Math.min(100, color.hsl.l + adjustment))
    const rgb = hslToRgb({ h: color.hsl.h, s: color.hsl.s, l: newLightness })
    return {
      rgb,
      hsl: { h: color.hsl.h, s: color.hsl.s, l: newLightness },
      oklch: color.oklch,
      hex: rgbToHex(rgb),
      percentage: color.percentage,
    }
  }

  const adjustedPalette = selectedPalette && luminosityAdjustment !== 0
    ? {
        ...selectedPalette,
        colors: selectedPalette.colors.map(c => adjustColorLuminosity(c, luminosityAdjustment))
      }
    : selectedPalette

  const displayPalette = adjustedPalette || selectedPalette

  const getGradientStyle = (colors: ExtractedColor[]) => {
    switch (gradientStyle) {
      case 'linear':
        return {
          background: `linear-gradient(135deg, ${colors.map(c => c.hex).join(', ')})`
        }
      case 'radial':
        return {
          background: `radial-gradient(ellipse at center, ${colors.map(c => c.hex).join(', ')})`
        }
      case 'mesh':
        return {
          background: '#0a0a0a',
        }
      case 'stripe':
        return {
          background: `repeating-linear-gradient(90deg, ${colors.map((c, i) => 
            `${c.hex} ${i * (100 / colors.length)}%, ${c.hex} ${(i + 1) * (100 / colors.length)}%`
          ).join(', ')})`
        }
    }
  }

  const getMeshOverlay = (colors: ExtractedColor[]) => {
    if (gradientStyle !== 'mesh') return null
    
    return (
      <div
        className="absolute inset-0"
        style={{
          background: colors.length >= 3
            ? `radial-gradient(ellipse 110% 100% at 20% 30%, ${colors[0].hex}ee, transparent 50%), 
               radial-gradient(ellipse 100% 110% at 75% 25%, ${colors[1].hex}ee, transparent 50%), 
               radial-gradient(ellipse 120% 100% at 60% 70%, ${colors[2].hex}dd, transparent 52%)${colors[3] ? `, radial-gradient(ellipse 110% 100% at 30% 80%, ${colors[3].hex}cc, transparent 50%)` : ''}`
            : `radial-gradient(ellipse 120% 120% at 30% 30%, ${colors[0].hex}ee, transparent 60%)`,
          filter: 'blur(90px)',
        }}
      />
    )
  }

  const generateTints = (color: ExtractedColor, count: number = 5) => {
    const tints: ExtractedColor[] = []
    for (let i = 0; i < count; i++) {
      const lightness = 95 - (i * 15)
      const rgb = hslToRgb({ h: color.hsl.h, s: color.hsl.s, l: lightness })
      tints.push({
        ...color,
        rgb,
        hex: rgbToHex(rgb),
        hsl: { h: color.hsl.h, s: color.hsl.s, l: lightness }
      })
    }
    return tints
  }

  const generateShades = (color: ExtractedColor, count: number = 5) => {
    const shades: ExtractedColor[] = []
    for (let i = 0; i < count; i++) {
      const lightness = 80 - (i * 15)
      const rgb = hslToRgb({ h: color.hsl.h, s: color.hsl.s, l: lightness })
      shades.push({
        ...color,
        rgb,
        hex: rgbToHex(rgb),
        hsl: { h: color.hsl.h, s: color.hsl.s, l: lightness }
      })
    }
    return shades
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette size={24} weight="duotone" className="text-accent" />
          <h2 className="text-xl font-semibold">Generate Color Schemes</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {paletteTypes.map((palette) => (
            <Button
              key={palette.type}
              variant={selectedPalette?.type === palette.type ? 'default' : 'outline'}
              className="h-auto flex flex-col items-start p-4"
              onClick={() => handleGeneratePalette(palette.type)}
            >
              <span className="font-semibold text-sm">{palette.label}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {palette.description}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {selectedPalette && (
        <>
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">
                {selectedPalette.type.replace('-', ' ')} Palette
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="grain-palette"
                    checked={showGrain}
                    onCheckedChange={setShowGrain}
                  />
                  <Label htmlFor="grain-palette" className="text-sm cursor-pointer">
                    Grain Effect
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 mb-6">
              {showGrain && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label>Grain Intensity</Label>
                    <span className="text-muted-foreground">{Math.round(grainIntensity * 100)}%</span>
                  </div>
                  <Slider
                    min={0.02}
                    max={0.2}
                    step={0.01}
                    value={[grainIntensity]}
                    onValueChange={(value) => setGrainIntensity(value[0])}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="palette-luminosity">Luminosity Adjustment</Label>
                  <span className="text-muted-foreground">
                    {luminosityAdjustment > 0 ? '+' : ''}{luminosityAdjustment}%
                  </span>
                </div>
                <Slider
                  id="palette-luminosity"
                  min={-40}
                  max={40}
                  step={5}
                  value={[luminosityAdjustment]}
                  onValueChange={(value) => setLuminosityAdjustment(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Darker</span>
                  <span>Lighter</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {displayPalette?.colors.map((color, index) => (
                <div key={index} className="space-y-2">
                  <ColorSwatch color={color} size="md" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleCopyColor(color.hex, index)}
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check size={14} className="mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Swatches size={20} weight="duotone" />
                    Gradient Preview
                  </h4>
                  <div className="flex gap-2">
                    {(['linear', 'radial', 'mesh', 'stripe'] as GradientStyle[]).map((style) => (
                      <Button
                        key={style}
                        size="sm"
                        variant={gradientStyle === style ? 'default' : 'outline'}
                        onClick={() => setGradientStyle(style)}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div 
                  className="relative h-32 rounded-lg overflow-hidden"
                  style={getGradientStyle(displayPalette?.colors || [])}
                >
                  {getMeshOverlay(displayPalette?.colors || [])}
                  {showGrain && <GrainOverlay intensity={grainIntensity} />}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Color Bar</h4>
                <div className="flex h-20 rounded-lg overflow-hidden border">
                  {displayPalette?.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 transition-all duration-300 hover:flex-[1.5] cursor-pointer relative group"
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                      onClick={() => handleCopyColor(color.hex, index)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge className="bg-black/50 text-white backdrop-blur-sm">
                          {color.hex}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {selectedPalette.type === 'monochromatic' && displayPalette && displayPalette.colors.length > 0 && (
                <>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Tints (Lighter Variations)</h4>
                    <div className="flex h-16 rounded-lg overflow-hidden border">
                      {generateTints(displayPalette.colors[Math.floor(displayPalette.colors.length / 2)]).map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 cursor-pointer relative group"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => handleCopyColor(color.hex, index)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-mono bg-black/70 text-white px-2 py-1 rounded">
                              {color.hex}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Shades (Darker Variations)</h4>
                    <div className="flex h-16 rounded-lg overflow-hidden border">
                      {generateShades(displayPalette.colors[Math.floor(displayPalette.colors.length / 2)]).map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 cursor-pointer relative group"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => handleCopyColor(color.hex, index)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-mono bg-white/90 text-black px-2 py-1 rounded">
                              {color.hex}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}

              <Card className="p-4">
                <h4 className="font-semibold mb-3">UI Application Examples</h4>
                <div className="space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    {displayPalette?.colors.slice(0, 3).map((color, i) => (
                      <Button
                        key={i}
                        style={{ background: color.hex, color: 'white' }}
                        className="shadow-md hover:shadow-lg transition-shadow"
                      >
                        Button {i + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    {displayPalette?.colors.map((color, i) => (
                      <Badge
                        key={i}
                        style={{ background: `${color.hex}20`, color: color.hex, borderColor: color.hex }}
                        className="border"
                      >
                        Tag {i + 1}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {displayPalette?.colors.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg border"
                        style={{ 
                          background: `linear-gradient(135deg, ${color.hex}15, ${displayPalette.colors[(i+1) % displayPalette.colors.length].hex}15)`,
                          borderColor: `${color.hex}30`
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg mb-2"
                          style={{ background: color.hex }}
                        />
                        <p className="text-sm font-medium">Card {i + 1}</p>
                        <p className="text-xs text-muted-foreground">Sample content</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
