/**
 * Quick color extraction for loading screen
 * Uses canvas sampling at lower resolution for speed
 */
export async function quickExtractColors(imageUrl: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
            try {
                // Use smaller canvas for speed (50x50 is enough)
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    reject(new Error('Could not get canvas context'))
                    return
                }

                // Sample at low resolution for speed
                const sampleSize = 50
                canvas.width = sampleSize
                canvas.height = sampleSize

                ctx.drawImage(img, 0, 0, sampleSize, sampleSize)
                const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
                const pixels = imageData.data

                // Quick color bucketing (8x8x8 = 512 buckets)
                const colorBuckets = new Map<string, number>()

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i]
                    const g = pixels[i + 1]
                    const b = pixels[i + 2]
                    const a = pixels[i + 3]

                    // Skip transparent pixels
                    if (a < 128) continue

                    // Bucket colors (reduce precision for speed)
                    const bucketR = Math.floor(r / 32) * 32
                    const bucketG = Math.floor(g / 32) * 32
                    const bucketB = Math.floor(b / 32) * 32

                    const key = `${bucketR},${bucketG},${bucketB}`
                    colorBuckets.set(key, (colorBuckets.get(key) || 0) + 1)
                }

                // Get top 5 colors
                const sortedColors = Array.from(colorBuckets.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([color]) => {
                        const [r, g, b] = color.split(',').map(Number)
                        return `rgb(${r}, ${g}, ${b})`
                    })

                resolve(sortedColors.length > 0 ? sortedColors : ['rgb(100, 100, 100)', 'rgb(150, 150, 150)'])
            } catch (error) {
                reject(error)
            }
        }

        img.onerror = () => {
            reject(new Error('Failed to load image'))
        }

        img.src = imageUrl
    })
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(rgb: string): string {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return '#666666'

    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
