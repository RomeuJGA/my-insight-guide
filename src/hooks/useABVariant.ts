import { useEffect, useState } from "react";

export type Variant = "a" | "b";

const STORAGE_KEY = "intus-ab-variant";
const QUERY_PARAM = "v";

/**
 * Returns the A/B variant assigned to the current visitor.
 *
 * Resolution order:
 *   1. URL query param `?v=a` or `?v=b` (forces + persists)
 *   2. Existing assignment in localStorage
 *   3. Random 50/50 assignment, then persisted
 *
 * Returns `null` until the variant is resolved on the client.
 * Server-rendered output stays stable until hydration finishes.
 */
export function useABVariant(): Variant | null {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get(QUERY_PARAM)?.toLowerCase();
      if (fromUrl === "a" || fromUrl === "b") {
        localStorage.setItem(STORAGE_KEY, fromUrl);
        setVariant(fromUrl);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "a" || stored === "b") {
        setVariant(stored);
        return;
      }

      const assigned: Variant = Math.random() < 0.5 ? "a" : "b";
      localStorage.setItem(STORAGE_KEY, assigned);
      setVariant(assigned);
    } catch {
      // localStorage may be blocked — still return a variant in-memory
      setVariant(Math.random() < 0.5 ? "a" : "b");
    }
  }, []);

  return variant;
}

/**
 * Read-only helper that returns the current variant synchronously,
 * used by analytics to tag events. Returns null if not yet assigned.
 */
export function getCurrentVariant(): Variant | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "a" || stored === "b") return stored;
  } catch {
    // ignore
  }
  return null;
}
