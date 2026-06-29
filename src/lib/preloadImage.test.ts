import { describe, expect, it, vi } from 'vitest';
import { preloadImage, PreloadImageError } from './preloadImage';

describe('preloadImage', () => {
  it('resolves when the image loads successfully', async () => {
    const createImage = vi.fn(() => {
      const img = {
        src: '',
        set onload(handler: (() => void) | null) {
          if (handler) {
            handler();
          }
        },
        set onerror(_handler: (() => void) | null) {},
      } as unknown as HTMLImageElement;
      return img;
    });

    await expect(
      preloadImage('https://example.com/image.jpg', { createImage }),
    ).resolves.toBeUndefined();
  });

  it.each([420, 423, 429])('retries on HTTP %i and eventually resolves', async (status) => {
    vi.useFakeTimers();

    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ status })
      .mockResolvedValueOnce({ status: 200 });

    let loadAttempt = 0;
    const createImage = vi.fn(() => {
      loadAttempt += 1;
      const img = {
        src: '',
        set onload(handler: (() => void) | null) {
          if (loadAttempt > 1 && handler) {
            handler();
          }
        },
        set onerror(handler: (() => void) | null) {
          if (loadAttempt === 1 && handler) {
            handler();
          }
        },
      } as unknown as HTMLImageElement;
      return img;
    });

    const promise = preloadImage('https://example.com/image.jpg', {
      fetchFn,
      createImage,
      retryDelayMs: 1000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    await expect(promise).resolves.toBeUndefined();

    vi.useRealTimers();
  });

  it('appends cache-busting parameter on retry attempts', async () => {
    vi.useFakeTimers();

    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ status: 420 })
      .mockResolvedValueOnce({ status: 200 });

    const srcs: string[] = [];
    let loadAttempt = 0;
    const createImage = vi.fn(() => {
      loadAttempt += 1;
      const img = {
        src: '',
        set onload(handler: (() => void) | null) {
          if (loadAttempt > 1 && handler) {
            handler();
          }
        },
        set onerror(handler: (() => void) | null) {
          if (loadAttempt === 1 && handler) {
            handler();
          }
        },
      } as unknown as HTMLImageElement;
      return new Proxy(img, {
        set(target, prop, value) {
          if (prop === 'src') srcs.push(value as string);
          return Reflect.set(target, prop, value);
        },
      }) as unknown as HTMLImageElement;
    });

    const promise = preloadImage('https://example.com/image.jpg', {
      fetchFn,
      createImage,
      retryDelayMs: 1000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    await expect(promise).resolves.toBeUndefined();

    expect(srcs[0]).toBe('https://example.com/image.jpg');
    expect(srcs[1]).toBe('https://example.com/image.jpg?_retry=1');

    vi.useRealTimers();
  });

  it('rejects after max retries on repeated 423 responses', async () => {
    vi.useFakeTimers();

    const fetchFn = vi.fn().mockResolvedValue({ status: 423 });
    const createImage = vi.fn(() => {
      const img = {
        src: '',
        set onload(_handler: (() => void) | null) {},
        set onerror(handler: (() => void) | null) {
          queueMicrotask(() => handler?.());
        },
      } as unknown as HTMLImageElement;
      return img;
    });

    const promise = preloadImage('https://example.com/image.jpg', {
      fetchFn,
      createImage,
      maxRetries: 2,
      retryDelayMs: 100,
    });

    const assertion = expect(promise).rejects.toBeInstanceOf(PreloadImageError);
    await vi.runAllTimersAsync();
    await assertion;

    vi.useRealTimers();
  });
});
