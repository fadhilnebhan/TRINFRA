'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface UseLiveDataSyncOptions<T> {
  /** Async function to fetch fresh data from the API */
  fetcher: (signal: AbortSignal) => Promise<T | null>;
  /** Callback triggered when fresh data differs from the current data */
  onData: (data: T) => void;
  /** Optional initial data to seed the comparison cache */
  initialData?: T | null;
  /** Polling interval in milliseconds while tab is visible (default: 10000ms = 10s) */
  intervalMs?: number;
  /** Optional custom comparator to determine if new data differs from current data */
  isEqual?: (prev: T | null, next: T) => boolean;
  /** Optional callback when the resource is confirmed not found (HTTP 404 / null) */
  onNotFound?: () => void;
  /** Whether to run an immediate fetch on mount (default: false if initialData provided, true otherwise) */
  runOnMount?: boolean;
  /** Whether live synchronization is currently enabled (default: true) */
  enabled?: boolean;
}

function defaultIsEqual<T>(prev: T | null, next: T): boolean {
  if (prev === next) return true;
  if (prev === null || next === null) return false;
  try {
    return JSON.stringify(prev) === JSON.stringify(next);
  } catch {
    return false;
  }
}

/**
 * Reusable client-side live-sync hook.
 *
 * Silently polls the database API at a regular interval while the page is visible,
 * and immediately triggers a sync when the user switches back to the tab (visibilitychange)
 * or when the browser window regains focus.
 *
 * Zero-budget, zero paid third-party infrastructure.
 * Cancels pending fetches on unmount and prevents concurrent overlapping fetches.
 */
export function useLiveDataSync<T>({
  fetcher,
  onData,
  initialData = null,
  intervalMs = 10000,
  isEqual = defaultIsEqual,
  onNotFound,
  runOnMount,
  enabled = true,
}: UseLiveDataSyncOptions<T>) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  const onNotFoundRef = useRef(onNotFound);
  onNotFoundRef.current = onNotFound;

  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;

  const lastDataRef = useRef<T | null>(initialData);
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const shouldRunOnMount = runOnMount !== undefined ? runOnMount : initialData === null;

  const executeSync = useCallback(async () => {
    if (!enabled || inFlightRef.current) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }

    try {
      inFlightRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const freshData = await fetcherRef.current(signal);

      if (signal.aborted) return;

      if (freshData === null) {
        if (onNotFoundRef.current) {
          onNotFoundRef.current();
        }
        return;
      }

      if (!isEqualRef.current(lastDataRef.current, freshData)) {
        lastDataRef.current = freshData;
        onDataRef.current(freshData);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Ignored aborted request
        return;
      }
      // Fail silently in background sync without disrupting the user
      console.debug('Background live-sync check:', err);
    } finally {
      inFlightRef.current = false;
    }
  }, [enabled]);

  // Seed lastDataRef from initial data if needed
  const seedInitialData = useCallback((data: T | null) => {
    lastDataRef.current = data;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (shouldRunOnMount) {
      executeSync();
    }

    // Periodic timer
    const timer = setInterval(() => {
      executeSync();
    }, intervalMs);

    // Immediate sync on tab visibility change (e.g. user returns to this tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        executeSync();
      }
    };

    // Immediate sync on window focus
    const handleFocus = () => {
      executeSync();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, intervalMs, executeSync, shouldRunOnMount]);

  return { syncNow: executeSync, seedInitialData };
}
