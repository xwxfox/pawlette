import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Scan, FloppyDisk, X, ArrowCounterClockwise, Sparkle, Check } from '@phosphor-icons/react'
import { GrainOverlay } from '@/components/GrainOverlay'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ExtractedColor } from '@/lib/types'

export interface CustomGradientConfig {
  id: string
  name: string
  gradient: string
  grainEnabled: boolean
  grainIntensity: number
  luminosity: number
  saturation: number
  hueShift: number
  contrast: number
  blurAmount: number
}

interface GradientEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialGradient?: CustomGradientConfig | null
  initialGradientString?: string
  onSave: (config: CustomGradientConfig) => void
  colors?: ExtractedColor[]
  luminosityAdjustment?: number
  saturation?: number
  hueShift?: number
}

const defaultConfig: Omit<CustomGradientConfig, 'id'> = {
  name: 'Custom Gradient',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  grainEnabled: true,
  grainIntensity: 0.08,
  luminosity: 0,
  saturation: 0,
  hueShift: 0,
  contrast: 0,
  blurAmount: 0,
}

export function GradientEditorModal({ 
  open, 
  onOpenChange, 
  initialGradient,
  initialGradientString,
  onSave,
  colors = [],
  luminosityAdjustment = 0,
  saturation = 0,
  hueShift = 0,
}: GradientEditorModalProps) {
  const [config, setConfig] = useState<Omit<CustomGradientConfig, 'id'>>(() => {
    if (initialGradient) return { ...initialGradient }
    if (initialGradientString) return { ...defaultConfig, gradient: initialGradientString, name: 'Custom Gradient' }
    return { ...defaultConfig }
  })

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (initialGradient) {
        setConfig({ ...initialGradient })
      } else if (initialGradientString) {
        setConfig({ ...defaultConfig, gradient: initialGradientString, name: 'Custom Gradient' })
      } else {
        setConfig({ ...defaultConfig })
      }
    }
  }, [open, initialGradient, initialGradientString])

  const adjustGradientColors = (gradient: string, lumAdjust: number, satAdjust: number, hueAdjust: number): string => {
    if (lumAdjust === 0 && satAdjust === 0 && hueAdjust === 0) return gradient
    
    const hexColorRegex = /#[0-9a-fA-F]{6}(?![0-9a-fA-F])|#[0-9a-fA-F]{3}(?![0-9a-fA-F])/g
    
    return gradient.replace(hexColorRegex, (match) => {
      let hex = match
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
      }
      return adjustColorHSL(hex, lumAdjust, satAdjust, hueAdjust)
    })
  }

  const updateConfig = <K extends keyof typeof config>(key: K, value: typeof config[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    const savedConfig: CustomGradientConfig = {
      id: initialGradient?.id || `gradient-${Date.now()}`,
      ...config,
      gradient: adjustedGradient,
    }
    onSave(savedConfig)
    onOpenChange(false)
  }

  const handleReset = () => {
    setConfig({ ...defaultConfig })
  }

  const gradientTypes = [
    { value: 'linear', label: 'Linear Gradient', template: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { value: 'radial', label: 'Radial Gradient', template: 'radial-gradient(circle at center, #667eea, #764ba2 60%, #f093fb)' },
    { value: 'conic', label: 'Conic Gradient', template: 'conic-gradient(from 180deg at 50% 50%, #667eea 0deg, #764ba2 180deg, #667eea 360deg)' },
    { value: 'mesh', label: 'Mesh Gradient', template: 'radial-gradient(ellipse 140% 100% at 20% 30%, #667eeadd, transparent 55%), radial-gradient(ellipse 130% 110% at 75% 35%, #764ba2cc, transparent 50%), radial-gradient(ellipse 120% 120% at 50% 75%, #f093fbdd, transparent 52%)' },
  ]

  const applyTemplate = (template: string) => {
    updateConfig('gradient', template)
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

  const vibrantColors = colors.filter(c => c.hsl.s > 30).slice(0, 6)
  const allColors = colors.slice(0, 6)

  const c1 = colors.length > 0 ? adjustColorHSL(vibrantColors[0]?.hex || allColors[0]?.hex || '#6366f1', luminosityAdjustment, saturation, hueShift) : '#6366f1'
  const c2 = colors.length > 0 ? adjustColorHSL(vibrantColors[1]?.hex || allColors[1]?.hex || '#8b5cf6', luminosityAdjustment, saturation, hueShift) : '#8b5cf6'
  const c3 = colors.length > 0 ? adjustColorHSL(vibrantColors[2]?.hex || allColors[2]?.hex || '#ec4899', luminosityAdjustment, saturation, hueShift) : '#ec4899'
  const c4 = colors.length > 0 ? adjustColorHSL(vibrantColors[3]?.hex || allColors[3]?.hex || '#f43f5e', luminosityAdjustment, saturation, hueShift) : '#f43f5e'
  const c5 = colors.length > 0 ? adjustColorHSL(vibrantColors[4]?.hex || allColors[4]?.hex || '#06b6d4', luminosityAdjustment, saturation, hueShift) : '#06b6d4'
  const c6 = colors.length > 0 ? adjustColorHSL(vibrantColors[5]?.hex || allColors[5]?.hex || '#10b981', luminosityAdjustment, saturation, hueShift) : '#10b981'

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

  const selectGradient = (gradient: string, name: string) => {
    setSelectedPreset(name)
    updateConfig('gradient', gradient)
    updateConfig('name', name)
  }

  const adjustedGradient = adjustGradientColors(
    config.gradient,
    config.luminosity,
    config.saturation,
    config.hueShift
  )

  const renderPresetGrid = (gradients: Array<{ name: string; gradient: string }>) => (
    <div className="grid grid-cols-4 gap-3 pb-2">
      {gradients.map((grad) => (
        <button
          key={grad.name}
          onClick={() => selectGradient(grad.gradient, grad.name)}
          className={cn(
            'group relative h-28 rounded-lg overflow-hidden border-2 transition-all',
            selectedPreset === grad.name 
              ? 'border-primary shadow-lg ring-2 ring-primary/20' 
              : 'border-border hover:border-primary/50 hover:shadow-md'
          )}
        >
          <div
            className="absolute inset-0"
            style={{ background: grad.gradient }}
          />
          {selectedPreset === grad.name && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
              <Check size={14} weight="bold" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
            <p className="text-xs font-medium text-white truncate">{grad.name}</p>
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col p-6 sm:max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle size={20} weight="duotone" className="text-accent" />
            Gradient Editor
          </DialogTitle>
          <DialogDescription>
            Start from a preset or customize your gradient with advanced controls and live preview
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 mt-4 flex-1 overflow-hidden min-h-0">
          <div className="space-y-4 overflow-y-auto pr-2 min-h-0">
            {colors.length > 0 && (
              <Card className="p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1.5">Start from Generated Gradients</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Select any gradient from your image's color palette to customize
                  </p>
                </div>

                <Tabs defaultValue="fluid" className="w-full">
                  <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="fluid">Fluid</TabsTrigger>
                    <TabsTrigger value="mesh">Mesh</TabsTrigger>
                    <TabsTrigger value="glass">Glass</TabsTrigger>
                    <TabsTrigger value="linear">Linear</TabsTrigger>
                    <TabsTrigger value="radial">Radial</TabsTrigger>
                    <TabsTrigger value="special">Special</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="h-[320px] mt-4">
                    <TabsContent value="fluid" className="mt-0 space-y-1">
                      {renderPresetGrid(fluidGradients)}
                    </TabsContent>
                    <TabsContent value="mesh" className="mt-0 space-y-1">
                      {renderPresetGrid(meshGradients)}
                    </TabsContent>
                    <TabsContent value="glass" className="mt-0 space-y-1">
                      {renderPresetGrid(glassmorphicGradients)}
                    </TabsContent>
                    <TabsContent value="linear" className="mt-0 space-y-1">
                      {renderPresetGrid(linearGradients)}
                    </TabsContent>
                    <TabsContent value="radial" className="mt-0 space-y-1">
                      {renderPresetGrid(radialGradients)}
                    </TabsContent>
                    <TabsContent value="special" className="mt-0 space-y-1">
                      {renderPresetGrid(specialGradients)}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </Card>
            )}

            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold">Gradient Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gradient-name" className="text-sm font-medium mb-2 block">
                    Gradient Name
                  </Label>
                  <Input
                    id="gradient-name"
                    value={config.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    placeholder="My Custom Gradient"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gradient-type" className="text-sm font-medium mb-2 block">
                    Quick Templates
                  </Label>
                  <Select onValueChange={(value) => {
                    const template = gradientTypes.find(t => t.value === value)?.template
                    if (template) applyTemplate(template)
                  }}>
                    <SelectTrigger id="gradient-type">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="gradient-css" className="text-sm font-medium mb-2 block">
                  CSS Gradient Code
                </Label>
                <textarea
                  id="gradient-css"
                  value={config.gradient}
                  onChange={(e) => updateConfig('gradient', e.target.value)}
                  className="w-full h-28 px-3 py-2 text-sm border rounded-md bg-background font-mono resize-none"
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Enter any valid CSS gradient. Adjustments (luminosity, saturation, hue) will be applied when saved.
                </p>
              </div>

              <div>
                <Label htmlFor="gradient-css-output" className="text-sm font-medium mb-2 block">
                  Final Output (with adjustments)
                </Label>
                <textarea
                  id="gradient-css-output"
                  value={adjustedGradient}
                  readOnly
                  className="w-full h-28 px-3 py-2 text-sm border rounded-md bg-muted font-mono resize-none cursor-default"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  This is the final gradient code with all adjustments applied. This will be saved.
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <Label className="text-sm font-medium mb-3 block">Live Preview</Label>
              <div className="relative h-80 rounded-lg overflow-hidden border shadow-lg">
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: adjustedGradient,
                    filter: `blur(${config.blurAmount}px) contrast(${100 + config.contrast}%)`,
                  }}
                />
                {config.grainEnabled && (
                  <GrainOverlay intensity={config.grainIntensity} />
                )}
                
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20">
                  Live Preview
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 min-h-0">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Effects & Adjustments
              </h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan size={16} weight="duotone" className="text-muted-foreground" />
                <Label htmlFor="modal-grain" className="text-sm cursor-pointer">
                  Grain Texture
                </Label>
              </div>
              <Switch
                id="modal-grain"
                checked={config.grainEnabled}
                onCheckedChange={(checked) => updateConfig('grainEnabled', checked)}
              />
            </div>

            {config.grainEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Grain Intensity</Label>
                  <span className="text-muted-foreground font-mono">{Math.round(config.grainIntensity * 100)}%</span>
                </div>
                <Slider
                  min={0.02}
                  max={0.2}
                  step={0.01}
                  value={[config.grainIntensity]}
                  onValueChange={(value) => updateConfig('grainIntensity', value[0])}
                />
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Luminosity</Label>
                  <span className="text-muted-foreground font-mono">
                    {config.luminosity > 0 ? '+' : ''}{config.luminosity}
                  </span>
                </div>
                <Slider
                  min={-50}
                  max={50}
                  step={5}
                  value={[config.luminosity]}
                  onValueChange={(value) => updateConfig('luminosity', value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Darker</span>
                  <span>Lighter</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Saturation</Label>
                  <span className="text-muted-foreground font-mono">
                    {config.saturation > 0 ? '+' : ''}{config.saturation}
                  </span>
                </div>
                <Slider
                  min={-50}
                  max={50}
                  step={5}
                  value={[config.saturation]}
                  onValueChange={(value) => updateConfig('saturation', value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Less</span>
                  <span>More</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Hue Shift</Label>
                  <span className="text-muted-foreground font-mono">{config.hueShift}°</span>
                </div>
                <Slider
                  min={-180}
                  max={180}
                  step={10}
                  value={[config.hueShift]}
                  onValueChange={(value) => updateConfig('hueShift', value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-180°</span>
                  <span>+180°</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Blur Amount</Label>
                  <span className="text-muted-foreground font-mono">{config.blurAmount}px</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[config.blurAmount]}
                  onValueChange={(value) => updateConfig('blurAmount', value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Contrast</Label>
                  <span className="text-muted-foreground font-mono">
                    {config.contrast > 0 ? '+' : ''}{config.contrast}%
                  </span>
                </div>
                <Slider
                  min={-50}
                  max={50}
                  step={5}
                  value={[config.contrast]}
                  onValueChange={(value) => updateConfig('contrast', value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-6">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <ArrowCounterClockwise size={16} />
            Reset
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
            >
              <FloppyDisk size={16} />
              Save Gradient
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
