import { useEffect, useState, useRef, useCallback } from 'react'

interface UseAutoCollapseOptions {
    /** Width threshold below which to auto-collapse (default: 1400px) */
    threshold?: number
    /** Whether the user has manually collapsed the navbar */
    manuallyCollapsed?: boolean
}

/**
 * Optimized hook for smart navbar auto-collapse with per-button hover detection
 * Uses CSS :hover for better performance instead of JS calculations
 */
export function useAutoCollapse({
    threshold = 1400,
    manuallyCollapsed = false,
}: UseAutoCollapseOptions = {}) {
    const [shouldAutoCollapse, setShouldAutoCollapse] = useState(false)
    const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Register button ref
    const registerButton = useCallback((index: number, element: HTMLButtonElement | null) => {
        if (element) {
            buttonRefs.current.set(index, element)
        } else {
            buttonRefs.current.delete(index)
        }
    }, [])

    // Check viewport width - debounce for better performance
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null

        const checkWidth = () => {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const viewportWidth = window.innerWidth
                    setShouldAutoCollapse(viewportWidth < threshold)
                }
            }, 100)
        }

        checkWidth()
        window.addEventListener('resize', checkWidth)

        return () => {
            window.removeEventListener('resize', checkWidth)
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [threshold])

    const isGloballyCollapsed = manuallyCollapsed || shouldAutoCollapse

    // Simplified hover detection - let CSS handle most of the work
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isGloballyCollapsed) return

        // Debounce hover updates to reduce state changes
        if (hoverTimeoutRef.current) {
            return
        }

        hoverTimeoutRef.current = setTimeout(() => {
            hoverTimeoutRef.current = null
        }, 50) // 50ms throttle

        const mouseX = e.clientX
        const mouseY = e.clientY

        let hoveredIndex: number | null = null

        // Quick bounds check - only check visible buttons
        buttonRefs.current.forEach((button, index) => {
            const rect = button.getBoundingClientRect()

            // Simplified hit detection
            if (
                mouseX >= rect.left &&
                mouseX <= rect.right &&
                mouseY >= rect.top &&
                mouseY <= rect.bottom
            ) {
                hoveredIndex = index
            }
        })

        setHoveredButtonIndex(hoveredIndex)
    }, [isGloballyCollapsed])

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        setHoveredButtonIndex(null)
    }, [])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
            }
        }
    }, [])

    return {
        containerRef,
        isGloballyCollapsed,
        shouldAutoCollapse,
        hoveredButtonIndex,
        handleMouseMove,
        handleMouseLeave,
        registerButton,
    }
}
