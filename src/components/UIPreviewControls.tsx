import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scan, Eye, EyeSlash, CaretDown } from '@phosphor-icons/react'
import { GradientPicker } from '@/components/GradientPicker'
import { PreviewSelector, type PreviewMode } from '@/components/PreviewSelector'
import type { ThemeConfig } from '@/lib/themeConfig'
import type { CustomGradientConfig } from '@/components/GradientEditorModal'
import type { ExtractedColor } from '@/lib/types'
import type { ColorBlindType } from '@/components/ColorBlindSimulator'

interface UIPreviewControlsProps {
  config: ThemeConfig
  onConfigChange: (config: ThemeConfig) => void
  backgroundStyle: 'solid' | 'gradient' | 'mesh' | 'fluid' | 'glass' | 'custom'
  onBackgroundStyleChange: (style: 'solid' | 'gradient' | 'mesh' | 'fluid' | 'glass' | 'custom') => void
  previewMode: PreviewMode
  onPreviewModeChange: (mode: PreviewMode) => void
  luminosity: number
  onLuminosityChange: (value: number) => void
  selectedGradient?: string | null
  onGradientSelect?: (gradient: string) => void
  customGradients?: CustomGradientConfig[]
  onOpenGradientEditor?: (gradient?: CustomGradientConfig) => void
  colors: ExtractedColor[]
  // Color blind simulation
  colorBlindFilterType?: ColorBlindType
  onColorBlindFilterTypeChange?: (type: ColorBlindType) => void
  colorBlindFilterEnabled?: boolean
  onColorBlindFilterEnabledChange?: (enabled: boolean) => void
}

