import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAutoCollapse } from '@/hooks/useAutoCollapse'
import { Image as ImageIcon, Gradient, Palette as PaletteIcon, Eye, FileArrowDown, ClockCounterClockwise, Moon, Sun, Swatches, Scan, Plus, Question, Sliders, TrendUp, FolderOpen, Share, ArrowUUpLeft, ArrowUUpRight } from '@phosphor-icons/react'
import { Toaster } from 'sonner'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ImageUpload'
import { ColorsView } from '@/components/ColorsView'
import { GradientsCanvas } from '@/components/GradientsCanvas'
import { PaletteGenerator } from '@/components/PaletteGenerator'
import { AnalysisHistory } from '@/components/AnalysisHistory'
import { UIPreview } from '@/components/UIPreview'
import { UIPreviewControls } from '@/components/UIPreviewControls'
import { ThemeExporter } from '@/components/ThemeExporter'
import { GradientEditorModal, type CustomGradientConfig } from '@/components/GradientEditorModal'
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'
import { extractColorsFromImage, identifySemanticColors } from '@/lib/colorUtils'
import { defaultThemeConfig, type ThemeConfig } from '@/lib/themeConfig'
import type { ColorAnalysis } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AccessibilityChecker } from '@/components/AccessibilityChecker'
import { ColorMixer } from '@/components/ColorMixer'
import { TintShadeGenerator } from '@/components/TintShadeGenerator'
import { ColorAdjuster } from '@/components/ColorAdjuster'
import { ColorAnalysis as ColorAnalysisView } from '@/components/ColorAnalysis'
import { ShareModal } from '@/components/ShareModal'
import { PaletteCollections } from '@/components/PaletteCollections'
import { getPaletteFromUrl, type ShareablePalette } from '@/lib/shareUtils'
import { useHistory, useKeyboardShortcuts } from '@/hooks/useHistory'
import { ComponentErrorBoundary } from '@/components/ComponentErrorBoundary'
import { transitionTheme } from '@/lib/viewTransitions'
import { ColorBlindSimulator, type ColorBlindType } from '@/components/ColorBlindSimulator'
import { LoadingScreen } from '@/components/LoadingScreen'
import { quickExtractColors } from '@/lib/quickColorExtract'

type ViewMode = 'upload' | 'colors' | 'gradients' | 'palettes' | 'preview' | 'export' | 'history' | 'accessibility' | 'tools' | 'analysis' | 'collections'

// Color blind filter matrices
function getColorBlindMatrix(type: ColorBlindType): string {
  const matrices: Record<ColorBlindType, string> = {
    none: '1,0,0,0,0 0,1,0,0,0 0,0,1,0,0 0,0,0,1,0',
    protanopia: '0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0',
    deuteranopia: '0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0',
    tritanopia: '0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0',
    achromatopsia: '0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0,0,0,1,0',
    protanomaly: '0.817,0.183,0,0,0 0.333,0.667,0,0,0 0,0.125,0.875,0,0 0,0,0,1,0',
    deuteranomaly: '0.8,0.2,0,0,0 0.258,0.742,0,0,0 0,0.142,0.858,0,0 0,0,0,1,0',
    tritanomaly: '0.967,0.033,0,0,0 0,0.733,0.267,0,0 0,0.183,0.817,0,0 0,0,0,1,0',
  }
  return matrices[type]
}

