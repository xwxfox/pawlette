import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'

/**
 * Type-safe localStorage wrapper with React hooks
 * Replaces GitHub Spark's useKV with a similar API
 */

interface StorageOptions {
    /** Serialize custom types (default: JSON.stringify) */
    serialize?: (value: any) => string
    /** Deserialize custom types (default: JSON.parse) */
    deserialize?: (value: string) => any
    /** Called when storage event occurs from another tab */
    onStorageChange?: (newValue: any) => void
}

/**
 * Custom error for storage operations
 */
class StorageError extends Error {
    constructor(message: string, public readonly key: string) {
        super(message)
        this.name = 'StorageError'
    }
}

/**
 * Get value from localStorage with type safety
 */
export function getStorageItem<T>(key: string, defaultValue: T, options?: StorageOptions): T {
    try {
        const item = localStorage.getItem(key)
        if (item === null) {
            return defaultValue
        }

        const deserialize = options?.deserialize || JSON.parse
        return deserialize(item) as T
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error)
        return defaultValue
    }
}

/**
 * Set value in localStorage with type safety
 */
export function setStorageItem<T>(key: string, value: T, options?: StorageOptions): void {
    try {
        const serialize = options?.serialize || JSON.stringify
        localStorage.setItem(key, serialize(value))
    } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error)
        throw new StorageError(`Failed to write to localStorage: ${error}`, key)
    }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error)
    }
}

/**
 * Clear all items from localStorage
 */
export function clearStorage(): void {
    try {
        localStorage.clear()
    } catch (error) {
        console.error('Error clearing localStorage:', error)
    }
}

/**
 * Get all keys from localStorage with optional prefix filter
 */
export function getStorageKeys(prefix?: string): string[] {
    try {
        const keys: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (!prefix || key.startsWith(prefix))) {
                keys.push(key)
            }
        }
        return keys
    } catch (error) {
        console.error('Error reading localStorage keys:', error)
        return []
    }
}

/**
 * React hook for localStorage with automatic persistence and synchronization
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark')
 * const [config, setConfig] = useLocalStorage('app-config', defaultConfig)
 * 
 * @param key - Storage key (will be prefixed with 'Pawlette:')
 * @param initialValue - Default value if key doesn't exist
 * @param options - Serialization and event handler options
 * @returns [value, setValue] tuple similar to useState
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    options?: StorageOptions
): [T, Dispatch<SetStateAction<T>>] {
    // Prefix all keys to avoid conflicts
    const prefixedKey = `Pawlette:${key}`

    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(() => {
        return getStorageItem(prefixedKey, initialValue, options)
    })

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage
    const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value

            // Save state
            setStoredValue(valueToStore)

            // Save to localStorage
            setStorageItem(prefixedKey, valueToStore, options)
        } catch (error) {
            console.error(`Error setting localStorage key "${prefixedKey}":`, error)
        }
    }, [prefixedKey, storedValue, options])

    // Listen for changes in other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === prefixedKey && e.newValue !== null) {
                try {
                    const deserialize = options?.deserialize || JSON.parse
                    const newValue = deserialize(e.newValue) as T
                    setStoredValue(newValue)
                    options?.onStorageChange?.(newValue)
                } catch (error) {
                    console.error(`Error parsing storage event for "${prefixedKey}":`, error)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [prefixedKey, options])

    return [storedValue, setValue]
}

/**
 * Hook for localStorage with no prefix (for backwards compatibility)
 * Use this if you need to access keys without the 'Pawlette:' prefix
 */
export function useLocalStorageRaw<T>(
    key: string,
    initialValue: T,
    options?: StorageOptions
): [T, Dispatch<SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        return getStorageItem(key, initialValue, options)
    })

    const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            setStorageItem(key, valueToStore, options)
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }, [key, storedValue, options])

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    const deserialize = options?.deserialize || JSON.parse
                    const newValue = deserialize(e.newValue) as T
                    setStoredValue(newValue)
                    options?.onStorageChange?.(newValue)
                } catch (error) {
                    console.error(`Error parsing storage event for "${key}":`, error)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [key, options])

    return [storedValue, setValue]
}

/**
 * Get storage size information
 */
export function getStorageSize(): { used: number; available: number; percentage: number } {
    try {
        // Estimate used space
        let used = 0
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key) {
                const value = localStorage.getItem(key)
                used += key.length + (value?.length || 0)
            }
        }

        // Most browsers have 5-10MB limit, we'll assume 5MB to be safe
        const available = 5 * 1024 * 1024 // 5MB in bytes
        const percentage = (used / available) * 100

        return { used, available, percentage }
    } catch (error) {
        console.error('Error calculating storage size:', error)
        return { used: 0, available: 0, percentage: 0 }
    }
}

/**
 * Check if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
    try {
        const testKey = '__storage_test__'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
        return true
    } catch (error) {
        return false
    }
}

/**
 * Export all data from localStorage
 */
export function exportStorageData(prefix?: string): Record<string, any> {
    const data: Record<string, any> = {}
    const keys = getStorageKeys(prefix)

    for (const key of keys) {
        try {
            const value = localStorage.getItem(key)
            if (value !== null) {
                data[key] = JSON.parse(value)
            }
        } catch (error) {
            // If parsing fails, store raw value
            data[key] = localStorage.getItem(key)
        }
    }

    return data
}

/**
 * Import data into localStorage
 */
export function importStorageData(data: Record<string, any>): void {
    for (const [key, value] of Object.entries(data)) {
        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
        } catch (error) {
            console.error(`Error importing key "${key}":`, error)
        }
    }
}
