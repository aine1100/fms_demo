// Shared API client for all services
const API_TIMEOUT = 30000;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Don't load token on initialization - let it be set after hydration
  }

  private loadToken() {
    if (typeof window !== 'undefined' && !this.token) {
      const storageKeys = ['auth-store', 'fms-auth'];
      for (const key of storageKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            this.token = parsed.state?.token || null;
            if (this.token) break;
          } catch (e) {
            // Silent fail
          }
        }
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      // Token will be persisted by Zustand
    }
  }

  private getHeaders(): HeadersInit {
    // Load token if not already set
    if (!this.token) {
      this.loadToken();
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - refresh token
      if (response.status === 401) {
        // Trigger token refresh/logout
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('unauthorized'));
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data as ApiResponse<T>;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, 'GET');
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, 'POST', body);
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, 'PUT', body);
  }

  delete<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, 'DELETE', body);
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, 'PATCH', body);
  }
}

// Create instances for each service
const authClient = new ApiClient(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:4001');
const customerClient = new ApiClient(process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_URL || 'http://localhost:4002');
const extinguisherClient = new ApiClient(process.env.NEXT_PUBLIC_EXTINGUISHER_SERVICE_URL || 'http://localhost:4003');
const inspectionClient = new ApiClient(process.env.NEXT_PUBLIC_INSPECTION_SERVICE_URL || 'http://localhost:4006');
const paymentClient = new ApiClient(process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:4005');
const notificationClient = new ApiClient(process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:4004');

export { authClient, customerClient, extinguisherClient, inspectionClient, paymentClient, notificationClient };
export { ApiClient };
export type { ApiClient as ApiClientType };
