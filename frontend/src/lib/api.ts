const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const CACHE_DEBUG = import.meta.env.DEV;

type CacheEntry = {
  expiresAt: number;
  value?: unknown;
  inflight?: Promise<unknown>;
};

const responseCache = new Map<string, CacheEntry>();
const cacheMetrics = {
  hits: 0,
  misses: 0,
  inflightShares: 0,
  stores: 0,
  invalidations: 0,
};

function logCacheEvent(event: string, path: string): void {
  if (!CACHE_DEBUG) return;
  console.debug(`[api-cache] ${event} ${path}`, { ...cacheMetrics });
}

if (CACHE_DEBUG && typeof window !== "undefined") {
  const devWindow = window as Window & {
    __API_CACHE_STATS__?: () => Record<string, number>;
    __API_CACHE_RESET__?: () => void;
  };
  devWindow.__API_CACHE_STATS__ = () => ({
    ...cacheMetrics,
    entries: responseCache.size,
  });
  devWindow.__API_CACHE_RESET__ = () => {
    responseCache.clear();
    cacheMetrics.hits = 0;
    cacheMetrics.misses = 0;
    cacheMetrics.inflightShares = 0;
    cacheMetrics.stores = 0;
    cacheMetrics.invalidations = 0;
    logCacheEvent("manual-reset", "*");
  };
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  cacheTtlMs?: number;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method || "GET";
  const token = localStorage.getItem("admin_token");
  const cacheTtlMs = options.cacheTtlMs || 0;
  const useCache =
    method === "GET" &&
    !options.body &&
    cacheTtlMs > 0;
  const canShareInflight = useCache && !options.signal;
  const cacheKey = `${token || "anon"}:${path}`;
  const now = Date.now();

  if (useCache) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.value !== undefined && cached.expiresAt > now) {
      cacheMetrics.hits += 1;
      logCacheEvent("hit", path);
      return cached.value as T;
    }
    if (canShareInflight && cached?.inflight) {
      cacheMetrics.inflightShares += 1;
      logCacheEvent("inflight-share", path);
      return (await cached.inflight) as T;
    }
    cacheMetrics.misses += 1;
    logCacheEvent("miss", path);
  }

  const requestPromise = (async () => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (typeof payload?.detail === "string") {
        message = payload.detail;
      } else if (typeof payload?.error === "string") {
        message = payload.error;
      }
    } catch {
      // Fallback to generic message when response body is not JSON.
    }

    if (response.status === 401 && path !== "/auth/login/") {
      if (typeof window !== "undefined" && localStorage.getItem("admin_token")) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_logged_in");
        localStorage.removeItem("admin_email");
        invalidateApiCache();
        window.dispatchEvent(new Event("auth-changed"));
      }
      message = "Session expired or unauthorized. Please sign in again.";
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
  })();

  if (canShareInflight) {
    responseCache.set(cacheKey, {
      expiresAt: now + cacheTtlMs,
      inflight: requestPromise,
    });
  }

  try {
    const result = await requestPromise;
    if (useCache) {
      responseCache.set(cacheKey, {
        expiresAt: Date.now() + cacheTtlMs,
        value: result,
      });
      cacheMetrics.stores += 1;
      logCacheEvent("store", path);
    }
    return result;
  } catch (error) {
    if (useCache) {
      responseCache.delete(cacheKey);
    }
    throw error;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function invalidateApiCache(pathPrefix?: string): void {
  if (!pathPrefix) {
    if (responseCache.size > 0) {
      cacheMetrics.invalidations += responseCache.size;
      logCacheEvent("invalidate-all", "*");
    }
    responseCache.clear();
    return;
  }
  let cleared = 0;
  for (const key of responseCache.keys()) {
    const splitIndex = key.indexOf(":");
    const cachedPath = splitIndex >= 0 ? key.slice(splitIndex + 1) : key;
    if (cachedPath.startsWith(pathPrefix)) {
      responseCache.delete(key);
      cleared += 1;
    }
  }
  if (cleared > 0) {
    cacheMetrics.invalidations += cleared;
    logCacheEvent(`invalidate-prefix(${cleared})`, pathPrefix);
  }
}
