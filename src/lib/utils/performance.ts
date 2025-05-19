// src/lib/utils/performance.ts
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();

    return ((...args: any[]) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);

        // Limit cache size to prevent memory issues
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return result;
    }) as T;
}

export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: number | undefined;

    return (...args: Parameters<T>) => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(() => {
            fn(...args);
            timeoutId = undefined;
        }, delay);
    };
}

export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;
    let timeoutId: number | undefined;

    return (...args: Parameters<T>) => {
        const now = Date.now();

        if (now - lastCall < limit) {
            // If we're within the limit, schedule a call for later
            if (timeoutId === undefined) {
                timeoutId = window.setTimeout(() => {
                    lastCall = now;
                    fn(...args);
                    timeoutId = undefined;
                }, limit - (now - lastCall));
            }
            return;
        }

        // Otherwise, call immediately
        lastCall = now;
        fn(...args);
    };
}