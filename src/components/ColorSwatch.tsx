import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { ExtractedColor } from '@/lib/types'
import { isColorLight } from '@/lib/colorUtils'

interface ColorSwatchProps {
  color: ExtractedColor
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  onFocus?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  tabIndex?: number
  autoFocus?: boolean
}

export function ColorSwatch({ 
  color, 
  showPercentage = false, 
  size = 'md', 
  onClick,
  onFocus,
  onKeyDown,
  tabIndex = 0,
  autoFocus = false,
}: ColorSwatchProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoFocus && cardRef.current) {
      cardRef.current.focus()
    }
  }, [autoFocus])

  const copyToClipboard = async (text: string, format: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedFormat(format)
    toast.success(`${format} copied to clipboard`)
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
      // Quick copy hex on 'c' key
      e.preventDefault()
      copyToClipboard(color.hex, 'HEX')
    }
    onKeyDown?.(e)
  }

  const sizeClasses = {
    sm: 'h-16',
    md: 'h-32',
    lg: 'h-48',
  }

  const isLight = isColorLight(color.rgb)

  return (
    <Card 
      ref={cardRef}
      className="overflow-hidden group hover:shadow-lg transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary focus:outline-none"
      tabIndex={tabIndex}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`${sizeClasses[size]} relative cursor-pointer flex items-center justify-center`}
        style={{ backgroundColor: color.hex }}
        onClick={onClick}
      >
        {showPercentage && (
          <span
            className={`text-2xl font-bold ${
              isLight ? 'text-gray-800' : 'text-white'
            } drop-shadow-lg`}
          >
            {color.percentage}%
          </span>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono font-semibold">{color.hex}</code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => copyToClipboard(color.hex, 'HEX')}
          >
            {copiedFormat === 'HEX' ? (
              <Check size={14} weight="bold" className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono text-muted-foreground">
            rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() =>
              copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, 'RGB')
            }
          >
            {copiedFormat === 'RGB' ? (
              <Check size={14} weight="bold" className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono text-muted-foreground">
            hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() =>
              copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, 'HSL')
            }
          >
            {copiedFormat === 'HSL' ? (
              <Check size={14} weight="bold" className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono text-muted-foreground">
            oklch({color.oklch.l} {color.oklch.c} {color.oklch.h})
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() =>
              copyToClipboard(
                `oklch(${color.oklch.l} ${color.oklch.c} ${color.oklch.h})`,
                'OKLCH'
              )
            }
          >
            {copiedFormat === 'OKLCH' ? (
              <Check size={14} weight="bold" className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
