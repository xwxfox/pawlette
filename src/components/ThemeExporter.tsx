import { useState } from 'react'
import { DownloadSimple, Copy, Check, FileCode, Palette, Eye, FileSvg } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { generateShadcnTheme, generateShadcnDarkTheme, exportThemeAsCSS, exportThemeAsJSON } from '@/lib/themeExport'
import { exportAsTailwindConfig, exportAsSCSS, exportAsJavaScript, exportAsFigmaTokens } from '@/lib/exportFormats'
import { generatePreviewSVG, exportThemeData, downloadSVG } from '@/lib/svgExport'
import { ComponentExamples } from '@/components/ComponentExamples'
import type { ExtractedColor } from '@/lib/types'
import type { ThemeConfig } from '@/lib/themeConfig'
import type { CustomGradientConfig } from '@/components/GradientEditorModal'
import { defaultThemeConfig } from '@/lib/themeConfig'

interface ThemeExporterProps {
  colors: ExtractedColor[]
  sharedConfig?: ThemeConfig
  luminosity?: number
  customGradients?: CustomGradientConfig[]
  previewDarkMode?: boolean
  selectedGradient?: string | null
  backgroundStyle?: 'solid' | 'gradient' | 'mesh' | 'fluid' | 'glass' | 'custom'
}

