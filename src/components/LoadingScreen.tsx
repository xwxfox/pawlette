import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'

interface LoadingScreenProps {
  colors: string[]
  progress: number
  message?: string
  onComplete?: () => void
}

export function LoadingScreen({ colors, progress, message = 'Analyzing colors...', onComplete }: LoadingScreenProps) {
  const [showComplete, setShowComplete] = useState(false)

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setShowComplete(true)
        setTimeout(() => {
          onComplete?.()
        }, 300)
      }, 400)
    }
  }, [progress, onComplete])

  // Create gradient from extracted colors
  const gradient = colors.length >= 2
    ? `linear-gradient(135deg, ${colors.join(', ')})`
    : colors[0] || '#1a1a1a'

  return (
    <AnimatePresence>
      {!showComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: gradient,
          }}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8 px-8">
            {/* Animated icon */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative"
            >
              <Sparkle size={64} weight="fill" className="text-white drop-shadow-2xl" />
              
              {/* Orbiting dots */}
              {[0, 120, 240].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                  style={{
                    originX: '50%',
                    originY: '50%',
                  }}
                  animate={{
                    rotate: [angle, angle + 360],
                    x: [
                      Math.cos((angle * Math.PI) / 180) * 50,
                      Math.cos(((angle + 360) * Math.PI) / 180) * 50,
                    ],
                    y: [
                      Math.sin((angle * Math.PI) / 180) * 50,
                      Math.sin(((angle + 360) * Math.PI) / 180) * 50,
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>

            {/* Text content */}
            <div className="text-center space-y-4">
              <motion.h2
                className="text-4xl font-bold text-white drop-shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {message}
              </motion.h2>

              {/* Progress bar */}
              <div className="w-80 max-w-full mx-auto">
                <motion.div
                  className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="h-full bg-white rounded-full shadow-lg"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </motion.div>
                <motion.p
                  className="text-white/80 text-sm mt-2 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {Math.round(progress)}%
                </motion.p>
              </div>
            </div>

            {/* Color swatches preview */}
            {colors.length > 0 && (
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {colors.slice(0, 5).map((color, i) => (
                  <motion.div
                    key={i}
                    className="w-12 h-12 rounded-lg shadow-xl border-2 border-white/30"
                    style={{ backgroundColor: color }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.6 + i * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Particle effects */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
