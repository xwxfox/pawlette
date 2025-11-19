import { useState } from 'react'
import { Drop, Copy, Check, DownloadSimple } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ColorSwatch } from '@/components/ColorSwatch'
import type { ExtractedColor } from '@/lib/types'
import { toast } from 'sonner'

interface ColorsViewProps {
  colors: ExtractedColor[]
}

export function ColorsView({ colors }: ColorsViewProps) {
  const [copied, setCopied] = useState(false)

  const copyAllColors = async () => {
    const colorData = colors.map(c => 
      `${c.hex} - RGB(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}) - HSL(${Math.round(c.hsl.h)}, ${Math.round(c.hsl.s)}%, ${Math.round(c.hsl.l)}%) - ${c.percentage}%`
    ).join('\n')
    
    await navigator.clipboard.writeText(colorData)
    setCopied(true)
    toast.success('All colors copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const exportAsJSON = () => {
    const data = JSON.stringify({ colors, timestamp: Date.now() }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `colors-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Colors exported as JSON!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Drop size={24} weight="duotone" className="text-accent" />
          <h2 className="text-xl font-semibold">Extracted Colors</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyAllColors}>
            {copied ? (
              <>
                <Check size={16} weight="bold" className="mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} className="mr-2" />
                Copy All
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={exportAsJSON}>
            <DownloadSimple size={16} weight="bold" className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Color Distribution Bar
        </h3>
        <div className="flex h-24 rounded-lg overflow-hidden border shadow-sm">
          {colors.map((color, index) => (
            <div
              key={index}
              className="transition-all duration-300 hover:scale-y-105 cursor-pointer"
              style={{
                backgroundColor: color.hex,
                width: `${color.percentage}%`,
              }}
              title={`${color.hex} - ${color.percentage}%`}
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Individual Colors
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Use arrow keys to navigate, Enter/Space to select, 'C' to copy color
        </p>
        <div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          role="grid"
          aria-label="Color palette"
        >
          {colors.map((color, index) => (
            <ColorSwatch 
              key={index} 
              color={color} 
              showPercentage 
              size="md"
              tabIndex={index === 0 ? 0 : -1}
              autoFocus={index === 0}
              onKeyDown={(e) => {
                const cols = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2
                const row = Math.floor(index / cols)
                const col = index % cols
                let newIndex = index

                switch (e.key) {
                  case 'ArrowRight':
                    e.preventDefault()
                    newIndex = Math.min(index + 1, colors.length - 1)
                    break
                  case 'ArrowLeft':
                    e.preventDefault()
                    newIndex = Math.max(index - 1, 0)
                    break
                  case 'ArrowDown':
                    e.preventDefault()
                    newIndex = Math.min(index + cols, colors.length - 1)
                    break
                  case 'ArrowUp':
                    e.preventDefault()
                    newIndex = Math.max(index - cols, 0)
                    break
                  case 'Home':
                    e.preventDefault()
                    newIndex = 0
                    break
                  case 'End':
                    e.preventDefault()
                    newIndex = colors.length - 1
                    break
                }

                if (newIndex !== index) {
                  const swatches = document.querySelectorAll('[role="grid"] > *')
                  const targetSwatch = swatches[newIndex] as HTMLElement
                  targetSwatch?.focus()
                }
              }}
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Color Harmony
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Analogous Colors</h4>
            <div className="flex h-20 rounded-lg overflow-hidden border">
              {colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Complementary Colors</h4>
            <div className="flex h-20 rounded-lg overflow-hidden border">
              {colors.slice(0, 2).map((color, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Gradient Previews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Linear Gradient</p>
            <div
              className="h-24 rounded-lg border"
              style={{
                background: `linear-gradient(135deg, ${colors.map(c => c.hex).join(', ')})`
              }}
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Radial Gradient</p>
            <div
              className="h-24 rounded-lg border"
              style={{
                background: `radial-gradient(circle at center, ${colors.map(c => c.hex).join(', ')})`
              }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Mesh Gradient</p>
            <div className="relative h-24 rounded-lg border bg-black overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: colors.length >= 3
                    ? `radial-gradient(ellipse 110% 100% at 20% 30%, ${colors[0].hex}ee, transparent 50%), 
                       radial-gradient(ellipse 100% 110% at 75% 25%, ${colors[1].hex}ee, transparent 50%), 
                       radial-gradient(ellipse 120% 100% at 60% 70%, ${colors[2].hex}dd, transparent 52%)`
                    : `radial-gradient(ellipse 120% 120% at 30% 30%, ${colors[0].hex}ee, transparent 60%)`,
                  filter: 'blur(40px)',
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Conic Gradient</p>
            <div
              className="h-24 rounded-lg border"
              style={{
                background: `conic-gradient(from 0deg, ${colors.map(c => c.hex).join(', ')}, ${colors[0].hex})`
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