export function ThemeExporter({ colors, sharedConfig, luminosity = 0, customGradients = [], previewDarkMode = false, selectedGradient = null, backgroundStyle = 'solid' }: ThemeExporterProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [format, setFormat] = useState<'light' | 'dark' | 'both' | 'json' | 'gradients' | 'tailwind' | 'scss' | 'js' | 'ts' | 'figma' | 'components' | 'svg'>('both')

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

  const adjustedColors = colors.map(color => ({
    ...color,
    hex: adjustColorLuminosity(color.hex, luminosity)
  }))

  const lightTheme = generateShadcnTheme(adjustedColors, sharedConfig?.textContrast || 0)
  const darkTheme = generateShadcnDarkTheme(adjustedColors, sharedConfig?.textContrast || 0)
  
  const lightCssExport = exportThemeAsCSS(lightTheme, sharedConfig)
  const darkCssExport = exportThemeAsCSS(darkTheme, { ...sharedConfig, isDark: true })
  
  const bothCssExport = `@import 'tailwindcss';
@import "tw-animate-css";

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;${sharedConfig?.fontSize ? `
    ${sharedConfig.fontSize === 'sm' ? 'font-size: 0.875rem;' : ''}
    ${sharedConfig.fontSize === 'lg' ? 'font-size: 1.125rem;' : ''}
    ${sharedConfig.fontSize === 'xl' ? 'font-size: 1.25rem;' : ''}` : ''}${sharedConfig?.letterSpacing ? `
    ${sharedConfig.letterSpacing === 'tight' ? 'letter-spacing: -0.025em;' : ''}
    ${sharedConfig.letterSpacing === 'wide' ? 'letter-spacing: 0.025em;' : ''}` : ''}${sharedConfig?.lineHeight ? `
    ${sharedConfig.lineHeight === 'tight' ? 'line-height: 1.25;' : ''}
    ${sharedConfig.lineHeight === 'relaxed' ? 'line-height: 1.625;' : ''}
    ${sharedConfig.lineHeight === 'loose' ? 'line-height: 2;' : ''}` : ''}
  }${sharedConfig?.headingWeight ? `
  
  h1, h2, h3, h4, h5, h6 {
    ${sharedConfig.headingWeight === 'normal' ? 'font-weight: 400;' : ''}
    ${sharedConfig.headingWeight === 'medium' ? 'font-weight: 500;' : ''}
    ${sharedConfig.headingWeight === 'semibold' ? 'font-weight: 600;' : ''}
    ${sharedConfig.headingWeight === 'bold' ? 'font-weight: 700;' : ''}
    ${sharedConfig.headingWeight === 'extrabold' ? 'font-weight: 800;' : ''}
  }` : ''}
}

:root {
  --background: ${lightTheme.colors.background};
  --foreground: ${lightTheme.colors.foreground};
  --card: ${lightTheme.colors.card};
  --card-foreground: ${lightTheme.colors.cardForeground};
  --popover: ${lightTheme.colors.popover};
  --popover-foreground: ${lightTheme.colors.popoverForeground};
  --primary: ${lightTheme.colors.primary};
  --primary-foreground: ${lightTheme.colors.primaryForeground};
  --secondary: ${lightTheme.colors.secondary};
  --secondary-foreground: ${lightTheme.colors.secondaryForeground};
  --muted: ${lightTheme.colors.muted};
  --muted-foreground: ${lightTheme.colors.mutedForeground};
  --accent: ${lightTheme.colors.accent};
  --accent-foreground: ${lightTheme.colors.accentForeground};
  --destructive: ${lightTheme.colors.destructive};
  --destructive-foreground: ${lightTheme.colors.destructiveForeground};
  --border: ${lightTheme.colors.border};
  --input: ${lightTheme.colors.input};
  --ring: ${lightTheme.colors.ring};
  --radius: ${sharedConfig?.radius === 'sm' ? '0.25rem' : sharedConfig?.radius === 'md' ? '0.5rem' : sharedConfig?.radius === 'lg' ? '0.75rem' : sharedConfig?.radius === 'xl' ? '1rem' : sharedConfig?.radius === 'full' ? '9999px' : sharedConfig?.radius === 'none' ? '0' : '0.5rem'};
}

.dark {
  --background: ${darkTheme.colors.background};
  --foreground: ${darkTheme.colors.foreground};
  --card: ${darkTheme.colors.card};
  --card-foreground: ${darkTheme.colors.cardForeground};
  --popover: ${darkTheme.colors.popover};
  --popover-foreground: ${darkTheme.colors.popoverForeground};
  --primary: ${darkTheme.colors.primary};
  --primary-foreground: ${darkTheme.colors.primaryForeground};
  --secondary: ${darkTheme.colors.secondary};
  --secondary-foreground: ${darkTheme.colors.secondaryForeground};
  --muted: ${darkTheme.colors.muted};
  --muted-foreground: ${darkTheme.colors.mutedForeground};
  --accent: ${darkTheme.colors.accent};
  --accent-foreground: ${darkTheme.colors.accentForeground};
  --destructive: ${darkTheme.colors.destructive};
  --destructive-foreground: ${darkTheme.colors.destructiveForeground};
  --border: ${darkTheme.colors.border};
  --input: ${darkTheme.colors.input};
  --ring: ${darkTheme.colors.ring};
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  
  --radius-sm: calc(var(--radius) * 0.5);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) * 1.5);
  --radius-xl: calc(var(--radius) * 2);
  --radius-2xl: calc(var(--radius) * 3);
  --radius-full: 9999px;
}`
  
  const jsonExport = JSON.stringify({
    light: lightTheme,
    dark: darkTheme,
    config: sharedConfig
  }, null, 2)
  
  // New export formats
  const tailwindExport = exportAsTailwindConfig(adjustedColors, sharedConfig || {} as ThemeConfig)
  const scssExport = exportAsSCSS(adjustedColors, sharedConfig || {} as ThemeConfig)
  const jsExport = exportAsJavaScript(adjustedColors, sharedConfig || {} as ThemeConfig, false)
  const tsExport = exportAsJavaScript(adjustedColors, sharedConfig || {} as ThemeConfig, true)
  const figmaExport = exportAsFigmaTokens(adjustedColors, sharedConfig || {} as ThemeConfig)
  
  const usedGradients = new Set<string>()
  
  if (sharedConfig?.buttonCustomGradient) {
    usedGradients.add(sharedConfig.buttonCustomGradient)
  }
  
  if (sharedConfig?.cardCustomGradient) {
    usedGradients.add(sharedConfig.cardCustomGradient)
  }
  
  if (backgroundStyle === 'custom' && selectedGradient) {
    usedGradients.add(selectedGradient)
  }
  
  const usedCustomGradients = customGradients.filter(grad => usedGradients.has(grad.gradient))
  
  const gradientsExport = usedCustomGradients.length > 0 ? usedCustomGradients.map(grad => {
    return `/* ${grad.name} */
.gradient-${grad.id.replace(/[^a-z0-9]/gi, '-')} {
  background: ${grad.gradient};
}
`
  }).join('\n') : `/* No custom gradients used in current preview */
/* Create and use custom gradients in the Preview tab to export them here */`

  // SVG Export
  const svgExport = generatePreviewSVG({
    themeConfig: sharedConfig || defaultThemeConfig,
    colors: adjustedColors,
    darkMode: previewDarkMode,
    previewMode: 'landing', // Could be made dynamic
    backgroundStyle: backgroundStyle || 'solid',
    luminosity,
    customGradient: selectedGradient,
  })

  const getExportContent = (): string => {
    switch (format) {
      case 'light': return lightCssExport
      case 'dark': return darkCssExport
      case 'both': return bothCssExport
      case 'json': return jsonExport
      case 'gradients': return gradientsExport
      case 'tailwind': return tailwindExport
      case 'scss': return scssExport
      case 'js': return jsExport
      case 'ts': return tsExport
      case 'figma': return figmaExport
      case 'components': return '// See component examples in the tab'
      case 'svg': return svgExport
      default: return bothCssExport
    }
  }

  const handleCopy = async (content: string, label: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(label)
    toast.success(`${label} copied to clipboard!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownload = () => {
    const content = getExportContent()
    
    if (format === 'svg') {
      downloadSVG(content, 'theme-preview.svg')
      toast.success('Downloaded as theme-preview.svg')
      return
    }
    
    const filename = 
      format === 'json' ? 'theme.json' :
      format === 'gradients' ? 'gradients.css' :
      format === 'tailwind' ? 'tailwind.config.js' :
      format === 'scss' ? 'theme.scss' :
      format === 'js' ? 'theme.js' :
      format === 'ts' ? 'theme.ts' :
      format === 'figma' ? 'figma-tokens.json' :
      'theme.css'
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded as ${filename}`)
  }

  const currentTheme = previewDarkMode ? darkTheme : lightTheme

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileCode size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Export Theme</h2>
            <p className="text-sm text-muted-foreground">Ready-to-use Shadcn theme code</p>
          </div>
        </div>
      </div>

      <Card className="p-5 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={18} weight="duotone" className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">Color Preview</h3>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Eye size={14} />
            {previewDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Badge>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(currentTheme.colors).slice(0, 12).map(([key, value]) => (
            <div key={key} className="space-y-1.5">
              <div
                className="h-10 rounded-md border shadow-sm"
                style={{ background: value }}
                title={`${key}: ${value}`}
              />
              <p className="text-[10px] text-muted-foreground truncate font-medium">{key}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-4 flex-1 flex flex-col min-h-0">
        <Tabs value={format} onValueChange={(v) => setFormat(v as typeof format)} className="flex-1 flex flex-col min-h-0">
          <div className="space-y-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="both" className="text-xs">Both Themes</TabsTrigger>
              <TabsTrigger value="light" className="text-xs">Light</TabsTrigger>
              <TabsTrigger value="dark" className="text-xs">Dark</TabsTrigger>
              <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="tailwind" className="text-xs">Tailwind</TabsTrigger>
              <TabsTrigger value="scss" className="text-xs">SCSS</TabsTrigger>
              <TabsTrigger value="js" className="text-xs">JavaScript</TabsTrigger>
              <TabsTrigger value="ts" className="text-xs">TypeScript</TabsTrigger>
              <TabsTrigger value="figma" className="text-xs">Figma</TabsTrigger>
              <TabsTrigger value="svg" className="text-xs">
                <FileSvg size={14} className="mr-1" /> SVG
              </TabsTrigger>
              <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
            </TabsList>
            {usedCustomGradients.length > 0 && (
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="gradients" className="text-xs">
                  Gradients ({usedCustomGradients.length})
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          <div className="flex-1 mt-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                {format === 'both' && 'Complete theme with light & dark modes'}
                {format === 'light' && 'Light theme only'}
                {format === 'dark' && 'Dark theme only'}
                {format === 'json' && 'JSON format for programmatic use'}
                {format === 'gradients' && `Custom gradients used in preview (${usedCustomGradients.length})`}
                {format === 'tailwind' && 'Tailwind CSS configuration file'}
                {format === 'scss' && 'SCSS variables for your theme'}
                {format === 'js' && 'JavaScript module export'}
                {format === 'ts' && 'TypeScript module with types'}
                {format === 'figma' && 'Figma design tokens (JSON)'}
                {format === 'components' && 'Ready-to-use component examples'}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopy(getExportContent(), format === 'json' ? 'JSON' : format === 'gradients' ? 'Gradients' : 'CSS')}>
                  {copied === (format === 'json' ? 'JSON' : format === 'gradients' ? 'Gradients' : 'CSS') ? (
                    <>
                      <Check size={14} weight="bold" className="mr-1.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <DownloadSimple size={14} weight="bold" className="mr-1.5" />
                  Download
                </Button>
              </div>
            </div>

            <TabsContent value="both" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{bothCssExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="light" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{lightCssExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="dark" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{darkCssExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="json" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{jsonExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="gradients" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{gradientsExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="tailwind" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{tailwindExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="scss" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{scssExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="js" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{jsExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="ts" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{tsExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="figma" className="mt-0 flex-1 min-h-0">
              <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono h-full min-h-[600px] overflow-auto border">
                <code>{figmaExport}</code>
              </pre>
            </TabsContent>

            <TabsContent value="svg" className="mt-0 flex-1 min-h-0">
              <div className="space-y-4 h-full flex flex-col">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <FileSvg size={14} weight="duotone" />
                    SVG Preview Export
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Export your theme as an SVG with embedded metadata. This creates a compact representation
                    that can be used to recreate the exact preview without needing the full image.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">Embedded Metadata</Badge>
                    <Badge variant="secondary" className="text-xs">Instant Recreation</Badge>
                    <Badge variant="secondary" className="text-xs">Small File Size</Badge>
                  </div>
                </div>
                <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono flex-1 overflow-auto border">
                  <code>{svgExport}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="components" className="mt-0 flex-1 min-h-0">
              <div className="h-full overflow-auto">
                <ComponentExamples config={sharedConfig || {} as ThemeConfig} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>


    </div>
  )
}
