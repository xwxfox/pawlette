import { useState, useEffect, useCallback } from 'react'
import { compressToUTF16, decompressFromUTF16 } from 'lz-string'
import { toast } from 'sonner'

/**
 * Enhanced localStorage hook with compression and quota management
 */
export function useCompressedLocalStorage<T>(
    key: string,
    initialValue: T,
    options: {
        compress?: boolean
        maxAge?: number // in milliseconds
        onQuotaExceeded?: () => void
    } = {}
): [T, (value: T | ((val: T) => T)) => void, () => void] {
    const { compress = true, maxAge, onQuotaExceeded } = options

    // Get stored value
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue
        }

        try {
            const item = window.localStorage.getItem(key)
            if (!item) {
                return initialValue
            }

            let parsed: any
            if (compress) {
                const decompressed = decompressFromUTF16(item)
                parsed = decompressed ? JSON.parse(decompressed) : initialValue
            } else {
                parsed = JSON.parse(item)
            }

            // Check if data has expired
            if (maxAge && parsed._timestamp) {
                const age = Date.now() - parsed._timestamp
                if (age > maxAge) {
                    window.localStorage.removeItem(key)
                    return initialValue
                }
                // Return data without timestamp
                const { _timestamp, ...data } = parsed
                return data as T
            }

            return parsed as T
        } catch (error) {
            console.error(`Error loading localStorage key "${key}":`, error)
            return initialValue
        }
    })

    // Check localStorage quota
    const checkQuota = useCallback((): boolean => {
        try {
            // Estimate current usage
            let totalSize = 0
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key) {
                    const value = localStorage.getItem(key)
                    if (value) {
                        totalSize += key.length + value.length
                    }
                }
            }

            // Most browsers allow ~5-10MB, we'll use 5MB as safe limit
            const quotaLimit = 5 * 1024 * 1024 // 5MB in bytes
            const usagePercent = (totalSize / quotaLimit) * 100

            if (usagePercent > 90) {
                console.warn(`localStorage usage at ${usagePercent.toFixed(1)}%`)
                onQuotaExceeded?.()
                return false
            }

            return true
        } catch (error) {
            console.error('Error checking localStorage quota:', error)
            return false
        }
    }, [onQuotaExceeded])

    // Clear old data when quota is exceeded
    const clearOldData = useCallback(() => {
        try {
            const keys: { key: string; timestamp: number }[] = []

            // Collect all keys with timestamps
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key !== 'theme-config') { // Don't remove critical data
                    try {
                        const item = localStorage.getItem(key)
                        if (item) {
                            let data
                            try {
                                const decompressed = decompressFromUTF16(item)
                                data = decompressed ? JSON.parse(decompressed) : JSON.parse(item)
                            } catch {
                                data = JSON.parse(item)
                            }

                            if (data._timestamp) {
                                keys.push({ key, timestamp: data._timestamp })
                            }
                        }
                    } catch {
                        // Skip invalid items
                    }
                }
            }

            // Sort by timestamp (oldest first)
            keys.sort((a, b) => a.timestamp - b.timestamp)

            // Remove oldest 25% of items
            const toRemove = Math.ceil(keys.length * 0.25)
            for (let i = 0; i < toRemove; i++) {
                localStorage.removeItem(keys[i].key)
            }

            toast.info('Cleaned up old data to free storage space')
        } catch (error) {
            console.error('Error clearing old data:', error)
        }
    }, [])

    // Save to localStorage
    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value
                setStoredValue(valueToStore)

                if (typeof window !== 'undefined') {
                    // Add timestamp if maxAge is set
                    const dataToStore = maxAge
                        ? { ...valueToStore, _timestamp: Date.now() }
                        : valueToStore

                    let stringValue = JSON.stringify(dataToStore)

                    // Compress if enabled
                    if (compress) {
                        stringValue = compressToUTF16(stringValue)
                    }

                    // Check quota before saving
                    if (!checkQuota()) {
                        clearOldData()
                    }

                    try {
                        window.localStorage.setItem(key, stringValue)
                    } catch (error: any) {
                        if (error.name === 'QuotaExceededError') {
                            console.error('localStorage quota exceeded, attempting cleanup...')
                            clearOldData()
                            // Retry after cleanup
                            try {
                                window.localStorage.setItem(key, stringValue)
                            } catch (retryError) {
                                toast.error('Storage quota exceeded. Please clear some data.')
                                onQuotaExceeded?.()
                            }
                        } else {
                            throw error
                        }
                    }
                }
            } catch (error) {
                console.error(`Error saving localStorage key "${key}":`, error)
                toast.error('Failed to save data')
            }
        },
        [key, storedValue, compress, maxAge, checkQuota, clearOldData, onQuotaExceeded]
    )

    // Remove item from localStorage
    const removeValue = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key)
                setStoredValue(initialValue)
            }
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error)
        }
    }, [key, initialValue])

    return [storedValue, setValue, removeValue]
}

/**
 * Get localStorage usage statistics
 */
export function getLocalStorageStats(): {
    used: number
    available: number
    percentage: number
    formattedUsed: string
    formattedAvailable: string
} {
    let totalSize = 0

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key) {
                const value = localStorage.getItem(key)
                if (value) {
                    totalSize += key.length + value.length
                }
            }
        }
    } catch (error) {
        console.error('Error calculating localStorage stats:', error)
    }

    const available = 5 * 1024 * 1024 // 5MB estimate
    const percentage = (totalSize / available) * 100

    const formatBytes = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    return {
        used: totalSize,
        available,
        percentage,
        formattedUsed: formatBytes(totalSize),
        formattedAvailable: formatBytes(available),
    }
}
