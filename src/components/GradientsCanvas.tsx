import { memo } from 'react'
import { Copy, Check, Gradient as GradientIcon, PencilSimple } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { GrainOverlay } from '@/components/GrainOverlay'
import type { ExtractedColor } from '@/lib/types'

interface GradientsCanvasProps {
  colors: ExtractedColor[]
  grainEnabled: boolean
  grainIntensity: number
  luminosityAdjustment: number
  saturation: number
  hueShift: number
  contrast: number
  blurAmount: number
  copiedGradient: string | null
  onCopyGradient: (gradient: string, name: string) => void
  onEditGradient?: (gradient: string, name: string) => void
}

export interface GradientExample {
  name: string
  description: string
  gradient: string
  bgStyle?: string
  filterBlur?: number
}

export const GradientsCanvas = memo(function GradientsCanvas({ 
  colors, 
  grainEnabled, 
  grainIntensity, 
  luminosityAdjustment, 
  saturation,
  hueShift,
  contrast,
  blurAmount,
  copiedGradient,
  onCopyGradient,
  onEditGradient
}: GradientsCanvasProps) {
  const copyGradient = async (gradient: string, name: string) => {
    await navigator.clipboard.writeText(gradient)
    onCopyGradient(gradient, name)
    toast.success('Gradient copied to clipboard')
  }
  
  const editGradient = (gradient: string, name: string) => {
    if (onEditGradient) {
      onEditGradient(gradient, name)
    }
  }

  const adjustColorHSL = (hexColor: string, lumAdjust: number, satAdjust: number, hueAdjust: number): string => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    
    h = (h + hueAdjust / 360) % 1
    if (h < 0) h += 1
    s = Math.max(0, Math.min(1, s + satAdjust / 100))
    l = Math.max(0, Math.min(1, l + lumAdjust / 100))
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    let rOut, gOut, bOut
    if (s === 0) {
      rOut = gOut = bOut = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      rOut = hue2rgb(p, q, h + 1/3)
      gOut = hue2rgb(p, q, h)
      bOut = hue2rgb(p, q, h - 1/3)
    }
    
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
    return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`
  }

  const adjustColorLuminosity = (hexColor: string, adjustment: number): string => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    const adjust = (value: number) => {
      const adjusted = value + (adjustment * 2.55)
      return Math.max(0, Math.min(255, Math.round(adjusted)))
    }
    
    const newR = adjust(r)
    const newG = adjust(g)
    const newB = adjust(b)
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  const vibrantColors = colors.filter(c => c.hsl.s > 30).slice(0, 6)
  const allColors = colors.slice(0, 6)

  const c1 = adjustColorHSL(vibrantColors[0]?.hex || allColors[0]?.hex || '#6366f1', luminosityAdjustment, saturation, hueShift)
  const c2 = adjustColorHSL(vibrantColors[1]?.hex || allColors[1]?.hex || '#8b5cf6', luminosityAdjustment, saturation, hueShift)
  const c3 = adjustColorHSL(vibrantColors[2]?.hex || allColors[2]?.hex || '#ec4899', luminosityAdjustment, saturation, hueShift)
  const c4 = adjustColorHSL(vibrantColors[3]?.hex || allColors[3]?.hex || '#f43f5e', luminosityAdjustment, saturation, hueShift)
  const c5 = adjustColorHSL(vibrantColors[4]?.hex || allColors[4]?.hex || '#06b6d4', luminosityAdjustment, saturation, hueShift)
  const c6 = adjustColorHSL(vibrantColors[5]?.hex || allColors[5]?.hex || '#10b981', luminosityAdjustment, saturation, hueShift)

  const linearGradients: GradientExample[] = [
    { name: 'Smooth Diagonal', description: 'Classic diagonal flow', gradient: `linear-gradient(135deg, ${c1}, ${c2})` },
    { name: 'Vertical Flow', description: 'Top to bottom gradient', gradient: `linear-gradient(180deg, ${c1}, ${c2})` },
    { name: 'Tri-Color Blend', description: 'Three colors merging', gradient: `linear-gradient(135deg, ${c1}, ${c2} 50%, ${c3})` },
    { name: 'Spectrum Flow', description: 'Multi-color spectrum', gradient: `linear-gradient(135deg, ${c1} 0%, ${c2} 25%, ${c3} 50%, ${c4} 75%, ${c5} 100%)` },
  ]

  const radialGradients: GradientExample[] = [
    { name: 'Radial Bloom', description: 'Centered soft glow', gradient: `radial-gradient(circle at center, ${c1}, ${c2} 60%, ${c3})` },
    { name: 'Offset Radial', description: 'Asymmetric spotlight', gradient: `radial-gradient(circle at 30% 30%, ${c1}, ${c2} 50%, ${c3})` },
    { name: 'Elliptical Spread', description: 'Stretched radial', gradient: `radial-gradient(ellipse 150% 100% at top, ${c1}, ${c2} 50%, ${c3})` },
    { name: 'Multi-Point Radial', description: 'Multiple radial sources', gradient: `radial-gradient(circle at 20% 50%, ${c1}cc, transparent 40%), radial-gradient(circle at 80% 50%, ${c2}cc, transparent 40%), radial-gradient(circle at 50% 50%, ${c3}99, transparent 50%)`, filterBlur: 40 },
  ]

  const fluidGradients: GradientExample[] = [
    { name: 'Liquid Silk', description: 'Smooth flowing texture', gradient: `radial-gradient(ellipse 120% 80% at 20% 30%, ${c1}ee, transparent 50%), radial-gradient(ellipse 100% 90% at 70% 20%, ${c2}ee, transparent 50%), radial-gradient(ellipse 130% 100% at 50% 80%, ${c3}dd, transparent 55%), radial-gradient(ellipse at 80% 70%, ${c4}bb, transparent 45%)`, filterBlur: 80 },
    { name: 'Fluid Morph', description: 'Organic morphing colors', gradient: `radial-gradient(ellipse 140% 110% at 15% 25%, ${c1}, transparent 55%), radial-gradient(ellipse 120% 100% at 75% 30%, ${c2}ee, transparent 50%), radial-gradient(ellipse 110% 120% at 60% 75%, ${c3}ee, transparent 52%), radial-gradient(ellipse 130% 90% at 30% 80%, ${c4}dd, transparent 50%)`, filterBlur: 90 },
    { name: 'Liquid Glass', description: 'Translucent flowing liquid', gradient: `radial-gradient(ellipse 150% 100% at 25% 20%, ${c1}dd, transparent 60%), radial-gradient(ellipse 130% 120% at 70% 35%, ${c2}cc, transparent 55%), radial-gradient(ellipse 120% 110% at 45% 70%, ${c3}dd, transparent 58%), radial-gradient(ellipse 140% 100% at 75% 80%, ${c4}bb, transparent 52%)`, filterBlur: 75 },
    { name: 'Velvet Wave', description: 'Soft undulating waves', gradient: `radial-gradient(ellipse 160% 100% at 30% 10%, ${c1}ee, transparent 50%), radial-gradient(ellipse 140% 120% at 80% 40%, ${c2}dd, transparent 52%), radial-gradient(ellipse 150% 110% at 25% 65%, ${c3}ee, transparent 55%), radial-gradient(ellipse 130% 100% at 70% 85%, ${c4}cc, transparent 50%)`, filterBlur: 85 },
  ]

  const meshGradients: GradientExample[] = [
    { name: 'Soft Mesh', description: 'Smooth blended orbs', gradient: `radial-gradient(ellipse 120% 100% at 18% 28%, ${c1}ee, transparent 50%), radial-gradient(ellipse 110% 110% at 72% 22%, ${c2}ee, transparent 48%), radial-gradient(ellipse 130% 100% at 65% 78%, ${c3}dd, transparent 52%), radial-gradient(ellipse 115% 120% at 28% 82%, ${c4}ee, transparent 50%), radial-gradient(ellipse 100% 100% at 50% 50%, ${c5}99, transparent 55%)`, filterBlur: 95 },
    { name: 'Aurora Mesh', description: 'Northern lights effect', gradient: `radial-gradient(ellipse 160% 110% at 22% 18%, ${c1}dd, transparent 58%), radial-gradient(ellipse 140% 100% at 78% 30%, ${c2}cc, transparent 52%), radial-gradient(ellipse 150% 120% at 48% 68%, ${c3}dd, transparent 56%), radial-gradient(ellipse 130% 110% at 72% 85%, ${c4}bb, transparent 50%), radial-gradient(ellipse 110% 100% at 35% 55%, ${c5}aa, transparent 52%)`, filterBlur: 100 },
    { name: 'Organic Blend', description: 'Natural color mixing', gradient: `radial-gradient(ellipse 135% 105% at 12% 22%, ${c1}ee, transparent 52%), radial-gradient(ellipse 125% 115% at 82% 18%, ${c2}dd, transparent 50%), radial-gradient(ellipse 140% 110% at 68% 72%, ${c3}ee, transparent 54%), radial-gradient(ellipse 120% 105% at 25% 78%, ${c4}dd, transparent 48%), radial-gradient(ellipse 115% 120% at 55% 45%, ${c6}88, transparent 55%)`, filterBlur: 88 },
    { name: 'Diffused Light', description: 'Soft ambient lighting', gradient: `radial-gradient(ellipse 170% 120% at 28% 25%, ${c1}cc, transparent 60%), radial-gradient(ellipse 150% 110% at 75% 32%, ${c2}bb, transparent 55%), radial-gradient(ellipse 140% 130% at 42% 75%, ${c3}cc, transparent 58%), radial-gradient(ellipse 160% 100% at 80% 78%, ${c4}aa, transparent 52%)`, filterBlur: 92 },
  ]

  const glassmorphicGradients: GradientExample[] = [
    { name: 'Frosted Flow', description: 'Flowing glass with mesh', gradient: `radial-gradient(ellipse 140% 100% at 25% 30%, ${c1}dd, transparent 55%), radial-gradient(ellipse 130% 110% at 75% 35%, ${c2}cc, transparent 50%), radial-gradient(ellipse 120% 120% at 50% 75%, ${c3}dd, transparent 52%)`, bgStyle: 'glass', filterBlur: 85 },
    { name: 'Liquid Glass', description: 'Translucent flowing surface', gradient: `radial-gradient(ellipse 150% 110% at 20% 25%, ${c1}bb, transparent 58%), radial-gradient(ellipse 140% 100% at 78% 30%, ${c2}aa, transparent 52%), radial-gradient(ellipse 130% 120% at 45% 70%, ${c3}bb, transparent 55%)`, bgStyle: 'glass', filterBlur: 90 },
    { name: 'Soft Frost', description: 'Gentle frosted effect', gradient: `radial-gradient(ellipse 160% 100% at 30% 20%, ${c1}99, transparent 60%), radial-gradient(ellipse 140% 110% at 70% 40%, ${c2}88, transparent 55%), radial-gradient(ellipse 150% 100% at 50% 75%, ${c3}99, transparent 58%)`, bgStyle: 'glass', filterBlur: 80 },
  ]

  const specialGradients: GradientExample[] = [
    { name: 'Iridescent Flow', description: 'Shifting metallic shimmer', gradient: `linear-gradient(125deg, ${c1} 0%, ${c2} 18%, ${c3} 35%, ${c4} 50%, ${c3} 65%, ${c2} 82%, ${c1} 100%)` },
    { name: 'Prism Refraction', description: 'Light splitting effect', gradient: `radial-gradient(ellipse 110% 100% at 48% 50%, ${c1}aa, transparent 65%), radial-gradient(ellipse 110% 100% at 50% 50%, ${c2}aa, transparent 65%), radial-gradient(ellipse 110% 100% at 52% 50%, ${c3}aa, transparent 65%)`, filterBlur: 45 },
    { name: 'Holographic Shift', description: 'Dynamic hologram effect', gradient: `linear-gradient(140deg, ${c1}cc 0%, ${c2}ee 22%, ${c3}cc 44%, ${c4}ee 66%, ${c5}cc 88%, ${c1}ee 100%)` },
    { name: 'Plasma Wave', description: 'Energetic plasma flow', gradient: `radial-gradient(ellipse 140% 100% at 35% 30%, ${c1}dd, transparent 55%), radial-gradient(ellipse 130% 110% at 68% 38%, ${c2}cc, transparent 50%), radial-gradient(ellipse 150% 100% at 45% 72%, ${c3}dd, transparent 52%), radial-gradient(ellipse 120% 120% at 75% 78%, ${c4}bb, transparent 48%)`, filterBlur: 70 },
  ]

  const renderGradientCards = (gradients: GradientExample[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {gradients.map((grad, index) => {
        const effectiveBlur = grad.filterBlur ? grad.filterBlur + blurAmount : blurAmount
        const contrastFilter = contrast !== 0 ? `contrast(${1 + contrast / 100})` : ''
        const blurFilter = effectiveBlur > 0 ? `blur(${effectiveBlur}px)` : ''
        const combinedFilter = [blurFilter, contrastFilter].filter(Boolean).join(' ')
        
        return (
        <Card key={index} className="overflow-hidden group">
          <div className="h-56 relative">
            {grad.bgStyle === 'glass' ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60" />
                <div
                  className="absolute inset-0"
                  style={{
                    background: grad.gradient,
                    filter: combinedFilter || 'none',
                  }}
                />
                <div className="absolute inset-0 backdrop-blur-xl border-t border-white/10" />
              </>
            ) : grad.filterBlur ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/90" />
                <div
                  className="absolute inset-0"
                  style={{
                    background: grad.gradient,
                    filter: combinedFilter,
                  }}
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{ 
                  background: grad.gradient,
                  filter: combinedFilter || 'none'
                }}
              />
            )}
            
            {grainEnabled && <GrainOverlay intensity={grainIntensity} />}

            <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/40 to-transparent">
              <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
                {grad.name}
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-sm">{grad.name}</h4>
              <p className="text-xs text-muted-foreground">{grad.description}</p>
            </div>
            
            <div className="flex items-start gap-2">
              <code className="flex-1 text-xs font-mono bg-muted p-2 rounded overflow-x-auto max-h-20">
                {grad.gradient}
              </code>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => editGradient(grad.gradient, grad.name)}
                  title="Edit gradient"
                >
                  <PencilSimple size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyGradient(grad.gradient, grad.name)}
                  title="Copy gradient"
                >
                  {copiedGradient === grad.name ? (
                    <Check size={16} weight="bold" className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GradientIcon size={24} weight="duotone" className="text-accent" />
        <h2 className="text-xl font-semibold">Gradient Showcase</h2>
      </div>

      <Tabs defaultValue="fluid" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="fluid">Fluid</TabsTrigger>
          <TabsTrigger value="mesh">Mesh</TabsTrigger>
          <TabsTrigger value="glass">Glass</TabsTrigger>
          <TabsTrigger value="linear">Linear</TabsTrigger>
          <TabsTrigger value="radial">Radial</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="fluid">{renderGradientCards(fluidGradients)}</TabsContent>
        <TabsContent value="mesh">{renderGradientCards(meshGradients)}</TabsContent>
        <TabsContent value="glass">
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Glass gradients use fluid mesh backgrounds with blur and translucent overlays for a frosted glass effect.
            </p>
          </div>
          {renderGradientCards(glassmorphicGradients)}
        </TabsContent>
        <TabsContent value="linear">{renderGradientCards(linearGradients)}</TabsContent>
        <TabsContent value="radial">{renderGradientCards(radialGradients)}</TabsContent>
        <TabsContent value="special">{renderGradientCards(specialGradients)}</TabsContent>
      </Tabs>
    </div>
  )
})