function App() {
  const [history, setHistory] = useLocalStorage<ColorAnalysis[]>('color-analysis-history', [])
  const {
    state: currentAnalysis,
    pushState: setCurrentAnalysis,
    undo,
    redo,
    canUndo,
    canRedo,
    clear: clearHistory
  } = useHistory<ColorAnalysis | null>(null, { maxHistory: 50 })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loadingColors, setLoadingColors] = useState<string[]>([])
  const [loadingMessage, setLoadingMessage] = useState('Analyzing colors...')
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [themeConfig, setThemeConfig] = useLocalStorage<ThemeConfig>('theme-config', defaultThemeConfig)
  
  // Undo/Redo for theme config
  const {
    state: themeConfigHistory,
    pushState: pushThemeConfig,
    undo: undoThemeConfig,
    redo: redoThemeConfig,
    canUndo: canUndoTheme,
    canRedo: canRedoTheme,
  } = useHistory<ThemeConfig>(themeConfig, { maxHistory: 100 })

  // Sync history state back to localStorage
  useEffect(() => {
    if (JSON.stringify(themeConfigHistory) !== JSON.stringify(themeConfig)) {
      setThemeConfig(themeConfigHistory)
    }
  }, [themeConfigHistory])

  const [viewMode, setViewMode] = useState<ViewMode>('upload')
  const [previewDarkMode, setPreviewDarkMode] = useLocalStorage<boolean>('preview-dark-mode', false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  
  // Color blind simulation
  const [colorBlindFilterEnabled, setColorBlindFilterEnabled] = useLocalStorage<boolean>('color-blind-filter-enabled', false)
  const [colorBlindFilterType, setColorBlindFilterType] = useLocalStorage<ColorBlindType>('color-blind-filter-type', 'none')

  // Optimized auto-collapse with per-button hover expansion (floating dock style)
  const { 
    containerRef, 
    shouldAutoCollapse, 
    hoveredButtonIndex,
    handleMouseMove,
    handleMouseLeave,
    registerButton 
  } = useAutoCollapse({
    threshold: 1400,
    manuallyCollapsed: true
  })

  const [isRightDockHovered, setIsRightDockHovered] = useState(false)
  const [rightDockHoveredIndex, setRightDockHoveredIndex] = useState<number | null>(null)

  const [gradientGrainEnabled, setGradientGrainEnabled] = useLocalStorage<boolean>('gradient-grain-enabled', true)
  const [gradientGrainIntensity, setGradientGrainIntensity] = useLocalStorage<number>('gradient-grain-intensity', 0.08)
  const [gradientLuminosity, setGradientLuminosity] = useLocalStorage<number>('gradient-luminosity', 0)
  const [gradientSaturation, setGradientSaturation] = useLocalStorage<number>('gradient-saturation', 0)
  const [gradientHueShift, setGradientHueShift] = useLocalStorage<number>('gradient-hue-shift', 0)
  const [gradientContrast, setGradientContrast] = useLocalStorage<number>('gradient-contrast', 0)
  const [gradientBlurAmount, setGradientBlurAmount] = useLocalStorage<number>('gradient-blur-amount', 0)
  const [copiedGradient, setCopiedGradient] = useState<string | null>(null)

  const [previewBackgroundStyle, setPreviewBackgroundStyle] = useLocalStorage<'solid' | 'gradient' | 'mesh' | 'fluid' | 'glass' | 'custom'>('preview-bg-style', 'mesh')
  const [previewMode, setPreviewMode] = useLocalStorage<'landing' | 'dashboard' | 'card' | 'form' | 'components' | 'table' | 'blog' | 'ecommerce' | 'profile' | 'analytics'>('preview-mode', 'landing')
  const [selectedGradient, setSelectedGradient] = useLocalStorage<string | null>('selected-gradient', null)
  
  const [customGradients, setCustomGradients] = useLocalStorage<CustomGradientConfig[]>('custom-gradients', [])
  const [gradientEditorOpen, setGradientEditorOpen] = useState(false)
  const [editingGradient, setEditingGradient] = useState<CustomGradientConfig | null>(null)
  const [editingGradientString, setEditingGradientString] = useState<string | null>(null)

  const [collections, setCollections] = useLocalStorage<ShareablePalette[]>('palette-collections', [])
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [currentSharePalette, setCurrentSharePalette] = useState<ShareablePalette | null>(null)

  // Check for shared palette in URL on mount
  useEffect(() => {
    const sharedPalette = getPaletteFromUrl();
    if (sharedPalette) {
      (async () => {
        // Show loading screen for shared palette
        setShowLoadingScreen(true);
        setProgress(20);
        setLoadingMessage('Loading shared palette...');
        
        // Extract colors for loading screen
        const colors = sharedPalette.colors.map(c => c.hex);
        setLoadingColors(colors);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(50);
        setLoadingMessage('Applying theme...');
        
        // Convert to ColorAnalysis format
        const analysis: ColorAnalysis = {
          id: `shared-${Date.now()}`,
          dominantColors: sharedPalette.colors,
          semanticColors: identifySemanticColors(sharedPalette.colors),
          imageUrl: '',
          imageName: sharedPalette.name,
          timestamp: sharedPalette.createdAt,
        };
        
        setCurrentAnalysis(analysis);
        if (sharedPalette.themeConfig) {
          pushThemeConfig(sharedPalette.themeConfig);
        }
        if (sharedPalette.customGradients) {
          setCustomGradients(sharedPalette.customGradients);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(70);
        
        // Pre-render preview tab
        setLoadingMessage('Preparing preview...');
        setViewMode('preview');
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(90);
        
        // Switch back to colors
        setViewMode('colors');
        
        setProgress(100);
        setLoadingMessage('Complete!');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowLoadingScreen(false);
        toast.success(`Loaded shared palette: ${sharedPalette.name}`);
        
        // Clear URL parameter
        window.history.replaceState({}, '', window.location.pathname);
      })();
    }
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 100)
      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [isAnalyzing])

  useEffect(() => {
    if (viewMode === 'preview' && currentAnalysis) {
    } else {
      if (previewDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [viewMode, currentAnalysis, previewDarkMode])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    // Undo/Redo - Analysis
    'ctrl+z': () => {
      if (viewMode === 'colors' || viewMode === 'analysis') {
        if (canUndo) {
          undo()
          toast.success('Undid color analysis')
        }
      } else if (viewMode === 'preview' || viewMode === 'export') {
        if (canUndoTheme) {
          undoThemeConfig()
          toast.success('Undid theme change')
        }
      }
    },
    'ctrl+y': () => {
      if (viewMode === 'colors' || viewMode === 'analysis') {
        if (canRedo) {
          redo()
          toast.success('Redid color analysis')
        }
      } else if (viewMode === 'preview' || viewMode === 'export') {
        if (canRedoTheme) {
          redoThemeConfig()
          toast.success('Redid theme change')
        }
      }
    },
    'ctrl+shift+z': () => {
      // Alternative redo shortcut (common on Mac)
      if (viewMode === 'colors' || viewMode === 'analysis') {
        if (canRedo) {
          redo()
          toast.success('Redid color analysis')
        }
      } else if (viewMode === 'preview' || viewMode === 'export') {
        if (canRedoTheme) {
          redoThemeConfig()
          toast.success('Redid theme change')
        }
      }
    },
    // Save current palette
    'ctrl+s': (e) => {
      e.preventDefault()
      if (currentAnalysis) {
        handleSaveToCollection()
      }
    },
    // Export
    'ctrl+e': (e) => {
      e.preventDefault()
      if (currentAnalysis) {
        setViewMode('export')
      }
    },
    // New/Clear
    'ctrl+n': (e) => {
      e.preventDefault()
      if (currentAnalysis) {
        handleClearImage()
        setViewMode('upload')
      }
    },
    // Copy colors
    'ctrl+c': (e) => {
      if (currentAnalysis && viewMode === 'colors') {
        e.preventDefault()
        const colorHexes = currentAnalysis.dominantColors.map(c => c.hex).join(', ')
        navigator.clipboard.writeText(colorHexes)
        toast.success('Colors copied to clipboard!')
      }
    },
    // Share
    'ctrl+shift+s': (e) => {
      e.preventDefault()
      if (currentAnalysis) {
        handleShareCurrent()
      }
    },
    // Toggle dark mode
    'ctrl+d': (e) => {
      e.preventDefault()
      const newMode = !previewDarkMode
      setPreviewDarkMode(newMode)
      toast.success(`${newMode ? 'Dark' : 'Light'} mode enabled`)
    },
    // Clear
    'ctrl+k': (e) => {
      e.preventDefault()
      if (currentAnalysis) {
        handleClearImage()
      }
    },
    // Help
    '?': (e) => {
      e.preventDefault()
      setShowShortcuts(true)
    },
    // Number keys for view modes
    '1': () => setViewMode('upload'),
    '2': () => currentAnalysis && setViewMode('colors'),
    '3': () => currentAnalysis && setViewMode('gradients'),
    '4': () => currentAnalysis && setViewMode('palettes'),
    '5': () => currentAnalysis && setViewMode('preview'),
    '6': () => currentAnalysis && setViewMode('export'),
    '7': () => setViewMode('history'),
    '8': () => currentAnalysis && setViewMode('accessibility'),
    '9': () => currentAnalysis && setViewMode('tools'),
    '0': () => currentAnalysis && setViewMode('analysis'),
    'h': () => setViewMode('collections'),
    // Arrow navigation
    'arrowright': () => {
      const modes: ViewMode[] = ['upload', 'colors', 'gradients', 'palettes', 'preview', 'export', 'history', 'accessibility', 'tools', 'analysis', 'collections']
      const currentIndex = modes.indexOf(viewMode)
      const nextIndex = (currentIndex + 1) % modes.length
      const nextMode = modes[nextIndex]
      if (nextMode === 'upload' || nextMode === 'history' || nextMode === 'collections' || currentAnalysis) {
        setViewMode(nextMode)
      }
    },
    'arrowleft': () => {
      const modes: ViewMode[] = ['upload', 'colors', 'gradients', 'palettes', 'preview', 'export', 'history', 'accessibility', 'tools', 'analysis', 'collections']
      const currentIndex = modes.indexOf(viewMode)
      const prevIndex = (currentIndex - 1 + modes.length) % modes.length
      const prevMode = modes[prevIndex]
      if (prevMode === 'upload' || prevMode === 'history' || prevMode === 'collections' || currentAnalysis) {
        setViewMode(prevMode)
      }
    },
  })

  const handleImageLoad = async (imageUrl: string, imageName: string) => {
    setIsAnalyzing(true)
    setShowLoadingScreen(true)
    setProgress(5)
    setLoadingMessage('Extracting colors...')

    try {
      // Quick color extraction for loading screen
      const quickColors = await quickExtractColors(imageUrl)
      setLoadingColors(quickColors)
      setProgress(15)

      // Full color analysis
      setLoadingMessage('Analyzing color palette...')
      const dominantColors = await extractColorsFromImage(imageUrl)
      setProgress(40)

      setLoadingMessage('Identifying semantic colors...')
      const semanticColors = identifySemanticColors(dominantColors)
      setProgress(55)

      const analysis: ColorAnalysis = {
        id: `analysis-${Date.now()}`,
        imageUrl,
        imageName,
        timestamp: Date.now(),
        dominantColors,
        semanticColors,
      }

      setCurrentAnalysis(analysis)
      setProgress(65)

      setHistory((current) => {
        const updated = [analysis, ...(current || [])].slice(0, 12)
        return updated
      })

      // Pre-render expensive preview tab behind the scenes
      setLoadingMessage('Preparing preview...')
      setViewMode('preview')
      
      // Wait for preview to render and Tailwind to process
      await new Promise(resolve => setTimeout(resolve, 800))
      setProgress(85)
      
      setLoadingMessage('Optimizing performance...')
      await new Promise(resolve => setTimeout(resolve, 400))
      setProgress(95)

      // Switch back to colors view (the intended destination)
      setViewMode('colors')
      
      setLoadingMessage('Complete!')
      setProgress(100)

      // Wait for completion animation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success('Color analysis complete!')
      setShowLoadingScreen(false)
    } catch (error) {
      toast.error('Failed to analyze image. Please try another image.')
      console.error(error)
      setShowLoadingScreen(false)
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false)
        setProgress(0)
        setLoadingColors([])
      }, 300)
    }
  }

  const handleClearImage = useCallback(() => {
    setCurrentAnalysis(null)
    setViewMode('upload')
  }, [setCurrentAnalysis])

  const handleRestoreAnalysis = useCallback((analysis: ColorAnalysis) => {
    setCurrentAnalysis(analysis)
    setViewMode('colors')
    toast.success('Analysis restored')
  }, [setCurrentAnalysis])

  const handleClearHistory = useCallback(() => {
    if (confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
      setHistory([])
      toast.success('History cleared')
    }
  }, [setHistory])

  const handleSaveCustomGradient = (config: CustomGradientConfig) => {
    setCustomGradients((current) => {
      const existing = (current || []).findIndex(g => g.id === config.id)
      if (existing >= 0) {
        const updated = [...(current || [])]
        updated[existing] = config
        toast.success('Gradient updated!')
        return updated
      } else {
        toast.success('Gradient saved!')
        return [...(current || []), config]
      }
    })
    setSelectedGradient(config.gradient)
  }

  const handleOpenGradientEditor = (gradient?: CustomGradientConfig) => {
    setEditingGradient(gradient || null)
    setEditingGradientString(null)
    setGradientEditorOpen(true)
  }

  const handleEditGradientFromCanvas = (gradientString: string, name: string) => {
    setEditingGradient(null)
    setEditingGradientString(gradientString)
    setGradientEditorOpen(true)
    toast.success(`Editing ${name}`)
  }

  const handleSaveToCollection = useCallback(() => {
    if (!currentAnalysis) return;
    
    const palette: ShareablePalette = {
      name: currentAnalysis.imageName || 'Untitled Palette',
      colors: currentAnalysis.dominantColors,
      themeConfig: themeConfig ?? undefined,
      customGradients: customGradients && customGradients.length > 0 ? customGradients : undefined,
      createdAt: Date.now(),
    };
    
    setCollections((current) => {
      const updated = [palette, ...(current || [])];
      toast.success('Palette saved to collections!');
      return updated;
    });
  }, [currentAnalysis, themeConfig, customGradients, setCollections]);

  const handleShareCurrent = useCallback(() => {
    if (!currentAnalysis) return;
    
    const palette: ShareablePalette = {
      name: currentAnalysis.imageName || 'Untitled Palette',
      colors: currentAnalysis.dominantColors,
      themeConfig: themeConfig ?? undefined,
      customGradients: customGradients && customGradients.length > 0 ? customGradients : undefined,
      createdAt: Date.now(),
    };
    
    setCurrentSharePalette(palette);
    setShareModalOpen(true);
  }, [currentAnalysis, themeConfig, customGradients]);

  const handleLoadFromCollection = async (palette: ShareablePalette) => {
    // Show loading screen
    setShowLoadingScreen(true);
    setProgress(20);
    setLoadingMessage('Loading palette from collection...');
    
    const colors = palette.colors.map(c => c.hex);
    setLoadingColors(colors);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setProgress(60);
    setLoadingMessage('Applying theme...');
    
    const analysis: ColorAnalysis = {
      id: `collection-${Date.now()}`,
      dominantColors: palette.colors,
      semanticColors: identifySemanticColors(palette.colors),
      imageUrl: '',
      imageName: palette.name,
      timestamp: palette.createdAt,
    };
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setProgress(90);
    
    setCurrentAnalysis(analysis);
    if (palette.themeConfig) {
      pushThemeConfig(palette.themeConfig);
    }
    if (palette.customGradients) {
      setCustomGradients(palette.customGradients);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    setProgress(75);
    
    // Pre-render preview tab
    setLoadingMessage('Preparing preview...');
    setViewMode('preview');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setProgress(95);
    
    // Switch back to colors
    setViewMode('colors');
    
    setProgress(100);
    setLoadingMessage('Complete!');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setShowLoadingScreen(false);
  };

  const modes = [
    { id: 'upload' as ViewMode, label: 'Upload', icon: ImageIcon },
    { id: 'colors' as ViewMode, label: 'Colors', icon: PaletteIcon },
    { id: 'gradients' as ViewMode, label: 'Gradients', icon: Gradient },
    { id: 'palettes' as ViewMode, label: 'Palettes', icon: Swatches },
    { id: 'analysis' as ViewMode, label: 'Analysis', icon: TrendUp },
    { id: 'accessibility' as ViewMode, label: 'Accessibility', icon: Scan },
    { id: 'tools' as ViewMode, label: 'Tools', icon: Sliders },
    { id: 'preview' as ViewMode, label: 'Preview', icon: Eye },
    { id: 'export' as ViewMode, label: 'Export', icon: FileArrowDown },
    { id: 'collections' as ViewMode, label: 'Collections', icon: FolderOpen },
    { id: 'history' as ViewMode, label: 'History', icon: ClockCounterClockwise },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Toaster position="bottom-right" />
      
      {/* Loading Screen */}
      {showLoadingScreen && (
        <LoadingScreen
          colors={loadingColors}
          progress={progress}
          message={loadingMessage}
          onComplete={() => setShowLoadingScreen(false)}
        />
      )}
      
      <KeyboardShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
      
      {currentSharePalette && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          palette={currentSharePalette}
        />
      )}
      
      <GradientEditorModal
        open={gradientEditorOpen}
        onOpenChange={setGradientEditorOpen}
        initialGradient={editingGradient}
        initialGradientString={editingGradientString || undefined}
        onSave={handleSaveCustomGradient}
        colors={currentAnalysis?.dominantColors || []}
        luminosityAdjustment={gradientLuminosity ?? 0}
        saturation={gradientSaturation ?? 0}
        hueShift={gradientHueShift ?? 0}
      />
      
      <div className="fixed inset-x-0 top-6 z-50 px-8 pointer-events-none">
        <div className="max-w-[1800px] mx-auto flex items-start justify-between gap-4">
          <motion.div
            layout
            ref={containerRef}
            className="pointer-events-auto"
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Card
              className={cn(
                "p-2 gap-0 bg-card/95 backdrop-blur-md text-card-foreground shadow-sm",
                "transition-all duration-300 ease-out will-change-transform origin-left",
                shouldAutoCollapse && "ring-1 ring-primary/20"
              )}
            >
              <div className="flex items-center gap-2">
                {/* Undo/Redo buttons on the left - animate in/out */}
                <div className={cn(
                  "flex items-center gap-2 transition-all duration-300 ease-out overflow-hidden",
                  currentAnalysis ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
                )}>
                  {currentAnalysis && (
                    <>
                      <button
                        onClick={undo}
                        disabled={!canUndo}
                        className={cn(
                          'p-2 rounded-lg transition-all duration-150 shrink-0',
                          'disabled:opacity-30 disabled:cursor-not-allowed',
                          'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
                          'hover:scale-110 active:scale-95'
                        )}
                        title="Undo (Ctrl+Z)"
                      >
                        <ArrowUUpLeft size={20} weight="duotone" />
                      </button>
                      <button
                        onClick={redo}
                        disabled={!canRedo}
                        className={cn(
                          'p-2 rounded-lg transition-all duration-150 shrink-0',
                          'disabled:opacity-30 disabled:cursor-not-allowed',
                          'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
                          'hover:scale-110 active:scale-95'
                        )}
                        title="Redo (Ctrl+Y)"
                      >
                        <ArrowUUpRight size={20} weight="duotone" />
                      </button>
                      <div className="w-px h-8 bg-border mx-1 shrink-0" />
                    </>
                  )}
                </div>
                
                {/* Floating dock buttons - no scrolling */}
                <div className="flex items-center gap-1.5">
                  {modes.map((mode, index) => {
                    const Icon = mode.icon
                    const isDisabled = mode.id !== 'upload' && mode.id !== 'history' && mode.id !== 'collections' && !currentAnalysis
                    
                    // Simple hover logic - only expand hovered button
                    const isHovered = hoveredButtonIndex === index
                    const isExpanded = isHovered
                    
                    return (
                      <button
                        key={mode.id}
                        ref={(el) => registerButton(index, el)}
                        onClick={() => !isDisabled && setViewMode(mode.id)}
                        disabled={isDisabled}
                        style={{
                          transform: isHovered ? 'translateY(-4px) scale(1.08)' : 'translateY(0) scale(1)',
                          zIndex: isHovered ? 10 : 1,
                        }}
                        className={cn(
                          'rounded-lg font-medium text-sm flex items-center whitespace-nowrap',
                          'disabled:opacity-30 disabled:cursor-not-allowed',
                          'transition-[transform,background-color,color,box-shadow] duration-150 ease-out',
                          'p-2.5 relative',
                          viewMode === mode.id
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'hover:bg-accent/80 hover:text-accent-foreground text-muted-foreground',
                          isHovered && 'shadow-lg'
                        )}
                        title={mode.label}
                      >
                        <Icon 
                          size={20} 
                          weight={viewMode === mode.id ? 'fill' : 'regular'}
                          className="shrink-0"
                        />
                        <span className={cn(
                          "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-150 ease-out",
                          isExpanded ? "max-w-[120px] opacity-100 pl-2.5" : "max-w-0 opacity-0"
                        )}>
                          {mode.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                
              </div>
            </Card>
          </motion.div>

          <motion.div
            layout
            className="pointer-events-auto"
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
            onMouseEnter={() => setIsRightDockHovered(true)}
            onMouseLeave={() => {
              setIsRightDockHovered(false)
              setRightDockHoveredIndex(null)
            }}
          >
            <Card
              className="p-2 gap-0 bg-card/95 backdrop-blur-md text-card-foreground shadow-sm transition-all duration-300 ease-out"
            >
              <div className="flex items-center gap-1.5" style={{ minWidth: 'max-content' }}>
                {[
                  {
                    key: 'share',
                    label: 'Share',
                    icon: Share,
                    onClick: handleShareCurrent,
                    title: 'Share Palette (Ctrl+Shift+S)',
                    disabled: !currentAnalysis
                  },
                  {
                    key: 'save',
                    label: 'Save',
                    icon: FolderOpen,
                    onClick: handleSaveToCollection,
                    title: 'Save to Collections (Ctrl+S)',
                    disabled: !currentAnalysis
                  },
                  { key: 'divider-1', type: 'divider' as const },
                  {
                    key: 'help',
                    label: 'Help',
                    icon: Question,
                    onClick: () => setShowShortcuts(true),
                    title: 'Keyboard Shortcuts (?)'
                  },
                  {
                    key: 'theme',
                    label: 'Theme',
                    icon: previewDarkMode ? Sun : Moon,
                    onClick: () => setPreviewDarkMode(!previewDarkMode),
                    title: 'Toggle Theme (Ctrl+D)'
                  }
                ].map((item, index) => {
                  if ('type' in item && item.type === 'divider') {
                    return (
                      <div key={item.key} className="w-px h-6 bg-border mx-0.5 shrink-0" />
                    )
                  }

                  const Icon = item.icon
                  const isExpanded = isRightDockHovered && rightDockHoveredIndex === index

                  return (
                    <button
                      key={item.key}
                      onMouseEnter={() => setRightDockHoveredIndex(index)}
                      onMouseLeave={() => setRightDockHoveredIndex(null)}
                      onClick={item.onClick}
                      disabled={item.disabled}
                      className={cn(
                        'p-2.5 rounded-lg transition-all duration-150 relative flex items-center whitespace-nowrap',
                        'disabled:opacity-30 disabled:cursor-not-allowed',
                        'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
                        'hover:scale-110 active:scale-95'
                      )}
                      title={item.title}
                    >
                      <Icon size={20} weight="duotone" className="shrink-0" />
                      <span className={cn(
                        "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-200 ease-out",
                        isExpanded ? "max-w-[120px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
                      )}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <main className="pt-24 pb-8 px-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            <div className="h-[calc(100vh-8rem)]">
              <Card className="h-full flex flex-col shadow-lg overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                {viewMode === 'upload' && (
                  <div className="h-full flex flex-col">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2">Upload Image</h2>
                      <p className="text-sm text-muted-foreground">
                        Start by uploading an image to extract its color palette
                      </p>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full max-w-2xl">
                        <ImageUpload
                          onImageLoad={handleImageLoad}
                          currentImage={currentAnalysis?.imageUrl}
                          onClear={handleClearImage}
                        />
                        
                        {isAnalyzing && (
                          <Card className="p-6 mt-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Analyzing image...</span>
                                <span className="text-muted-foreground">{progress}%</span>
                              </div>
                              <Progress value={progress} />
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === 'colors' && currentAnalysis && (
                  <ComponentErrorBoundary>
                    <ColorsView colors={currentAnalysis.dominantColors} />
                  </ComponentErrorBoundary>
                )}

                {viewMode === 'gradients' && currentAnalysis && (
                  <ComponentErrorBoundary>
                    <GradientsCanvas 
                    colors={currentAnalysis.dominantColors}
                    grainEnabled={gradientGrainEnabled ?? true}
                    grainIntensity={gradientGrainIntensity ?? 0.08}
                    luminosityAdjustment={gradientLuminosity ?? 0}
                    saturation={gradientSaturation ?? 0}
                    hueShift={gradientHueShift ?? 0}
                    contrast={gradientContrast ?? 0}
                    blurAmount={gradientBlurAmount ?? 0}
                    copiedGradient={copiedGradient}
                    onCopyGradient={(gradient, name) => {
                      setCopiedGradient(name)
                      setSelectedGradient(gradient)
                      setTimeout(() => setCopiedGradient(null), 2000)
                    }}
                    onEditGradient={handleEditGradientFromCanvas}
                  />
                  </ComponentErrorBoundary>
                )}

                {viewMode === 'palettes' && currentAnalysis && (
                  <ComponentErrorBoundary>
                  <>
                    {currentAnalysis.semanticColors.primary ? (
                      <PaletteGenerator baseColor={currentAnalysis.semanticColors.primary} />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <PaletteIcon size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No primary color detected</h3>
                          <p className="text-sm text-muted-foreground">
                            Try uploading an image with more vibrant colors
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                  </ComponentErrorBoundary>
                )}

                {viewMode === 'analysis' && currentAnalysis && (
                  <ComponentErrorBoundary>
                    <ColorAnalysisView colors={currentAnalysis.dominantColors} />
                  </ComponentErrorBoundary>
                )}

                {viewMode === 'accessibility' && currentAnalysis && (
                  <ComponentErrorBoundary>
                    <AccessibilityChecker colors={currentAnalysis.dominantColors} />
                  </ComponentErrorBoundary>
                )}

                {viewMode === 'tools' && currentAnalysis && (
                  <ComponentErrorBoundary>
                    <div className="space-y-6">
                      <ColorMixer colors={currentAnalysis.dominantColors} />
                      <TintShadeGenerator colors={currentAnalysis.dominantColors} />
                      <ColorAdjuster colors={currentAnalysis.dominantColors} />
                    </div>
                  </ComponentErrorBoundary>
                )}

                {/* Preview tab - kept mounted to avoid rehydration lag */}
                {currentAnalysis && (
                  <div style={{ display: viewMode === 'preview' ? 'block' : 'none' }}>
                    <ComponentErrorBoundary>
                      <div 
                        style={
                          colorBlindFilterEnabled && colorBlindFilterType !== 'none'
                            ? { filter: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="colorblind"><feColorMatrix type="matrix" values="${getColorBlindMatrix(colorBlindFilterType)}"/></filter></svg>#colorblind')` }
                            : {}
                        }
                      >
                        <UIPreview 
                          colors={currentAnalysis.dominantColors} 
                          config={themeConfig ?? defaultThemeConfig}
                          backgroundStyle={previewBackgroundStyle ?? 'mesh'}
                          previewMode={previewMode ?? 'landing'}
                          previewDarkMode={previewDarkMode ?? false}
                          luminosity={gradientLuminosity ?? 0}
                          customGradient={selectedGradient}
                        />
                      </div>
                    </ComponentErrorBoundary>
                  </div>
                )}
                
                {viewMode === 'preview' && !currentAnalysis && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Eye size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No analysis available</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload an image to preview your theme
                      </p>
                    </div>
                  </div>
                )}

                {viewMode === 'export' && currentAnalysis && (
                  <ComponentErrorBoundary>
                  <ThemeExporter 
                    colors={currentAnalysis.dominantColors}
                    sharedConfig={themeConfig}
                    luminosity={gradientLuminosity ?? 0}
                    customGradients={customGradients ?? []}
                    previewDarkMode={previewDarkMode ?? false}
                    selectedGradient={selectedGradient}
                    backgroundStyle={previewBackgroundStyle ?? 'solid'}
                  />
                  </ComponentErrorBoundary>
                )}

                {viewMode === 'history' && (
                  <AnalysisHistory 
                    history={history || []} 
                    onRestore={handleRestoreAnalysis}
                    onClearHistory={handleClearHistory}
                  />
                )}

                {viewMode === 'collections' && (
                  <PaletteCollections
                    collections={collections || []}
                    onAdd={(palette) => setCollections([...(collections || []), palette])}
                    onRemove={(index) => {
                      const newCollections = [...(collections || [])];
                      newCollections.splice(index, 1);
                      setCollections(newCollections);
                    }}
                    onLoad={handleLoadFromCollection}
                  />
                )}
                </div>
              </Card>
            </div>

            <div className="h-[calc(100vh-8rem)]">
              <Card className="h-full flex flex-col shadow-lg overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Properties
                  </h3>
                  
                  {viewMode === 'upload' && (
                    <div className="space-y-4">
                      {!currentAnalysis ? (
                        <div className="text-center py-12">
                          <ImageIcon size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Upload an image to begin
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-medium mb-3 text-muted-foreground">Current Image</p>
                            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                              {currentAnalysis.imageUrl ? (
                                <img 
                                  src={currentAnalysis.imageUrl} 
                                  alt={currentAnalysis.imageName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                    <Swatches size={32} weight="duotone" className="text-primary" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-foreground">Shared Palette</p>
                                    <p className="text-xs text-muted-foreground">No source image</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 truncate">
                              {currentAnalysis.imageName}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium mb-3 text-muted-foreground">Analysis Info</p>
                            <div className="text-xs space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Colors Extracted:</span>
                                <span className="font-medium">{currentAnalysis.dominantColors.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Analyzed:</span>
                                <span className="font-medium">{new Date(currentAnalysis.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {viewMode === 'colors' && currentAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Source Image</p>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                          {currentAnalysis.imageUrl ? (
                            <img 
                              src={currentAnalysis.imageUrl} 
                              alt={currentAnalysis.imageName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                              <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <Swatches size={32} weight="duotone" className="text-primary" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-foreground">Shared Palette</p>
                                <p className="text-xs text-muted-foreground">No source image</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Color Info</p>
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Colors:</span>
                            <span className="font-medium">{currentAnalysis.dominantColors.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dominant Color:</span>
                            <span className="font-medium">{currentAnalysis.dominantColors[0]?.hex || 'N/A'}</span>
                          </div>
                          {currentAnalysis.semanticColors.primary && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Primary Color:</span>
                              <span className="font-medium">{currentAnalysis.semanticColors.primary.hex}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'gradients' && currentAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Source Image</p>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                          {currentAnalysis.imageUrl ? (
                            <img 
                              src={currentAnalysis.imageUrl} 
                              alt={currentAnalysis.imageName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                              <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <Swatches size={32} weight="duotone" className="text-primary" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-foreground">Shared Palette</p>
                                <p className="text-xs text-muted-foreground">No source image</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-xs font-medium mb-4 text-muted-foreground">Gradient Controls</p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Scan size={16} weight="duotone" className="text-muted-foreground" />
                              <Label htmlFor="grad-grain" className="text-sm cursor-pointer">
                                Grain Texture
                              </Label>
                            </div>
                            <Switch
                              id="grad-grain"
                              checked={gradientGrainEnabled ?? true}
                              onCheckedChange={setGradientGrainEnabled}
                            />
                          </div>
                          
                          {(gradientGrainEnabled ?? true) && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <Label>Grain Intensity</Label>
                                <span className="text-muted-foreground">{Math.round((gradientGrainIntensity ?? 0.08) * 100)}%</span>
                              </div>
                              <Slider
                                min={0.02}
                                max={0.2}
                                step={0.01}
                                value={[gradientGrainIntensity ?? 0.08]}
                                onValueChange={(value) => setGradientGrainIntensity(value[0])}
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <Label>Luminosity</Label>
                              <span className="text-muted-foreground">
                                {(gradientLuminosity ?? 0) > 0 ? '+' : ''}{gradientLuminosity ?? 0}
                              </span>
                            </div>
                            <Slider
                              min={-50}
                              max={50}
                              step={5}
                              value={[gradientLuminosity ?? 0]}
                              onValueChange={(value) => setGradientLuminosity(value[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Darker</span>
                              <span>Lighter</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <Label>Saturation</Label>
                              <span className="text-muted-foreground">
                                {(gradientSaturation ?? 0) > 0 ? '+' : ''}{gradientSaturation ?? 0}
                              </span>
                            </div>
                            <Slider
                              min={-50}
                              max={50}
                              step={5}
                              value={[gradientSaturation ?? 0]}
                              onValueChange={(value) => setGradientSaturation(value[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Less</span>
                              <span>More</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <Label>Hue Shift</Label>
                              <span className="text-muted-foreground">{gradientHueShift ?? 0}°</span>
                            </div>
                            <Slider
                              min={-180}
                              max={180}
                              step={10}
                              value={[gradientHueShift ?? 0]}
                              onValueChange={(value) => setGradientHueShift(value[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>-180°</span>
                              <span>+180°</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <Label>Blur Amount</Label>
                              <span className="text-muted-foreground">{gradientBlurAmount ?? 0}px</span>
                            </div>
                            <Slider
                              min={0}
                              max={50}
                              step={5}
                              value={[gradientBlurAmount ?? 0]}
                              onValueChange={(value) => setGradientBlurAmount(value[0])}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <Label>Contrast</Label>
                              <span className="text-muted-foreground">
                                {(gradientContrast ?? 0) > 0 ? '+' : ''}{gradientContrast ?? 0}%
                              </span>
                            </div>
                            <Slider
                              min={-50}
                              max={50}
                              step={5}
                              value={[gradientContrast ?? 0]}
                              onValueChange={(value) => setGradientContrast(value[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Low</span>
                              <span>High</span>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <Button
                              variant="outline"
                              onClick={() => handleOpenGradientEditor()}
                              className="w-full gap-2"
                            >
                              <Plus size={16} />
                              Create Custom Gradient
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'palettes' && currentAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Base Color</p>
                        {currentAnalysis.semanticColors.primary ? (
                          <div className="flex h-12 rounded-md overflow-hidden border">
                            <div
                              className="flex-1"
                              style={{ backgroundColor: currentAnalysis.semanticColors.primary.hex }}
                            />
                            <div className="flex items-center px-3 bg-card text-xs font-mono">
                              {currentAnalysis.semanticColors.primary.hex}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No primary color detected</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Palette Info</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Explore various color harmonies generated from the extracted colors. Each palette type offers different aesthetic possibilities.
                        </p>
                      </div>
                    </div>
                  )}

                  {viewMode === 'analysis' && currentAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Color Analysis</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Deep analysis of your palette including harmony scoring, emotional associations, industry suggestions, and similar curated palettes.
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Features</p>
                        <div className="text-xs space-y-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Harmony Score</span>
                            <span className="text-muted-foreground">Analyze color relationships</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Emotions</span>
                            <span className="text-muted-foreground">Psychological associations</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Industries</span>
                            <span className="text-muted-foreground">Best use case suggestions</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Similar Palettes</span>
                            <span className="text-muted-foreground">Find matching color schemes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'accessibility' && currentAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Accessibility Info</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Check WCAG 2.1 compliance for your color palette. Select foreground and background colors to test contrast ratios and get accessibility recommendations.
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Standards</p>
                        <div className="text-xs space-y-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">AA (4.5:1)</span>
                            <span className="text-muted-foreground">Minimum for normal text</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">AAA (7:1)</span>
                            <span className="text-muted-foreground">Enhanced for normal text</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">AA Large (3:1)</span>
                            <span className="text-muted-foreground">Large text (18pt+ or 14pt+ bold)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'tools' && currentAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Color Tools</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Mix colors, generate tints and shades, and fine-tune with temperature, saturation, and brightness adjustments.
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Available Tools</p>
                        <div className="text-xs space-y-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Color Mixer</span>
                            <span className="text-muted-foreground">Mix two colors and create scales</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Tint & Shade Generator</span>
                            <span className="text-muted-foreground">Create lighter and darker variations</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Color Adjuster</span>
                            <span className="text-muted-foreground">Fine-tune with sliders and harmonies</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'preview' && currentAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Theme Mode</p>
                        <button
                          onClick={() => {
                            setPreviewDarkMode(!previewDarkMode)
                          }}
                          className="w-full px-4 py-2.5 rounded-md border bg-card hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between text-sm"
                        >
                          <span>{previewDarkMode ? 'Dark' : 'Light'} Mode</span>
                          {previewDarkMode ? <Moon size={16} weight="fill" /> : <Sun size={16} weight="fill" />}
                        </button>
                      </div>

                      <Separator />

                      <UIPreviewControls
                        config={themeConfig ?? defaultThemeConfig}
                        onConfigChange={pushThemeConfig}
                        backgroundStyle={previewBackgroundStyle ?? 'mesh'}
                        onBackgroundStyleChange={setPreviewBackgroundStyle}
                        previewMode={previewMode ?? 'landing'}
                        onPreviewModeChange={setPreviewMode}
                        luminosity={gradientLuminosity ?? 0}
                        onLuminosityChange={setGradientLuminosity}
                        selectedGradient={selectedGradient}
                        onGradientSelect={setSelectedGradient}
                        customGradients={customGradients ?? []}
                        onOpenGradientEditor={handleOpenGradientEditor}
                        colors={currentAnalysis.dominantColors}
                        colorBlindFilterType={colorBlindFilterType}
                        onColorBlindFilterTypeChange={setColorBlindFilterType}
                        colorBlindFilterEnabled={colorBlindFilterEnabled}
                        onColorBlindFilterEnabledChange={setColorBlindFilterEnabled}
                      />
                    </div>
                  )}

                  {viewMode === 'export' && currentAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Export Options</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          Choose your preferred format and copy the generated code to use in your projects.
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground flex items-center gap-2">
                          <FileArrowDown size={14} weight="duotone" />
                          Usage Instructions
                        </p>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary font-semibold">1.</span>
                            <span>Copy the CSS code from the viewer</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary font-semibold">2.</span>
                            <span>Paste into your <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">src/index.css</code> file</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary font-semibold">3.</span>
                            <span>Replace existing <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">:root</code> and <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">@theme</code> blocks</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary font-semibold">4.</span>
                            <span>All Shadcn components will automatically use the new theme</span>
                          </li>
                          {(customGradients?.filter(grad => 
                            themeConfig?.buttonCustomGradient === grad.gradient || 
                            themeConfig?.cardCustomGradient === grad.gradient || 
                            selectedGradient === grad.gradient
                          ).length ?? 0) > 0 && (
                            <li className="flex gap-2">
                              <span className="text-primary font-semibold">5.</span>
                              <span>Custom gradients are ready to use - see the Gradients tab</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Applied Settings</p>
                        <div className="flex flex-wrap gap-1.5">
                          {themeConfig?.radius && <Badge variant="secondary" className="text-[10px]">Radius: {themeConfig.radius}</Badge>}
                          {themeConfig?.shadows && <Badge variant="secondary" className="text-[10px]">Shadows: {themeConfig.shadows}</Badge>}
                          {themeConfig?.buttonGradient && themeConfig.buttonGradient !== 'none' && <Badge variant="secondary" className="text-[10px]">Button: {themeConfig.buttonGradient}</Badge>}
                          {themeConfig?.cardGradient && themeConfig.cardGradient !== 'none' && <Badge variant="secondary" className="text-[10px]">Card: {themeConfig.cardGradient}</Badge>}
                          {(gradientLuminosity ?? 0) !== 0 && <Badge variant="secondary" className="text-[10px]">Luminosity: {(gradientLuminosity ?? 0) > 0 ? '+' : ''}{gradientLuminosity}</Badge>}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Theme Colors</p>
                        <div className="space-y-2">
                          {currentAnalysis.semanticColors.primary && (
                            <div className="flex h-8 rounded-md overflow-hidden border">
                              <div className="flex-1" style={{ backgroundColor: currentAnalysis.semanticColors.primary.hex }} />
                              <div className="flex items-center px-2 bg-card text-xs font-mono">
                                {currentAnalysis.semanticColors.primary.hex}
                              </div>
                            </div>
                          )}
                          {currentAnalysis.semanticColors.accent && (
                            <div className="flex h-8 rounded-md overflow-hidden border">
                              <div className="flex-1" style={{ backgroundColor: currentAnalysis.semanticColors.accent.hex }} />
                              <div className="flex items-center px-2 bg-card text-xs font-mono">
                                {currentAnalysis.semanticColors.accent.hex}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {(customGradients?.filter(grad => 
                        themeConfig?.buttonCustomGradient === grad.gradient || 
                        themeConfig?.cardCustomGradient === grad.gradient || 
                        selectedGradient === grad.gradient
                      ).length ?? 0) > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-xs font-medium mb-3 text-muted-foreground">Used Custom Gradients</p>
                            <div className="space-y-2">
                              {customGradients?.filter(grad => 
                                themeConfig?.buttonCustomGradient === grad.gradient || 
                                themeConfig?.cardCustomGradient === grad.gradient || 
                                selectedGradient === grad.gradient
                              ).map((grad) => (
                                <div key={grad.id} className="flex items-center gap-2">
                                  <div 
                                    className="w-10 h-6 rounded border border-border shrink-0" 
                                    style={{ background: grad.gradient }}
                                  />
                                  <span className="text-[10px] text-muted-foreground truncate">{grad.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {viewMode === 'history' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">History Info</p>
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Analyses:</span>
                            <span className="font-medium">{history?.length ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Stored:</span>
                            <span className="font-medium">12</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Recent Activity</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Click on any analysis to restore it and continue working with that color palette.
                        </p>
                      </div>
                    </div>
                  )}

                  {viewMode === 'collections' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Collections Info</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Save, organize, and share your favorite color palettes. Import and export collections as JSON files.
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-3 text-muted-foreground">Features</p>
                        <div className="text-xs space-y-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Save & Load</span>
                            <span className="text-muted-foreground">Store palettes locally</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Share</span>
                            <span className="text-muted-foreground">Generate shareable links</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">Export</span>
                            <span className="text-muted-foreground">Download as JSON or ZIP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App