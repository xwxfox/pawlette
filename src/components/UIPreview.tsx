import { useEffect, memo, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Heart, 
  ShoppingCart, 
  Bell, 
  Star, 
  User
} from '@phosphor-icons/react'
import { GrainOverlay } from '@/components/GrainOverlay'
import { EnhancedPreviewComponents } from '@/components/EnhancedPreviewComponents'
import { 
  getShadowClass, 
  getBorderClass,
  getRadiusClass,
  getButtonGradient,
  getCardGradient,
  getFontSizeClass,
  getHeadingWeightClass,
  getLetterSpacingClass,
  getLineHeightClass,
  adaptGradientForLightMode,
  type ThemeConfig 
} from '@/lib/themeConfig'
import { generateShadcnTheme, generateShadcnDarkTheme } from '@/lib/themeExport'
import type { ExtractedColor } from '@/lib/types'
import type { PreviewMode } from './PreviewSelector'

interface UIPreviewProps {
  colors: ExtractedColor[]
  config: ThemeConfig
  backgroundStyle: 'solid' | 'gradient' | 'mesh' | 'fluid' | 'glass' | 'custom'
  previewMode: PreviewMode
  previewDarkMode: boolean
  luminosity?: number
  customGradient?: string | null
}

export const UIPreview = memo(function UIPreview({ colors, config, backgroundStyle, previewMode, previewDarkMode, luminosity = 0, customGradient }: UIPreviewProps) {
  const adjustColorLuminosity = useMemo(() => (hexColor: string, adjustment: number): string => {
    try {
      const hex = hexColor.replace('#', '')
      
      // Validate hex format
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        console.warn('Invalid hex color:', hexColor)
        return hexColor
      }
      
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
      
      // Validate output values
      if (isNaN(newR) || isNaN(newG) || isNaN(newB)) {
        console.warn('Invalid color adjustment result')
        return hexColor
      }
      
      const result = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
      
      // Final validation
      if (!/^#[0-9A-Fa-f]{6}$/.test(result)) {
        console.warn('Invalid final hex color:', result)
        return hexColor
      }
      
      return result
    } catch (error) {
      console.error('Error adjusting color luminosity:', error)
      return hexColor
    }
  }, [])

  const adjustedColors = useMemo(() => colors.map(color => ({
    ...color,
    hex: adjustColorLuminosity(color.hex, luminosity)
  })), [colors, luminosity, adjustColorLuminosity])

  // Memoize theme generation to prevent unnecessary recalculations
  const theme = useMemo(() => {
    return previewDarkMode 
      ? generateShadcnDarkTheme(adjustedColors, config.textContrast)
      : generateShadcnTheme(adjustedColors, config.textContrast)
  }, [adjustedColors, previewDarkMode, config.textContrast])

  // Apply theme CSS variables and dark class
  useEffect(() => {
    const root = document.documentElement

    // Batch DOM updates in a single animation frame for better performance
    requestAnimationFrame(() => {
      // Update CSS variables
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
        root.style.setProperty(cssVarName, value)
      })

      // Update dark class
      if (previewDarkMode) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    })

    return () => {
      root.classList.remove('dark')
    }
  }, [theme, previewDarkMode])

  const c1 = useMemo(() => adjustColorLuminosity(colors[0]?.hex || '#6366f1', luminosity), [colors, luminosity, adjustColorLuminosity])
  const c2 = useMemo(() => adjustColorLuminosity(colors[1]?.hex || '#8b5cf6', luminosity), [colors, luminosity, adjustColorLuminosity])
  const c3 = useMemo(() => adjustColorLuminosity(colors[2]?.hex || '#ec4899', luminosity), [colors, luminosity, adjustColorLuminosity])
  const c4 = useMemo(() => adjustColorLuminosity(colors[3]?.hex || '#f43f5e', luminosity), [colors, luminosity, adjustColorLuminosity])
  const c5 = useMemo(() => adjustColorLuminosity(colors[4]?.hex || '#06b6d4', luminosity), [colors, luminosity, adjustColorLuminosity])
  const c6 = useMemo(() => adjustColorLuminosity(colors[5]?.hex || '#10b981', luminosity), [colors, luminosity, adjustColorLuminosity])
  const fallbackColors = [c1, c2, c3, c4, c5, c6]
  const getSwatchColor = (index: number) => {
    if (!colors.length) {
      return fallbackColors[index % fallbackColors.length]
    }
    return colors[index % colors.length]?.hex || fallbackColors[index % fallbackColors.length]
  }

  // Memoize helper functions to prevent recreating on every render
  const getButtonGradientStyle = useCallback((color: string, color2?: string) => 
    getButtonGradient(config, color, color2, previewDarkMode),
    [config, previewDarkMode]
  )
  
  const getCardGradientStyle = useCallback((color1: string, color2?: string, color3?: string) =>
    getCardGradient(config, color1, color2, color3, previewDarkMode),
    [config, previewDarkMode]
  )

  const getBackgroundStyle = useCallback((): React.CSSProperties => {
    switch (backgroundStyle) {
      case 'solid':
        return { backgroundColor: 'var(--background)' }
      case 'gradient': {
        const gradient = `linear-gradient(135deg, ${c1}, ${c2} 50%, ${c3})`
        return { background: adaptGradientForLightMode(gradient, previewDarkMode, config.adaptGradientsForLightMode) }
      }
      case 'mesh':
        return { backgroundColor: 'var(--background)' }
      case 'fluid':
        return { backgroundColor: 'var(--background)' }
      case 'glass': {
        const gradient = previewDarkMode ? `linear-gradient(135deg, ${c1}15, ${c2}15)` : `linear-gradient(135deg, ${c1}08, ${c2}08)`
        return { background: adaptGradientForLightMode(gradient, previewDarkMode, config.adaptGradientsForLightMode) }
      }
      case 'custom': {
        if (!customGradient) return { backgroundColor: 'var(--background)' }
        return { background: adaptGradientForLightMode(customGradient, previewDarkMode, config.adaptGradientsForLightMode) }
      }
    }
  }, [backgroundStyle, c1, c2, c3, customGradient, previewDarkMode, config.adaptGradientsForLightMode])

  const getMeshOverlay = useCallback(() => {
    if (backgroundStyle === 'custom' && customGradient) {
      const hasBlur = customGradient.includes('radial-gradient')
      const adaptedGradient = adaptGradientForLightMode(customGradient, previewDarkMode, config.adaptGradientsForLightMode)
      return (
        <div
          className="absolute inset-0"
          style={{
            background: adaptedGradient,
            filter: hasBlur ? 'blur(80px)' : 'none',
          }}
        />
      )
    }
    
    if (backgroundStyle === 'mesh') {
      const opacity = previewDarkMode ? '30' : 'ee'
      const opacity2 = previewDarkMode ? '25' : 'dd'
      const opacity3 = previewDarkMode ? '20' : '99'
      const gradient = `radial-gradient(ellipse 120% 100% at 18% 28%, ${c1}${opacity}, transparent 50%), radial-gradient(ellipse 110% 110% at 72% 22%, ${c2}${opacity}, transparent 48%), radial-gradient(ellipse 130% 100% at 65% 78%, ${c3}${opacity2}, transparent 52%), radial-gradient(ellipse 115% 120% at 28% 82%, ${c4}${opacity}, transparent 50%), radial-gradient(ellipse 100% 100% at 50% 50%, ${c5}${opacity3}, transparent 55%)`
      const adaptedGradient = adaptGradientForLightMode(gradient, previewDarkMode, config.adaptGradientsForLightMode)
      return (
        <div
          className="absolute inset-0"
          style={{
            background: adaptedGradient,
            filter: 'blur(95px)',
          }}
        />
      )
    }
    
    if (backgroundStyle === 'fluid') {
      const opacity = previewDarkMode ? '40' : 'ff'
      const opacity2 = previewDarkMode ? '30' : 'ee'
      const opacity3 = previewDarkMode ? '25' : 'dd'
      const gradient = `radial-gradient(ellipse 140% 110% at 15% 25%, ${c1}${opacity}, transparent 55%), radial-gradient(ellipse 120% 100% at 75% 30%, ${c2}${opacity2}, transparent 50%), radial-gradient(ellipse 110% 120% at 60% 75%, ${c3}${opacity2}, transparent 52%), radial-gradient(ellipse 130% 90% at 30% 80%, ${c4}${opacity3}, transparent 50%)`
      const adaptedGradient = adaptGradientForLightMode(gradient, previewDarkMode, config.adaptGradientsForLightMode)
      return (
        <div
          className="absolute inset-0"
          style={{
            background: adaptedGradient,
            filter: 'blur(90px)',
          }}
        />
      )
    }
    
    return null
  }, [backgroundStyle, customGradient, previewDarkMode, config.adaptGradientsForLightMode, c1, c2, c3, c4, c5])

  const cardClassName = config.useGlass
    ? `bg-card/10 backdrop-blur-xl ${getBorderClass(config.borders)} border-border/20`
    : `bg-card ${getBorderClass(config.borders)} border-border`

  const getSpacingMultiplier = () => {
    switch (config.spacing) {
      case 'compact':
        return 0.75
      case 'normal':
        return 1
      case 'comfortable':
        return 1.25
      case 'spacious':
        return 1.5
    }
  }

  const spacingMultiplier = getSpacingMultiplier()
  const spaceClasses = {
    xs: `space-y-${Math.max(1, Math.round(1 * spacingMultiplier))}`,
    sm: `space-y-${Math.max(2, Math.round(2 * spacingMultiplier))}`,
    md: `space-y-${Math.max(3, Math.round(4 * spacingMultiplier))}`,
    lg: `space-y-${Math.max(4, Math.round(6 * spacingMultiplier))}`,
    xl: `space-y-${Math.max(6, Math.round(8 * spacingMultiplier))}`,
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-border h-full flex flex-col ${getFontSizeClass(config.fontSize)} ${getLetterSpacingClass(config.letterSpacing)} ${getLineHeightClass(config.lineHeight)}`}
      style={getBackgroundStyle()}
    >
        {getMeshOverlay()}
        {config.grainEnabled && <GrainOverlay intensity={config.grainIntensity} />}
        
        <div className="relative z-10 p-8 flex-1 overflow-y-auto">{previewMode === 'landing' && (
          <div className={`${spaceClasses.lg} max-w-5xl mx-auto`}>
            <Card 
              className={`relative overflow-hidden ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-6 md:p-8`}
              style={getCardGradientStyle( c1, c2, c3)}
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 20% 20%, ${c3}33, transparent 45%), radial-gradient(circle at 80% 0%, ${c2}33, transparent 55%)` }} />
              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex-1 space-y-4">
                  <Badge className={getRadiusClass(config.radius)} style={{ background: `${c3}99`, color: 'white' }}>
                    Landing kit
                  </Badge>
                  <h1 className={`text-4xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>
                    Ship polished hero sections in minutes
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Point your favorite inspiration image at the generator and get a clean landing hero with matched colors,
                    typography, and CTAs ready to drop into your build.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      className={`${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
                      style={getButtonGradientStyle( c1, c2)}
                    >
                      Start crafting
                    </Button>
                    <Button
                      variant="outline"
                      className={`${getRadiusClass(config.radius)} ${config.useGlass ? 'border-white/40 bg-white/10 text-white hover:bg-white/20' : ''}`}
                    >
                      See examples
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                    {[
                      { label: 'Teams using', value: '1.2k+' },
                      { label: 'Tokens synced', value: '9.8k' },
                      { label: 'Avg. time saved', value: '12 hrs' }
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className={`text-xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>{stat.value}</p>
                        <p>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className={`p-4 ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} space-y-4`}>
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                      <span>Palette</span>
                      <span className="text-foreground">Synced</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`${getRadiusClass(config.radius)} h-12 border border-border/40`}
                          style={{ background: getSwatchColor(i) }}
                        />
                      ))}
                    </div>
                    <div className="space-y-3">
                      {['CTA gradient', 'Accessibility checks', 'Export queue'].map((label, i) => (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{label}</span>
                            <span className="text-muted-foreground">{i === 2 ? '2 files' : '100%'}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full"
                              style={{ width: `${i === 2 ? 60 : 100}%`, background: getSwatchColor(i) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: 'Color-matched CTAs', desc: 'Buttons auto-pick the strongest contrast combination from your palette.', icon: Star, color: c2 },
                { title: 'Tone-aware copy', desc: 'Preset headline sizes stay balanced with your chosen type scale.', icon: Bell, color: c3 },
                { title: 'Instant export', desc: 'Copy React, Tailwind, and CSS snippets without extra cleanup.', icon: Heart, color: c4 }
              ].map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-5 space-y-2`}>
                    <div className={`w-10 h-10 ${getRadiusClass('full')} flex items-center justify-center`} style={{ background: `${feature.color}22`, color: feature.color }}>
                      <Icon size={18} weight="duotone" />
                    </div>
                    <h3 className={`text-lg ${getHeadingWeightClass(config.headingWeight === 'extrabold' ? 'semibold' : config.headingWeight)} text-foreground`}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </Card>
                )
              })}
            </div>

            <Card className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
              <div>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Need something lighter?</p>
                <h3 className={`text-2xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>
                  Drop an image and export a ready-made hero block.
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button 
                  className={`${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
                  style={getButtonGradientStyle( c1, c2)}
                >
                  Upload image
                </Button>
                <Button variant="outline" className={getRadiusClass(config.radius)}>
                  View tokens
                </Button>
              </div>
            </Card>
          </div>
        )}

        {previewMode === 'dashboard' && (
          <div className={spaceClasses.lg}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-3xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>Dashboard</h2>
                <p className="text-muted-foreground">Welcome back, here's your overview</p>
              </div>
              <Button 
                className={`${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
                style={getButtonGradientStyle( c1, c2)}
              >
                <Bell size={20} weight="bold" className="mr-2" />
                Notifications
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: '12,543', color: c1 },
                { label: 'Revenue', value: '$45,231', color: c2 },
                { label: 'Orders', value: '1,234', color: c3 },
                { label: 'Growth', value: '+23%', color: c4 },
              ].map((stat, i) => (
                <Card 
                  key={i} 
                  className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-5 ${spaceClasses.xs}`}
                  style={getCardGradientStyle( stat.color, colors[(i+1) % colors.length]?.hex)}
                >
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>{stat.value}</p>
                  <div
                    className={getRadiusClass('full')}
                    style={{
                      height: '8px',
                      background: config.buttonGradient === 'none' 
                        ? stat.color 
                        : `linear-gradient(90deg, ${stat.color}, ${stat.color}66)`,
                    }}
                  />
                </Card>
              ))}
            </div>

            <Card 
              className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-6 ${spaceClasses.md}`}
              style={getCardGradientStyle( c1, c2, c3)}
            >
              <h3 className={`text-xl ${getHeadingWeightClass(config.headingWeight === 'extrabold' ? 'semibold' : config.headingWeight)} text-foreground`}>Recent Activity</h3>
              <div className={spaceClasses.sm}>
                {['New user registration', 'Payment processed', 'Product shipped'].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-border/10 last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 ${getRadiusClass('full')}`}
                        style={{ background: colors[i]?.hex || c1 }}
                      />
                      <span className="text-foreground">{activity}</span>
                    </div>
                    <span className="text-muted-foreground">2 min ago</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {previewMode === 'card' && (
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {colors.slice(0, 3).map((color, i) => (
                <Card 
                  key={i} 
                  className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} overflow-hidden group`}
                >
                  <div
                    className="h-48 relative"
                    style={{ 
                      background: config.buttonGradient === 'none'
                        ? color.hex
                        : `linear-gradient(135deg, ${color.hex}, ${colors[(i + 1) % colors.length]?.hex || c2})`
                    }}
                  >
                    <div className="absolute top-4 right-4">
                      <Button
                        size="icon"
                        className={`${getRadiusClass('full')} bg-background/20 backdrop-blur-sm border border-border/40 hover:bg-background/30`}
                      >
                        <Heart size={20} weight="bold" className="text-foreground" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className={`${getRadiusClass(config.radius)} bg-background/20 backdrop-blur-sm border border-border/40`}>
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-6 ${spaceClasses.md}`} style={getCardGradientStyle( color.hex, colors[(i+1) % colors.length]?.hex)}>
                    <div>
                      <h3 className={`${getHeadingWeightClass(config.headingWeight === 'extrabold' ? 'semibold' : config.headingWeight)} text-lg text-foreground`}>
                        Product {i + 1}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Beautiful color scheme item
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={16} weight="fill" style={{ color: c3 }} />
                        ))}
                      </div>
                      <span className={`text-xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>$99</span>
                    </div>
                    <Button
                      className={`w-full ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
                      style={getButtonGradientStyle( color.hex, colors[(i+1) % colors.length]?.hex)}
                    >
                      <ShoppingCart size={20} weight="bold" className="mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {previewMode === 'form' && (
          <div className="max-w-2xl mx-auto">
            <Card 
              className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-8 ${spaceClasses.lg}`}
              style={getCardGradientStyle( c1, c2, c3)}
            >
              <div className={`text-center ${spaceClasses.xs}`}>
                <div
                  className={`w-16 h-16 ${getRadiusClass('full')} mx-auto flex items-center justify-center`}
                  style={getButtonGradientStyle( c1, c2)}
                >
                  <User size={32} weight="bold" className="text-white" />
                </div>
                <h2 className={`text-2xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>Create Account</h2>
                <p className="text-muted-foreground">Join our community today</p>
              </div>

              <div className={spaceClasses.md}>
                <div className={spaceClasses.xs}>
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className={`${getRadiusClass(config.radius)} ${config.useGlass ? 'bg-card/5 border-border/20 placeholder:text-muted-foreground' : ''}`}
                  />
                </div>

                <div className={spaceClasses.xs}>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`${getRadiusClass(config.radius)} ${config.useGlass ? 'bg-card/5 border-border/20 placeholder:text-muted-foreground' : ''}`}
                  />
                </div>

                <div className={spaceClasses.xs}>
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={`${getRadiusClass(config.radius)} ${config.useGlass ? 'bg-card/5 border-border/20 placeholder:text-muted-foreground' : ''}`}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="terms" />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the terms and conditions
                  </Label>
                </div>

                <Button
                  className={`w-full ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
                  size="lg"
                  style={getButtonGradientStyle( c1, c2)}
                >
                  Sign Up
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className={`w-full border-t border-border`} />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className={`${config.useGlass ? 'bg-transparent' : 'bg-card'} px-2 text-muted-foreground`}>
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[c1, c2, c3].map((color, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className={`${getRadiusClass(config.radius)} ${config.useGlass ? 'border-border/30 hover:bg-card/10' : ''}`}
                    >
                      <div className={`w-5 h-5 ${getRadiusClass(config.radius)}`} style={{ background: color }} />
                    </Button>
                  ))}
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button className={`${getHeadingWeightClass(config.headingWeight === 'extrabold' ? 'semibold' : config.headingWeight)} text-foreground hover:underline`} style={{ color: c3 }}>
                  Sign in
                </button>
              </p>
            </Card>
          </div>
        )}

        {previewMode === 'components' && (
          <div className="max-w-6xl mx-auto">
            <EnhancedPreviewComponents colors={adjustedColors} isDark={previewDarkMode} config={config} />
          </div>
        )}

        {previewMode === 'table' && (
          <div className={`${spaceClasses.lg} max-w-6xl mx-auto`}>
            <Card 
              className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
              style={getCardGradientStyle( c1, c2, c3)}
            >
              <div className="p-6 border-b border-border">
                <h2 className={`text-2xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>Data Table</h2>
                <p className="text-sm text-muted-foreground">Manage and view your data</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      {['Name', 'Status', 'Role', 'Email', 'Actions'].map((header, i) => (
                        <th key={i} className="text-left p-4 text-sm font-semibold text-foreground">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'John Doe', status: 'Active', role: 'Admin', email: 'john@example.com' },
                      { name: 'Jane Smith', status: 'Active', role: 'Editor', email: 'jane@example.com' },
                      { name: 'Bob Johnson', status: 'Inactive', role: 'Viewer', email: 'bob@example.com' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-accent/50 transition-colors">
                        <td className="p-4 text-foreground">{row.name}</td>
                        <td className="p-4">
                          <Badge 
                            className={getRadiusClass(config.radius)}
                            style={{ background: row.status === 'Active' ? c2 : c3, color: 'white' }}
                          >
                            {row.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.role}</td>
                        <td className="p-4 text-muted-foreground">{row.email}</td>
                        <td className="p-4">
                          <Button 
                            size="sm"
                            variant="ghost"
                            className={getRadiusClass(config.radius)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {previewMode === 'blog' && (
          <div className={`${spaceClasses.lg} max-w-4xl mx-auto`}>
            <article className={`${spaceClasses.md}`}>
              <div 
                className={`h-64 ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} mb-6`}
                style={{ background: adaptGradientForLightMode(`linear-gradient(135deg, ${c1}, ${c2})`, previewDarkMode, config.adaptGradientsForLightMode) }}
              />
              <div className={`${spaceClasses.sm}`}>
                <div className="flex gap-2 mb-4">
                  <Badge className={getRadiusClass(config.radius)} style={{ background: c2, color: 'white' }}>
                    Design
                  </Badge>
                  <Badge className={getRadiusClass(config.radius)} style={{ background: c3, color: 'white' }}>
                    Tutorial
                  </Badge>
                </div>
                <h1 className={`text-4xl ${getHeadingWeightClass(config.headingWeight)} text-foreground mb-4`}>
                  Building Modern Web Experiences
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span>By Alex Johnson</span>
                  <span>•</span>
                  <span>May 15, 2024</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                <div className="prose prose-lg text-foreground">
                  <p className="text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <h2 className={`text-2xl ${getHeadingWeightClass(config.headingWeight === 'extrabold' ? 'semibold' : config.headingWeight)} text-foreground mt-6 mb-3`}>
                    Key Takeaways
                  </h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Focus on user experience and accessibility</li>
                    <li>Leverage modern design patterns</li>
                    <li>Optimize for performance and scalability</li>
                  </ul>
                </div>
              </div>
            </article>
          </div>
        )}

        {previewMode === 'ecommerce' && (
          <div className={`${spaceClasses.lg} max-w-6xl mx-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-3xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>Shop</h2>
              <Button 
                className={`${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
                style={getButtonGradientStyle( c1, c2)}
              >
                <ShoppingCart size={20} /> Cart (3)
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Premium Product', price: '$99', image: c1 },
                { name: 'Essential Kit', price: '$49', image: c2 },
                { name: 'Starter Pack', price: '$29', image: c3 },
              ].map((product, i) => (
                <Card 
                  key={i}
                  className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} overflow-hidden hover:scale-105 transition-transform`}
                  style={getCardGradientStyle( colors[i]?.hex || c1, colors[(i+1) % colors.length]?.hex || c2)}
                >
                  <div 
                    className="h-48"
                    style={{ background: adaptGradientForLightMode(`linear-gradient(135deg, ${product.image}, ${colors[(i+1) % colors.length]?.hex || c2})`, previewDarkMode, config.adaptGradientsForLightMode) }}
                  />
                  <div className="p-4 space-y-3">
                    <h3 className={`${getHeadingWeightClass(config.headingWeight === 'extrabold' ? 'semibold' : config.headingWeight)} text-lg text-foreground`}>
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">{product.price}</span>
                      <Button 
                        size="sm"
                        className={getRadiusClass(config.radius)}
                        style={{ background: c2, color: 'white' }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {previewMode === 'profile' && (
          <div className={`${spaceClasses.lg} max-w-4xl mx-auto`}>
            <Card 
              className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
              style={getCardGradientStyle( c1, c2, c3)}
            >
              <div 
                className="h-32"
                style={{ background: adaptGradientForLightMode(`linear-gradient(135deg, ${c1}, ${c2})`, previewDarkMode, config.adaptGradientsForLightMode) }}
              />
              <div className="px-6 pb-6">
                <div className="flex items-start gap-6 -mt-16">
                  <div 
                    className={`w-32 h-32 ${getRadiusClass(config.radius)} border-4 border-background flex items-center justify-center text-4xl font-bold`}
                    style={{ background: c3, color: 'white' }}
                  >
                    AJ
                  </div>
                  <div className="flex-1 pt-16">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className={`text-2xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>
                          Alex Johnson
                        </h2>
                        <p className="text-muted-foreground">@alexj • Product Designer</p>
                      </div>
                      <Button 
                        className={`${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}
                        style={getButtonGradientStyle( c1, c2)}
                      >
                        Follow
                      </Button>
                    </div>
                    <p className="text-foreground mt-4">
                      Passionate about creating beautiful and functional user experiences. Based in San Francisco.
                    </p>
                    <div className="flex gap-6 mt-4">
                      {[
                        { label: 'Followers', value: '1.2k' },
                        { label: 'Following', value: '345' },
                        { label: 'Posts', value: '89' },
                      ].map((stat, i) => (
                        <div key={i}>
                          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {previewMode === 'analytics' && (
          <div className={`${spaceClasses.lg} max-w-6xl mx-auto`}>
            <h2 className={`text-3xl ${getHeadingWeightClass(config.headingWeight)} text-foreground mb-6`}>
              Analytics Dashboard
            </h2>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Users', value: '12,345', trend: '+12%', color: c1 },
                { label: 'Revenue', value: '$45,678', trend: '+8%', color: c2 },
                { label: 'Conversions', value: '890', trend: '+15%', color: c3 },
                { label: 'Avg. Session', value: '4:32', trend: '+5%', color: colors[3]?.hex || c1 },
              ].map((metric, i) => (
                <Card 
                  key={i}
                  className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-4`}
                  style={getCardGradientStyle( metric.color, colors[(i+1) % colors.length]?.hex || c2)}
                >
                  <div className="text-sm text-muted-foreground mb-1">{metric.label}</div>
                  <div className="flex items-end justify-between">
                    <div className={`text-2xl ${getHeadingWeightClass(config.headingWeight)} text-foreground`}>
                      {metric.value}
                    </div>
                    <Badge 
                      className={getRadiusClass(config.radius)}
                      style={{ background: metric.color, color: 'white' }}
                    >
                      {metric.trend}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-6`}
                style={getCardGradientStyle( c1, c2)}
              >
                <h3 className={`${getHeadingWeightClass(config.headingWeight === 'extrabold' ? 'semibold' : config.headingWeight)} text-lg text-foreground mb-4`}>
                  Traffic Sources
                </h3>
                <div className="space-y-3">
                  {[
                    { source: 'Direct', percentage: 45, color: c1 },
                    { source: 'Social', percentage: 30, color: c2 },
                    { source: 'Search', percentage: 25, color: c3 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{item.source}</span>
                        <span className="text-muted-foreground">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all"
                          style={{ width: `${item.percentage}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card 
                className={`${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)} p-6`}
                style={getCardGradientStyle( c2, c3)}
              >
                <h3 className={`${getHeadingWeightClass(config.headingWeight === 'extrabold' ? 'semibold' : config.headingWeight)} text-lg text-foreground mb-4`}>
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    { action: 'New user registered', time: '2 min ago' },
                    { action: 'Purchase completed', time: '15 min ago' },
                    { action: 'Support ticket opened', time: '1 hour ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div 
                        className="w-2 h-2 rounded-full mt-2"
                        style={{ background: colors[i]?.hex || c1 }}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-foreground">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
        </div>
    </div>
  )
})
