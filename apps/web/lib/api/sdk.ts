import { ApiResponse } from "./types";
import { ApiError, UnauthorizedError, RateLimitError, PaymentRequiredError } from "./errors";

// Domain types matching Go backend
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface APIKey {
  id: string;
  userId: string;
  name: string;
  key?: string;
  lastUsed?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface APILog {
  id: string;
  userId: string;
  apiKeyId?: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latency: number;
  status: string;
  errorMessage?: string;
  createdAt: string;
}

export interface UserCredits {
  id: string;
  userId: string;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  relatedLogId?: string;
  createdAt: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  inputPricePer1k: number;
  outputPricePer1k: number;
  contextWindow: string;
  description: string;
  capabilities: string[];
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsData {
  summary: {
    totalRequests: number;
    successRequests: number;
    errorRequests: number;
  };
  recentLogs: APILog[];
  modelBreakdown: Array<{ model: string; count: number; totalCost: number }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    cost: number;
    tokens: number;
  }>;
}

export interface PlatformStats {
  users: { total: number };
  apiKeys: { total: number };
  logs: { total: number; success: number; error: number };
  credits: {
    totalBalance: number;
    totalPurchased: number;
    totalSpent: number;
  };
  recentActivity: APILog[];
}

// SDK configuration
export interface DraSDKConfig {
  baseUrl?: string;
  apiKey?: string;
}

class DraSDK {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: DraSDKConfig = {}) {
    this.baseUrl = config.baseUrl || "";
    this.apiKey = config.apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      h["x-api-key"] = this.apiKey;
    }
    return h;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) params.set(k, String(v));
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const init: RequestInit = {
      method,
      headers: this.headers(),
      credentials: "include",
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);

    if (res.status === 401) {
      throw new UnauthorizedError("Authentication required");
    }
    if (res.status === 429) {
      throw new RateLimitError();
    }
    if (res.status === 402) {
      throw new PaymentRequiredError();
    }

    // For non-JSON responses (like SSE streams), return raw response
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      if (!res.ok) {
        const text = await res.text();
        throw new ApiError(text || res.statusText, res.status);
      }
      return res as unknown as T;
    }

    const json = (await res.json()) as ApiResponse<T>;

    if (!res.ok || !json.success) {
      throw new ApiError(json.error || res.statusText, res.status);
    }

    return json.data as T;
  }

  private async paginatedRequest<T>(
    path: string,
    query: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<T>> {
    let url = `${this.baseUrl}${path}`;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const res = await fetch(url, {
      method: "GET",
      headers: this.headers(),
      credentials: "include",
    });

    if (res.status === 401) {
      throw new UnauthorizedError("Authentication required");
    }
    if (res.status === 429) {
      throw new RateLimitError();
    }
    if (res.status === 402) {
      throw new PaymentRequiredError();
    }

    const json = (await res.json()) as ApiResponse<T[]>;
    if (!res.ok || !json.success) {
      throw new ApiError(json.error || res.statusText, res.status);
    }

    return {
      data: (json.data ?? []) as T[],
      total: json.meta?.total ?? 0,
      page: json.meta?.page ?? 1,
      limit: json.meta?.limit ?? 20,
      totalPages: json.meta?.totalPages ?? 1,
    };
  }

  // Health
  health() {
    return this.request<{ status: string; version: string }>("GET", "/api/health");
  }

  // Auth
  signup(data: { name: string; email: string; password: string }) {
    return this.request<User>("POST", "/api/auth/signup", data);
  }

  login(data: { email: string; password: string }) {
    return this.request<User>("POST", "/api/auth/login", data);
  }

  me() {
    return this.request<User>("GET", "/api/auth/me");
  }

  // API Keys
  listKeys() {
    return this.request<APIKey[]>("GET", "/api/keys");
  }

  createKey(data: { name: string }) {
    return this.request<APIKey>("POST", "/api/keys", data);
  }

  deleteKey(id: string) {
    return this.request<{ deleted: boolean }>("DELETE", `/api/keys`, undefined, { id });
  }

  // Credits
  getCredits() {
    return this.request<UserCredits>("GET", "/api/credits");
  }

  purchaseCredits(data: { amount: number; description?: string }) {
    return this.request<CreditTransaction>("POST", "/api/credits/purchase", data);
  }

  // Transactions
  listTransactions(page?: number, limit?: number) {
    return this.paginatedRequest<CreditTransaction>("/api/transactions", { page, limit });
  }

  // Logs
  listLogs(page?: number, limit?: number) {
    return this.paginatedRequest<APILog>("/api/logs", { page, limit });
  }

  // Analytics
  getAnalytics() {
    return this.request<AnalyticsData>("GET", "/api/analytics");
  }

  // Models
  listModels() {
    return this.request<ModelInfo[]>("GET", "/api/models");
  }

  // Chat
  chat(data: { model: string; messages: ChatMessage[] }) {
    return this.request<Response>("POST", "/api/chat", data);
  }

  async *chatStream(data: { model: string; messages: ChatMessage[] }): AsyncGenerator<string, void, unknown> {
    const url = `${this.baseUrl}/api/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new ApiError(text || res.statusText, res.status);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6);
            if (payload === "[DONE]") return;
            yield payload;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Admin
  adminListUsers(page?: number, limit?: number) {
    return this.paginatedRequest<User>("/api/admin/users", { page, limit });
  }

  adminDeleteUser(id: string) {
    return this.request<{ deleted: boolean }>("DELETE", `/api/admin/users`, undefined, { id });
  }

  adminStats() {
    return this.request<PlatformStats>("GET", "/api/admin/stats");
  }
}

// Singleton instance for convenience
let defaultSDK = new DraSDK();

export function configureSDK(config: DraSDKConfig) {
  defaultSDK = new DraSDK(config);
}

export function getSDK() {
  return defaultSDK;
}

export { DraSDK };
