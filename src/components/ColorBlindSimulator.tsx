import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ColorBlindSimulatorProps {
  children: React.ReactNode
  className?: string
  // Controlled mode
  filterType?: ColorBlindType
  onFilterTypeChange?: (type: ColorBlindType) => void
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
  // Show/hide controls
  showControls?: boolean
}

export type ColorBlindType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly'

const COLOR_BLIND_FILTERS: Record<ColorBlindType, string> = {
  none: 'none',
  // Complete color blindness
  protanopia: `
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="protanopia"><feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#protanopia')
  `,
  deuteranopia: `
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#deuteranopia')
  `,
  tritanopia: `
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="tritanopia"><feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#tritanopia')
  `,
  achromatopsia: `
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="achromatopsia"><feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#achromatopsia')
  `,
  // Partial color blindness (anomalous trichromacy)
  protanomaly: `
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="protanomaly"><feColorMatrix type="matrix" values="0.817, 0.183, 0, 0, 0 0.333, 0.667, 0, 0, 0 0, 0.125, 0.875, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#protanomaly')
  `,
  deuteranomaly: `
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="deuteranomaly"><feColorMatrix type="matrix" values="0.8, 0.2, 0, 0, 0 0.258, 0.742, 0, 0, 0 0, 0.142, 0.858, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#deuteranomaly')
  `,
  tritanomaly: `
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="tritanomaly"><feColorMatrix type="matrix" values="0.967, 0.033, 0, 0, 0 0, 0.733, 0.267, 0, 0 0, 0.183, 0.817, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#tritanomaly')
  `,
}

const COLOR_BLIND_INFO: Record<ColorBlindType, { name: string; description: string; prevalence: string }> = {
  none: {
    name: 'Normal Vision',
    description: 'No color vision deficiency',
    prevalence: '~99% of population',
  },
  protanopia: {
    name: 'Protanopia (Red-Blind)',
    description: 'Complete inability to perceive red light. Red appears dark gray or black.',
    prevalence: '~1% of males',
  },
  deuteranopia: {
    name: 'Deuteranopia (Green-Blind)',
    description: 'Complete inability to perceive green light. Most common form of color blindness.',
    prevalence: '~1% of males',
  },
  tritanopia: {
    name: 'Tritanopia (Blue-Blind)',
    description: 'Complete inability to perceive blue light. Very rare.',
    prevalence: '~0.001% of population',
  },
  achromatopsia: {
    name: 'Achromatopsia (Complete Color Blindness)',
    description: 'Complete inability to see colors, only shades of gray.',
    prevalence: '~0.003% of population',
  },
  protanomaly: {
    name: 'Protanomaly (Red-Weak)',
    description: 'Reduced sensitivity to red light. Milder form of protanopia.',
    prevalence: '~1% of males',
  },
  deuteranomaly: {
    name: 'Deuteranomaly (Green-Weak)',
    description: 'Reduced sensitivity to green light. Most common color vision deficiency.',
    prevalence: '~5% of males, 0.4% of females',
  },
  tritanomaly: {
    name: 'Tritanomaly (Blue-Weak)',
    description: 'Reduced sensitivity to blue light. Very rare.',
    prevalence: '<0.01% of population',
  },
}

export function ColorBlindSimulator({ 
  children, 
  className,
  filterType: controlledFilterType,
  onFilterTypeChange,
  enabled: controlledEnabled,
  onEnabledChange,
  showControls = true,
}: ColorBlindSimulatorProps) {
  const [internalFilterType, setInternalFilterType] = useState<ColorBlindType>('none')
  const [intensity, setIntensity] = useState(100)
  const [internalEnabled, setInternalEnabled] = useState(false)

  // Use controlled or internal state
  const filterType = controlledFilterType !== undefined ? controlledFilterType : internalFilterType
  const enabled = controlledEnabled !== undefined ? controlledEnabled : internalEnabled

  const handleFilterTypeChange = (type: ColorBlindType) => {
    if (onFilterTypeChange) {
      onFilterTypeChange(type)
    } else {
      setInternalFilterType(type)
    }
  }

  const handleEnabledChange = (value: boolean) => {
    if (onEnabledChange) {
      onEnabledChange(value)
    } else {
      setInternalEnabled(value)
    }
  }

  const filterStyle = enabled && filterType !== 'none' 
    ? {
        filter: COLOR_BLIND_FILTERS[filterType],
        opacity: intensity / 100,
      }
    : {}

  const info = COLOR_BLIND_INFO[filterType]

  return (
    <div className="space-y-4">
      {showControls && (
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Color Blind Simulation</h3>
              <p className="text-sm text-muted-foreground">
                Preview how your colors appear to people with color vision deficiencies
              </p>
            </div>
            <Button
              variant={enabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleEnabledChange(!enabled)}
            >
              {enabled ? <Eye size={16} weight="fill" /> : <EyeSlash size={16} />}
              <span className="ml-2">{enabled ? 'Enabled' : 'Disabled'}</span>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Color Vision Deficiency Type</Label>
              <Select
                value={filterType}
                onValueChange={(value) => handleFilterTypeChange(value as ColorBlindType)}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Filter Intensity: {intensity}%</Label>
              <Slider
                value={[intensity]}
                onValueChange={([value]) => setIntensity(value)}
                min={0}
                max={100}
                step={5}
                disabled={!enabled || filterType === 'none'}
              />
            </div>
          </div>

          {filterType !== 'none' && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">{info.name}</p>
                  <p className="text-sm">{info.description}</p>
                  <p className="text-xs text-muted-foreground">Prevalence: {info.prevalence}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
      )}

      <div className={className} style={filterStyle}>
        {children}
      </div>
    </div>
  )
}

// Hook for applying filter to specific elements
export function useColorBlindFilter(type: ColorBlindType = 'none', enabled = false) {
  if (!enabled || type === 'none') {
    return {}
  }

  return {
    style: {
      filter: COLOR_BLIND_FILTERS[type],
    },
  }
}
