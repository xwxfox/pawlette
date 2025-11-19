import { useEffect, useRef } from 'react'

interface GrainOverlayProps {
  intensity?: number
  className?: string
}

export function GrainOverlay({ intensity = 0.08, className = '' }: GrainOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 300
    const height = 300
    canvas.width = width
    canvas.height = height

    const imageData = ctx.createImageData(width, height)
    const buffer = new Uint32Array(imageData.data.buffer)

    for (let i = 0; i < buffer.length; i++) {
      const gray = Math.random() * 255
      const alpha = Math.floor(intensity * 255)
      buffer[i] = (alpha << 24) | (gray << 16) | (gray << 8) | gray
    }

    ctx.putImageData(imageData, 0, 0)
  }, [intensity])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 1,
        mixBlendMode: 'overlay',
        imageRendering: 'pixelated',
      }}
    />
  )
}
