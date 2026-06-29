export interface PreloadImageOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  fetchFn?: typeof fetch;
  createImage?: () => HTMLImageElement;
  onRetry?: (attempt: number) => void;
}

const DEFAULT_MAX_RETRIES = 10;
const DEFAULT_RETRY_DELAY_MS = 5000;

export class PreloadImageError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'PreloadImageError';
  }
}

export function preloadImage(
  url: string,
  options: PreloadImageOptions = {},
): Promise<void> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    fetchFn = fetch,
    createImage = () => new Image(),
    onRetry,
  } = options;

  const RETRYABLE_STATUSES = new Set([420, 423, 429]);

  return new Promise((resolve, reject) => {
    const attemptLoad = (attempt: number) => {
      const img = createImage();
      const cacheBustUrl = attempt > 0
        ? `${url}${url.includes('?') ? '&' : '?'}_retry=${attempt}`
        : url;
      img.src = cacheBustUrl;

      img.onload = () => resolve();

      img.onerror = async () => {
        try {
          const response = await fetchFn(cacheBustUrl);

          if (RETRYABLE_STATUSES.has(response.status) && attempt < maxRetries) {
            onRetry?.(attempt + 1);
            setTimeout(() => attemptLoad(attempt + 1), retryDelayMs);
            return;
          }

          reject(
            new PreloadImageError(
              attempt >= maxRetries
                ? 'Max retries reached while waiting for generative image.'
                : `Image failed to load (${response.status}).`,
              response.status,
            ),
          );
        } catch (error) {
          reject(
            error instanceof PreloadImageError
              ? error
              : new PreloadImageError(
                  error instanceof Error ? error.message : 'Image preload failed.',
                ),
          );
        }
      };
    };

    attemptLoad(0);
  });
}
