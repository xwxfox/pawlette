import { useState, useCallback, useRef } from 'react';

interface HistoryOptions {
    maxHistory?: number;
}

interface HistoryState<T> {
    state: T;
    undo: () => void;
    redo: () => void;
    pushState: (newState: T) => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: () => void;
    historySize: number;
}

/**
 * Custom hook for managing state history with undo/redo functionality
 * 
 * @param initialState - The initial state value
 * @param options - Configuration options
 * @returns History state management object
 * 
 * @example
 * ```typescript
 * const { state, undo, redo, pushState, canUndo, canRedo } = useHistory(initialColors);
 * 
 * // Make changes
 * pushState(newColors);
 * 
 * // Undo
 * if (canUndo) undo();
 * 
 * // Redo
 * if (canRedo) redo();
 * ```
 */
export function useHistory<T>(
    initialState: T,
    options: HistoryOptions = {}
): HistoryState<T> {
    const { maxHistory = 50 } = options;

    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Use ref to track if we're in the middle of an undo/redo operation
    const isUndoRedoRef = useRef(false);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            isUndoRedoRef.current = true;
            setCurrentIndex(currentIndex - 1);
            setTimeout(() => {
                isUndoRedoRef.current = false;
            }, 0);
        }
    }, [currentIndex]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            isUndoRedoRef.current = true;
            setCurrentIndex(currentIndex + 1);
            setTimeout(() => {
                isUndoRedoRef.current = false;
            }, 0);
        }
    }, [currentIndex, history.length]);

    const pushState = useCallback(
        (newState: T) => {
            // Don't add to history if we're in the middle of undo/redo
            if (isUndoRedoRef.current) {
                return;
            }

            // Check if state actually changed (deep comparison for objects)
            const currentState = history[currentIndex];
            if (JSON.stringify(currentState) === JSON.stringify(newState)) {
                return;
            }

            setHistory((prevHistory) => {
                // Remove any states after current index (user made changes after undo)
                const newHistory = prevHistory.slice(0, currentIndex + 1);

                // Add new state
                newHistory.push(newState);

                // Limit history size
                if (newHistory.length > maxHistory) {
                    return newHistory.slice(newHistory.length - maxHistory);
                }

                return newHistory;
            });

            setCurrentIndex((prevIndex) => {
                const newIndex = prevIndex + 1;
                return newIndex >= maxHistory ? maxHistory - 1 : newIndex;
            });
        },
        [currentIndex, history, maxHistory]
    );

    const clear = useCallback(() => {
        setHistory([history[currentIndex]]);
        setCurrentIndex(0);
    }, [history, currentIndex]);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    return {
        state: history[currentIndex],
        undo,
        redo,
        pushState,
        canUndo,
        canRedo,
        clear,
        historySize: history.length,
    };
}

/**
 * Hook for managing keyboard shortcuts
 * 
 * @param shortcuts - Map of key combinations to handlers
 * 
 * @example
 * ```typescript
 * useKeyboardShortcuts({
 *   'ctrl+z': undo,
 *   'ctrl+y': redo,
 *   'ctrl+s': handleSave,
 * });
 * ```
 */
export function useKeyboardShortcuts(
    shortcuts: Record<string, (e: KeyboardEvent) => void>
) {
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

        for (const [combo, handler] of Object.entries(shortcutsRef.current)) {
            const parts = combo.toLowerCase().split('+');
            const requiresCtrl = parts.includes('ctrl') || parts.includes('cmd');
            const requiresShift = parts.includes('shift');
            const requiresAlt = parts.includes('alt');
            const key = parts[parts.length - 1];

            const matches =
                (!requiresCtrl || cmdOrCtrl) &&
                (!requiresShift || e.shiftKey) &&
                (!requiresAlt || e.altKey) &&
                e.key.toLowerCase() === key;

            if (matches) {
                e.preventDefault();
                handler(e);
                break;
            }
        }
    }, []);

    // Set up event listener
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }
}
