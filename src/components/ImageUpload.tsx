import { useState, useCallback } from 'react'
import { Upload, Image as ImageIcon, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface ImageUploadProps {
  onImageLoad: (imageUrl: string, imageName: string) => void
  currentImage?: string
  onClear: () => void
}

export function ImageUpload({ onImageLoad, currentImage, onClear }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageLoad(e.target.result as string, file.name)
        }
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Please drop an image file')
    }
  }, [onImageLoad])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageLoad(e.target.result as string, file.name)
        }
      }
      reader.readAsDataURL(file)
    }
  }, [onImageLoad])

  const handleUrlSubmit = useCallback(async () => {
    if (!imageUrl.trim()) return

    setIsLoadingUrl(true)
    
    const loadImage = async (url: string, useCORS: boolean = true): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        if (useCORS) {
          img.crossOrigin = 'anonymous'
        }
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Image load failed'))
        img.src = url
      })
    }

    const corsProxies = [
      '', // Try direct first
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
    ]

    let lastError: Error | null = null
    
    for (let i = 0; i < corsProxies.length; i++) {
      try {
        const proxyUrl = corsProxies[i] + (i > 0 ? encodeURIComponent(imageUrl) : imageUrl)
        const useCORS = i === 0 // Only use CORS for direct attempt
        
        await loadImage(proxyUrl, useCORS)
        
        onImageLoad(proxyUrl, 'URL Image')
        setImageUrl('')
        
        if (i > 0) {
          toast.success('Image loaded using CORS proxy')
        } else {
          toast.success('Image loaded successfully')
        }
        
        setIsLoadingUrl(false)
        return
      } catch (error) {
        lastError = error as Error
        // Continue to next proxy
        if (i < corsProxies.length - 1) {
          console.log(`Attempt ${i + 1} failed, trying next method...`)
        }
      }
    }

    // All attempts failed
    setIsLoadingUrl(false)
    toast.error('Failed to load image from URL. Please try downloading it and uploading as a file instead.')
    console.error('Image load error:', lastError)
  }, [imageUrl, onImageLoad])

  if (currentImage) {
    return (
      <Card className="relative overflow-hidden">
        <img src={currentImage} alt="Uploaded" className="w-full h-64 object-cover" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onClear}
        >
          <X weight="bold" />
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card
        className={`relative border-2 border-dashed transition-all duration-200 ${
          isDragging ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-border'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="flex flex-col items-center justify-center h-64 cursor-pointer p-6 text-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <Upload size={48} className="text-muted-foreground mb-4" weight="duotone" />
          <h3 className="text-lg font-semibold mb-2">Drop an image here</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse (JPG, PNG, WebP, GIF)
          </p>
          <span className="text-sm font-semibold text-primary">Choose File</span>
        </label>
      </Card>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Paste image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim() || isLoadingUrl}>
          {isLoadingUrl ? 'Loading...' : 'Load'}
        </Button>
      </div>
    </div>
  )
}
