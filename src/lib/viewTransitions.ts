/**
 * Utility for smooth theme transitions using View Transition API
 */

/**
 * Check if View Transitions API is supported
 */
export function isViewTransitionSupported(): boolean {
    return 'startViewTransition' in document
}

/**
 * Execute a DOM update with smooth transition
 * Falls back to immediate update if API not supported
 */
export async function withViewTransition(updateCallback: () => void | Promise<void>): Promise<void> {
    if (!isViewTransitionSupported()) {
        // Fallback: use CSS transition
        document.documentElement.classList.add('theme-transitioning')
        await updateCallback()
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning')
        }, 300)
        return
    }

    // Use View Transition API
    const transition = (document as any).startViewTransition(async () => {
        await updateCallback()
    })

    try {
        await transition.finished
    } catch (error) {
        console.error('View transition failed:', error)
    }
}

/**
 * Specific function for theme transitions
 */
export async function transitionTheme(isDark: boolean, callback: () => void): Promise<void> {
    await withViewTransition(() => {
        callback()
    })
}