export function UIPreviewControls({
  config,
  onConfigChange,
  backgroundStyle,
  onBackgroundStyleChange,
  previewMode,
  onPreviewModeChange,
  luminosity,
  onLuminosityChange,
  selectedGradient,
  onGradientSelect,
  customGradients = [],
  onOpenGradientEditor,
  colors,
  colorBlindFilterType = 'none',
  onColorBlindFilterTypeChange,
  colorBlindFilterEnabled = false,
  onColorBlindFilterEnabledChange,
}: UIPreviewControlsProps) {
  const [expandedGradients, setExpandedGradients] = useState<Record<'button' | 'card', boolean>>({
    button: false,
    card: false,
  })

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const handleGradientSelect = (gradient: string) => {
    onGradientSelect?.(gradient)
    onBackgroundStyleChange('custom')
  }

  const toggleGradientSection = (section: 'button' | 'card') => {
    setExpandedGradients((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Appearance
          </h3>
          {onColorBlindFilterTypeChange && onColorBlindFilterEnabledChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={colorBlindFilterEnabled ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  {colorBlindFilterEnabled ? <Eye size={14} weight="fill" /> : <EyeSlash size={14} />}
                  <span className="ml-1.5">A11y</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Color Blind Simulation</h4>
                    <p className="text-xs text-muted-foreground">
                      Preview how your design appears to people with color vision deficiencies
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Enable Filter</Label>
                    <Switch
                      checked={colorBlindFilterEnabled}
                      onCheckedChange={onColorBlindFilterEnabledChange}
                    />
                  </div>

                  {colorBlindFilterEnabled && (
                    <div className="space-y-2">
                      <Label className="text-xs">Filter Type</Label>
                      <Select
                        value={colorBlindFilterType}
                        onValueChange={(value) => onColorBlindFilterTypeChange(value as ColorBlindType)}
                      >
                        <SelectTrigger className="text-sm h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Normal Vision</SelectItem>
                          <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                          <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                          <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                          <SelectItem value="achromatopsia">Achromatopsia (Grayscale)</SelectItem>
                          <SelectItem value="protanomaly">Protanomaly (Red-Weak)</SelectItem>
                          <SelectItem value="deuteranomaly">Deuteranomaly (Green-Weak)</SelectItem>
                          <SelectItem value="tritanomaly">Tritanomaly (Blue-Weak)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {colorBlindFilterType !== 'none' && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            {colorBlindFilterType === 'protanopia' && '~1% of males. Cannot perceive red light.'}
                            {colorBlindFilterType === 'deuteranopia' && '~1% of males. Cannot perceive green light.'}
                            {colorBlindFilterType === 'tritanopia' && '~0.001%. Cannot perceive blue light.'}
                            {colorBlindFilterType === 'achromatopsia' && '~0.003%. Complete color blindness.'}
                            {colorBlindFilterType === 'protanomaly' && '~1% of males. Reduced red sensitivity.'}
                            {colorBlindFilterType === 'deuteranomaly' && '~5% of males. Most common deficiency.'}
                            {colorBlindFilterType === 'tritanomaly' && '<0.01%. Reduced blue sensitivity.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Background Gradient</Label>
            <GradientPicker
              colors={colors}
              luminosity={luminosity}
              selectedGradient={selectedGradient}
              onGradientSelect={handleGradientSelect}
              customGradients={customGradients}
              onOpenGradientEditor={onOpenGradientEditor}
              compact
              showSolidColors
            />
          </div>

          <PreviewSelector 
            value={previewMode} 
            onChange={onPreviewModeChange} 
          />

          <div className="space-y-2">
            <Label className="text-xs">Shadows</Label>
            <Select value={config.shadows} onValueChange={(value) => updateConfig({ shadows: value as ThemeConfig['shadows'] })}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Border Radius</Label>
            <Select value={config.radius} onValueChange={(value) => updateConfig({ radius: value as ThemeConfig['radius'] })}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Gradient Controls
        </h3>
        <div className="space-y-4">
          {([
            {
              key: 'button' as const,
              label: 'Button Gradient',
              selectedGradient: config.buttonCustomGradient,
              onSelect: (gradient: string) => updateConfig({ buttonCustomGradient: gradient, buttonGradient: 'custom' }),
            },
            {
              key: 'card' as const,
              label: 'Card Gradient',
              selectedGradient: config.cardCustomGradient,
              onSelect: (gradient: string) => updateConfig({ cardCustomGradient: gradient, cardGradient: 'custom' }),
            },
          ]).map((section) => {
            const isOpen = expandedGradients[section.key]
            return (
              <div key={section.key} className="rounded-lg border border-border/50 bg-muted/5">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                  onClick={() => toggleGradientSection(section.key)}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {section.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {section.selectedGradient ? 'Custom gradient active' : 'No gradient selected'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {section.selectedGradient && (
                      <span
                        className="h-6 w-14 rounded-md border border-border/60"
                        style={{ background: section.selectedGradient }}
                      />
                    )}
                    <CaretDown
                      size={16}
                      className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-border/40 p-3">
                    <GradientPicker
                      colors={colors}
                      luminosity={luminosity}
                      selectedGradient={section.selectedGradient}
                      onGradientSelect={section.onSelect}
                      customGradients={customGradients}
                      onOpenGradientEditor={onOpenGradientEditor}
                      compact
                      showSolidColors
                      onClear={() => {
                        if (section.key === 'button') {
                          updateConfig({ buttonCustomGradient: null, buttonGradient: 'none' })
                        } else {
                          updateConfig({ cardCustomGradient: null, cardGradient: 'none' })
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}

          <div className="space-y-2">
            <Label className="text-xs">Borders</Label>
            <Select value={config.borders} onValueChange={(value) => updateConfig({ borders: value as ThemeConfig['borders'] })}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="thin">Thin</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="thick">Thick</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Effects
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="glassmorphism" className="text-xs cursor-pointer">
              Glassmorphism
            </Label>
            <Switch
              id="glassmorphism"
              checked={config.useGlass}
              onCheckedChange={(checked) => updateConfig({ useGlass: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan size={14} weight="duotone" className="text-muted-foreground" />
              <Label htmlFor="grain" className="text-xs cursor-pointer">
                Grain Texture
              </Label>
            </div>
            <Switch
              id="grain"
              checked={config.grainEnabled}
              onCheckedChange={(checked) => updateConfig({ grainEnabled: checked })}
            />
          </div>

          {config.grainEnabled && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <Label>Grain Intensity</Label>
                <span className="text-muted-foreground">{Math.round(config.grainIntensity * 100)}%</span>
              </div>
              <Slider
                min={0.02}
                max={0.2}
                step={0.01}
                value={[config.grainIntensity]}
                onValueChange={(value) => updateConfig({ grainIntensity: value[0] })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="adapt-gradients" className="text-xs cursor-pointer">
              Adapt Gradients for Light Mode
            </Label>
            <Switch
              id="adapt-gradients"
              checked={config.adaptGradientsForLightMode}
              onCheckedChange={(checked) => updateConfig({ adaptGradientsForLightMode: checked })}
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <Label>Luminosity</Label>
              <span className="text-muted-foreground">
                {luminosity > 0 ? '+' : ''}{luminosity}
              </span>
            </div>
            <Slider
              min={-50}
              max={50}
              step={5}
              value={[luminosity]}
              onValueChange={(value) => onLuminosityChange(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Darker</span>
              <span>Lighter</span>
            </div>
          </div>
        </div>
      </div>
      <Separator />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Typography
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Text Contrast</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {config.textContrast > 0 ? '+' : ''}{config.textContrast}%
                </span>
              </div>
              <Slider
                min={-30}
                max={30}
                step={5}
                value={[config.textContrast]}
                onValueChange={(value) => updateConfig({ textContrast: value[0] })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Lighter</span>
                <span>Darker</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Font Size</Label>
            <Select value={config.fontSize} onValueChange={(value) => updateConfig({ fontSize: value as ThemeConfig['fontSize'] })}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Heading Weight</Label>
            <Select value={config.headingWeight} onValueChange={(value) => updateConfig({ headingWeight: value as ThemeConfig['headingWeight'] })}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="semibold">Semibold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="extrabold">Extra Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Letter Spacing</Label>
            <Select value={config.letterSpacing} onValueChange={(value) => updateConfig({ letterSpacing: value as ThemeConfig['letterSpacing'] })}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Tight</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Line Height</Label>
            <Select value={config.lineHeight} onValueChange={(value) => updateConfig({ lineHeight: value as ThemeConfig['lineHeight'] })}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Tight</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Relaxed</SelectItem>
                <SelectItem value="loose">Loose</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Layout
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Spacing</Label>
            <Select value={config.spacing} onValueChange={(value) => updateConfig({ spacing: value as ThemeConfig['spacing'] })}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
