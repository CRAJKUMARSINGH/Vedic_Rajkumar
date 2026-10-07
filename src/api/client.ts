/**
 * HTTP API Client with Interceptor & Fallback Support
 *
 * Implements fetch-based HTTP client featuring:
 * - Request / Response / Error interceptors
 * - Dynamic auth token injection
 * - Configurable request timeout
 * - Standardized error formatting
 */

import {
  type ApiClientConfig,
  ApiError,
  type ApiResponse,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor,
  type RequestInterceptorContext,
  type ResponseInterceptorContext,
} from './types';

export class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;
  private defaultHeaders: Record<string, string>;
  private getAuthToken?: () => Promise<string | null> | string | null;
  public enableFallback: boolean;

  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? (import.meta.env.VITE_API_URL as string | undefined) ?? '';
    this.timeoutMs = config.timeoutMs ?? 15000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(config.headers ?? {}),
    };
    this.getAuthToken = config.getAuthToken;
    this.enableFallback = config.enableFallback ?? true;

    // Default auth injection interceptor
    this.useRequestInterceptor(async (ctx) => {
      if (this.getAuthToken) {
        const token = await this.getAuthToken();
        if (token) {
          ctx.options.headers = {
            ...ctx.options.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }
      return ctx;
    });
  }

  public useRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter((i) => i !== interceptor);
    };
  }

  public useResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter((i) => i !== interceptor);
    };
  }

  public useErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter((i) => i !== interceptor);
    };
  }

  private resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    return cleanBase ? `${cleanBase}/${cleanPath}` : `/${cleanPath}`;
  }

  public async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(path);

    let context: RequestInterceptorContext = {
      url,
      options: {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...(options.headers as Record<string, string> | undefined),
        },
      },
    };

    // Execute request interceptors
    for (const interceptor of this.requestInterceptors) {
      context = await interceptor(context);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(context.url, {
        ...context.options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorPayload: unknown;
        try {
          errorPayload = await response.json();
        } catch {
          errorPayload = await response.text();
        }

        const message =
          typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload
            ? String((errorPayload as { message: unknown }).message)
            : `HTTP error ${response.status}: ${response.statusText}`;

        throw new ApiError(message, `HTTP_${response.status}`, response.status, errorPayload);
      }

      const responseData: T = (await response.json()) as T;

      let resContext: ResponseInterceptorContext<T> = {
        response,
        data: responseData,
      };

      for (const interceptor of this.responseInterceptors) {
        resContext = (await interceptor(
          resContext as ResponseInterceptorContext<unknown>
        )) as ResponseInterceptorContext<T>;
      }

      return {
        data: resContext.data,
        status: response.status,
        timestamp: new Date().toISOString(),
        source: 'remote',
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      let apiError: ApiError;
      if (err instanceof ApiError) {
        apiError = err;
      } else if (err instanceof Error && err.name === 'AbortError') {
        apiError = new ApiError(`Request timeout after ${this.timeoutMs}ms`, 'TIMEOUT', 408);
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Unknown network error';
        apiError = new ApiError(errorMsg, 'NETWORK_ERROR', 0, err);
      }

      for (const interceptor of this.errorInterceptors) {
        await interceptor(apiError);
      }

      throw apiError;
    }
  }

  public async get<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public async post<T, B = unknown>(path: string, body?: B, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T, B = unknown>(path: string, body?: B, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

// Default singleton client instance
export const apiClient = new ApiClient();
