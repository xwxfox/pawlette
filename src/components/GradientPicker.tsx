import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Plus, PencilSimple, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { ExtractedColor } from '@/lib/types'
import type { CustomGradientConfig } from '@/components/GradientEditorModal'

interface GradientPickerProps {
  colors: ExtractedColor[]
  luminosity?: number
  saturation?: number
  hueShift?: number
  selectedGradient?: string | null
  onGradientSelect?: (gradient: string) => void
  customGradients?: CustomGradientConfig[]
  onOpenGradientEditor?: (gradient?: CustomGradientConfig) => void
  showCustomOnly?: boolean
  compact?: boolean
  showSolidColors?: boolean
  onClear?: () => void
  clearLabel?: string
}

export function GradientPicker({
  colors,
  luminosity = 0,
  saturation = 0,
  hueShift = 0,
  selectedGradient,
  onGradientSelect,
  customGradients = [],
  onOpenGradientEditor,
  showCustomOnly = false,
  compact = false,
  showSolidColors = false,
  onClear,
  clearLabel = 'Reset',
}: GradientPickerProps) {
  const [activeTab, setActiveTab] = useState('fluid')

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

  const vibrantColors = colors.filter(c => c.hsl.s > 30).slice(0, 6)
  const allColors = colors.slice(0, 6)

  const c1 = colors.length > 0 ? adjustColorHSL(vibrantColors[0]?.hex || allColors[0]?.hex || '#6366f1', luminosity, saturation, hueShift) : '#6366f1'
  const c2 = colors.length > 0 ? adjustColorHSL(vibrantColors[1]?.hex || allColors[1]?.hex || '#8b5cf6', luminosity, saturation, hueShift) : '#8b5cf6'
  const c3 = colors.length > 0 ? adjustColorHSL(vibrantColors[2]?.hex || allColors[2]?.hex || '#ec4899', luminosity, saturation, hueShift) : '#ec4899'
  const c4 = colors.length > 0 ? adjustColorHSL(vibrantColors[3]?.hex || allColors[3]?.hex || '#f43f5e', luminosity, saturation, hueShift) : '#f43f5e'
  const c5 = colors.length > 0 ? adjustColorHSL(vibrantColors[4]?.hex || allColors[4]?.hex || '#06b6d4', luminosity, saturation, hueShift) : '#06b6d4'
  const c6 = colors.length > 0 ? adjustColorHSL(vibrantColors[5]?.hex || allColors[5]?.hex || '#10b981', luminosity, saturation, hueShift) : '#10b981'

  const linearGradients = [
    { name: 'Smooth Diagonal', gradient: `linear-gradient(135deg, ${c1}, ${c2})` },
    { name: 'Vertical Flow', gradient: `linear-gradient(180deg, ${c1}, ${c2})` },
    { name: 'Tri-Color Blend', gradient: `linear-gradient(135deg, ${c1}, ${c2} 50%, ${c3})` },
    { name: 'Spectrum Flow', gradient: `linear-gradient(135deg, ${c1} 0%, ${c2} 25%, ${c3} 50%, ${c4} 75%, ${c5} 100%)` },
  ]

  const radialGradients = [
    { name: 'Radial Bloom', gradient: `radial-gradient(circle at center, ${c1}, ${c2} 60%, ${c3})` },
    { name: 'Offset Radial', gradient: `radial-gradient(circle at 30% 30%, ${c1}, ${c2} 50%, ${c3})` },
    { name: 'Elliptical Spread', gradient: `radial-gradient(ellipse 150% 100% at top, ${c1}, ${c2} 50%, ${c3})` },
    { name: 'Multi-Point Radial', gradient: `radial-gradient(circle at 20% 50%, ${c1}cc, transparent 40%), radial-gradient(circle at 80% 50%, ${c2}cc, transparent 40%), radial-gradient(circle at 50% 50%, ${c3}99, transparent 50%)` },
  ]

  const fluidGradients = [
    { name: 'Liquid Silk', gradient: `radial-gradient(ellipse 120% 80% at 20% 30%, ${c1}ee, transparent 50%), radial-gradient(ellipse 100% 90% at 70% 20%, ${c2}ee, transparent 50%), radial-gradient(ellipse 130% 100% at 50% 80%, ${c3}dd, transparent 55%), radial-gradient(ellipse at 80% 70%, ${c4}bb, transparent 45%)` },
    { name: 'Fluid Morph', gradient: `radial-gradient(ellipse 140% 110% at 15% 25%, ${c1}, transparent 55%), radial-gradient(ellipse 120% 100% at 75% 30%, ${c2}ee, transparent 50%), radial-gradient(ellipse 110% 120% at 60% 75%, ${c3}ee, transparent 52%), radial-gradient(ellipse 130% 90% at 30% 80%, ${c4}dd, transparent 50%)` },
    { name: 'Liquid Glass', gradient: `radial-gradient(ellipse 150% 100% at 25% 20%, ${c1}dd, transparent 60%), radial-gradient(ellipse 130% 120% at 70% 35%, ${c2}cc, transparent 55%), radial-gradient(ellipse 120% 110% at 45% 70%, ${c3}dd, transparent 58%), radial-gradient(ellipse 140% 100% at 75% 80%, ${c4}bb, transparent 52%)` },
    { name: 'Velvet Wave', gradient: `radial-gradient(ellipse 160% 100% at 30% 10%, ${c1}ee, transparent 50%), radial-gradient(ellipse 140% 120% at 80% 40%, ${c2}dd, transparent 52%), radial-gradient(ellipse 150% 110% at 25% 65%, ${c3}ee, transparent 55%), radial-gradient(ellipse 130% 100% at 70% 85%, ${c4}cc, transparent 50%)` },
  ]

  const meshGradients = [
    { name: 'Soft Mesh', gradient: `radial-gradient(ellipse 120% 100% at 18% 28%, ${c1}ee, transparent 50%), radial-gradient(ellipse 110% 110% at 72% 22%, ${c2}ee, transparent 48%), radial-gradient(ellipse 130% 100% at 65% 78%, ${c3}dd, transparent 52%), radial-gradient(ellipse 115% 120% at 28% 82%, ${c4}ee, transparent 50%), radial-gradient(ellipse 100% 100% at 50% 50%, ${c5}99, transparent 55%)` },
    { name: 'Aurora Mesh', gradient: `radial-gradient(ellipse 160% 110% at 22% 18%, ${c1}dd, transparent 58%), radial-gradient(ellipse 140% 100% at 78% 30%, ${c2}cc, transparent 52%), radial-gradient(ellipse 150% 120% at 48% 68%, ${c3}dd, transparent 56%), radial-gradient(ellipse 130% 110% at 72% 85%, ${c4}bb, transparent 50%), radial-gradient(ellipse 110% 100% at 35% 55%, ${c5}aa, transparent 52%)` },
    { name: 'Organic Blend', gradient: `radial-gradient(ellipse 135% 105% at 12% 22%, ${c1}ee, transparent 52%), radial-gradient(ellipse 125% 115% at 82% 18%, ${c2}dd, transparent 50%), radial-gradient(ellipse 140% 110% at 68% 72%, ${c3}ee, transparent 54%), radial-gradient(ellipse 120% 105% at 25% 78%, ${c4}dd, transparent 48%), radial-gradient(ellipse 115% 120% at 55% 45%, ${c6}88, transparent 55%)` },
    { name: 'Diffused Light', gradient: `radial-gradient(ellipse 170% 120% at 28% 25%, ${c1}cc, transparent 60%), radial-gradient(ellipse 150% 110% at 75% 32%, ${c2}bb, transparent 55%), radial-gradient(ellipse 140% 130% at 42% 75%, ${c3}cc, transparent 58%), radial-gradient(ellipse 160% 100% at 80% 78%, ${c4}aa, transparent 52%)` },
  ]

  const glassmorphicGradients = [
    { name: 'Frosted Flow', gradient: `radial-gradient(ellipse 140% 100% at 25% 30%, ${c1}dd, transparent 55%), radial-gradient(ellipse 130% 110% at 75% 35%, ${c2}cc, transparent 50%), radial-gradient(ellipse 120% 120% at 50% 75%, ${c3}dd, transparent 52%)` },
    { name: 'Liquid Glass', gradient: `radial-gradient(ellipse 150% 110% at 20% 25%, ${c1}bb, transparent 58%), radial-gradient(ellipse 140% 100% at 78% 30%, ${c2}aa, transparent 52%), radial-gradient(ellipse 130% 120% at 45% 70%, ${c3}bb, transparent 55%)` },
    { name: 'Soft Frost', gradient: `radial-gradient(ellipse 160% 100% at 30% 20%, ${c1}99, transparent 60%), radial-gradient(ellipse 140% 110% at 70% 40%, ${c2}88, transparent 55%), radial-gradient(ellipse 150% 100% at 50% 75%, ${c3}99, transparent 58%)` },
  ]

  const specialGradients = [
    { name: 'Iridescent Flow', gradient: `linear-gradient(125deg, ${c1} 0%, ${c2} 18%, ${c3} 35%, ${c4} 50%, ${c3} 65%, ${c2} 82%, ${c1} 100%)` },
    { name: 'Prism Refraction', gradient: `radial-gradient(ellipse 110% 100% at 48% 50%, ${c1}aa, transparent 65%), radial-gradient(ellipse 110% 100% at 50% 50%, ${c2}aa, transparent 65%), radial-gradient(ellipse 110% 100% at 52% 50%, ${c3}aa, transparent 65%)` },
    { name: 'Holographic Shift', gradient: `linear-gradient(140deg, ${c1}cc 0%, ${c2}ee 22%, ${c3}cc 44%, ${c4}ee 66%, ${c5}cc 88%, ${c1}ee 100%)` },
    { name: 'Plasma Wave', gradient: `radial-gradient(ellipse 140% 100% at 35% 30%, ${c1}dd, transparent 55%), radial-gradient(ellipse 130% 110% at 68% 38%, ${c2}cc, transparent 50%), radial-gradient(ellipse 150% 100% at 45% 72%, ${c3}dd, transparent 52%), radial-gradient(ellipse 120% 120% at 75% 78%, ${c4}bb, transparent 48%)` },
  ]

  const renderPresetGrid = (gradients: Array<{ name: string; gradient: string }>) => (
    <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-4")}>
      {gradients.map((grad) => (
        <button
          key={grad.name}
          onClick={() => onGradientSelect?.(grad.gradient)}
          className={cn(
            'group relative rounded-md overflow-hidden border-2 transition-all',
            compact ? "h-16" : "h-20",
            selectedGradient === grad.gradient
              ? 'border-primary shadow-lg ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50 hover:shadow-md'
          )}
        >
          <div
            className="absolute inset-0"
            style={{ background: grad.gradient }}
          />
          {selectedGradient === grad.gradient && (
            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
              <Check size={12} weight="bold" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-1.5">
            <p className={cn("font-medium text-white truncate", compact ? "text-[10px]" : "text-xs")}>{grad.name}</p>
          </div>
        </button>
      ))}
    </div>
  )

  if (showCustomOnly) {
    return (
      <div className="space-y-3">
        {onClear && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={onClear}
            >
              {clearLabel}
            </Button>
          </div>
        )}
        {customGradients.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Custom Gradients</Label>
              {onOpenGradientEditor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenGradientEditor()}
                  className="h-6 px-2 text-xs gap-1"
                >
                  <Plus size={12} />
                  New
                </Button>
              )}
            </div>
            <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-3")}>
              {customGradients.map((grad) => (
                <div key={grad.id} className="relative group">
                  <button
                    onClick={() => onGradientSelect?.(grad.gradient)}
                    className={cn(
                      'w-full rounded-md overflow-hidden border-2 transition-all relative',
                      compact ? "h-16" : "h-20",
                      selectedGradient === grad.gradient
                        ? 'border-primary shadow-lg ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:shadow-md'
                    )}
                    style={{ background: grad.gradient }}
                  >
                    {selectedGradient === grad.gradient && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                        <Check size={12} weight="bold" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-1.5">
                      <p className={cn("font-medium text-white truncate", compact ? "text-[10px]" : "text-xs")}>{grad.name}</p>
                    </div>
                  </button>
                  {onOpenGradientEditor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenGradientEditor(grad)
                      }}
                      className="absolute top-1 left-1 p-1 bg-white/90 hover:bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PencilSimple size={10} className="text-gray-700" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!customGradients.length && onOpenGradientEditor && (
          <Button
            variant="outline"
            onClick={() => onOpenGradientEditor()}
            className="w-full gap-2 h-9 text-sm"
          >
            <Plus size={14} />
            Create Custom Gradient
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="p-4 space-y-3">
      {onClear && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={onClear}
          >
            {clearLabel}
          </Button>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-3">
          <TabsTrigger value="fluid" className="text-xs">Fluid</TabsTrigger>
          <TabsTrigger value="mesh" className="text-xs">Mesh</TabsTrigger>
          <TabsTrigger value="glass" className="text-xs">Glass</TabsTrigger>
          <TabsTrigger value="linear" className="text-xs">Linear</TabsTrigger>
          <TabsTrigger value="radial" className="text-xs">Radial</TabsTrigger>
          <TabsTrigger value="special" className="text-xs">Special</TabsTrigger>
        </TabsList>

        <ScrollArea className={compact ? "h-[200px]" : "h-[280px]"}>
          <TabsContent value="fluid" className="mt-0">
            {renderPresetGrid(fluidGradients)}
          </TabsContent>
          <TabsContent value="mesh" className="mt-0">
            {renderPresetGrid(meshGradients)}
          </TabsContent>
          <TabsContent value="glass" className="mt-0">
            {renderPresetGrid(glassmorphicGradients)}
          </TabsContent>
          <TabsContent value="linear" className="mt-0">
            {renderPresetGrid(linearGradients)}
          </TabsContent>
          <TabsContent value="radial" className="mt-0">
            {renderPresetGrid(radialGradients)}
          </TabsContent>
          <TabsContent value="special" className="mt-0">
            {renderPresetGrid(specialGradients)}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {showSolidColors && colors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Solid Colors</Label>
          <div className={cn("grid gap-2", compact ? "grid-cols-4" : "grid-cols-6")}>  
            {colors.slice(0, compact ? 6 : 8).map((color, index) => (
              <button
                key={`${color.hex}-${index}`}
                onClick={() => onGradientSelect?.(color.hex)}
                className={cn(
                  'rounded-md border-2 h-12 transition-all relative',
                  selectedGradient === color.hex
                    ? 'border-primary shadow-lg ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                )}
                style={{ background: color.hex }}
              >
                {selectedGradient === color.hex && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
                    <Check size={10} weight="bold" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {customGradients.length > 0 && (
        <>
          <div className="my-3 border-t" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Your Custom Gradients</Label>
              {onOpenGradientEditor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenGradientEditor()}
                  className="h-6 px-2 text-xs gap-1"
                >
                  <Plus size={12} />
                  New
                </Button>
              )}
            </div>
            <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-4")}>
              {customGradients.map((grad) => (
                <div key={grad.id} className="relative group">
                  <button
                    onClick={() => onGradientSelect?.(grad.gradient)}
                    className={cn(
                      'w-full rounded-md overflow-hidden border-2 transition-all relative',
                      compact ? "h-16" : "h-20",
                      selectedGradient === grad.gradient
                        ? 'border-primary shadow-lg ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:shadow-md'
                    )}
                    style={{ background: grad.gradient }}
                  >
                    {selectedGradient === grad.gradient && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                        <Check size={12} weight="bold" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-1.5">
                      <p className={cn("font-medium text-white truncate", compact ? "text-[10px]" : "text-xs")}>{grad.name}</p>
                    </div>
                  </button>
                  {onOpenGradientEditor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenGradientEditor(grad)
                      }}
                      className="absolute top-1 left-1 p-1 bg-white/90 hover:bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PencilSimple size={10} className="text-gray-700" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!customGradients.length && onOpenGradientEditor && (
        <>
          <div className="my-3 border-t" />
          <Button
            variant="outline"
            onClick={() => onOpenGradientEditor()}
            className="w-full gap-2 h-8 text-xs"
          >
            <Plus size={12} />
            Create Custom Gradient
          </Button>
        </>
      )}
    </Card>
  )
}
