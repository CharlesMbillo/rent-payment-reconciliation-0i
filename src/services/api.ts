import type { Unit, Tenant, Payment, AuditLog } from "../types"

// API Configuration
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://unhonoured-carisa-pseudodiphtheric.ngrok-free.dev"
    : "http://localhost:3001/api"

// Headers for API requests
const getHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (includeAuth) {
    const token = localStorage.getItem("auth_token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  return headers
}

// Generic API request handler
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error)
    throw error
  }
}

// Properties API
export const propertiesApi = {
  getAll: () => apiRequest<any[]>("/properties"),
  getById: (id: string) => apiRequest<any>(`/properties/${id}`),
  create: (property: any) =>
    apiRequest<any>("/properties", {
      method: "POST",
      body: JSON.stringify(property),
    }),
  update: (id: string, property: any) =>
    apiRequest<any>(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(property),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/properties/${id}`, {
      method: "DELETE",
    }),
}

// Units API
export const unitsApi = {
  getAll: () => apiRequest<Unit[]>("/units"),
  getByProperty: (propertyId: string) => apiRequest<Unit[]>(`/units/property/${propertyId}`),
  getById: (id: string) => apiRequest<Unit>(`/units/${id}`),
  updateStatus: (id: string, status: Unit["status"]) =>
    apiRequest<Unit>(`/units/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  create: (unit: Omit<Unit, "id">) =>
    apiRequest<Unit>("/units", {
      method: "POST",
      body: JSON.stringify(unit),
    }),
  update: (id: string, unit: Partial<Unit>) =>
    apiRequest<Unit>(`/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(unit),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/units/${id}`, {
      method: "DELETE",
    }),
}

// Tenants API
export const tenantsApi = {
  getAll: () => apiRequest<Tenant[]>("/tenants"),
  getByProperty: (propertyId: string) => apiRequest<Tenant[]>(`/tenants/property/${propertyId}`),
  getById: (id: string) => apiRequest<Tenant>(`/tenants/${id}`),
  create: (tenant: Omit<Tenant, "id">) =>
    apiRequest<Tenant>("/tenants", {
      method: "POST",
      body: JSON.stringify(tenant),
    }),
  update: (id: string, tenant: Partial<Tenant>) =>
    apiRequest<Tenant>(`/tenants/${id}`, {
      method: "PUT",
      body: JSON.stringify(tenant),
    }),
  updateKycStatus: (id: string, status: Tenant["kycStatus"]) =>
    apiRequest<Tenant>(`/tenants/${id}/kyc`, {
      method: "PATCH",
      body: JSON.stringify({ kycStatus: status }),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/tenants/${id}`, {
      method: "DELETE",
    }),
  uploadDocument: (id: string, documentType: string, file: File) => {
    const formData = new FormData()
    formData.append("document", file)
    formData.append("type", documentType)

    return fetch(`${API_BASE_URL}/tenants/${id}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: formData,
    })
  },
}

// Payments API
export const paymentsApi = {
  getAll: () => apiRequest<Payment[]>("/payments"),
  getByProperty: (propertyId: string) => apiRequest<Payment[]>(`/payments/property/${propertyId}`),
  getByUnit: (unitId: string) => apiRequest<Payment[]>(`/payments/unit/${unitId}`),
  getByTenant: (tenantId: string) => apiRequest<Payment[]>(`/payments/tenant/${tenantId}`),
  getById: (id: string) => apiRequest<Payment>(`/payments/${id}`),
  create: (payment: Omit<Payment, "id">) =>
    apiRequest<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(payment),
    }),
  processPayment: (paymentData: {
    unitId: string
    amount: number
    paymentMethod: string
    transactionRef: string
  }) =>
    apiRequest<Payment>("/payments/process", {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),
  verifyPayment: (transactionRef: string) => apiRequest<Payment>(`/payments/verify/${transactionRef}`),
  getAnalytics: (propertyId?: string) =>
    apiRequest<{
      totalCollected: number
      totalOutstanding: number
      collectionRate: number
      monthlyTrend: any[]
    }>("/payments/analytics" + (propertyId ? `?propertyId=${propertyId}` : "")),
}

// Audit Logs API
export const auditApi = {
  getAll: () => apiRequest<AuditLog[]>("/audit"),
  getByProperty: (propertyId: string) => apiRequest<AuditLog[]>(`/audit/property/${propertyId}`),
  getByEntity: (entityType: string, entityId: string) =>
    apiRequest<AuditLog[]>(`/audit/entity/${entityType}/${entityId}`),
  create: (log: Omit<AuditLog, "id" | "timestamp">) =>
    apiRequest<AuditLog>("/audit", {
      method: "POST",
      body: JSON.stringify({
        ...log,
        timestamp: new Date().toISOString(),
      }),
    }),
}

// Jenga PGW Integration API
export const jengaApi = {
  // Webhook endpoint for IPN notifications
  processIPN: (ipnData: any) =>
    apiRequest<{
      success: boolean
      message: string
      paymentId?: string
    }>("/jenga/ipn", {
      method: "POST",
      body: JSON.stringify(ipnData),
      headers: {
        "Content-Type": "application/json",
        "X-Jenga-Signature": ipnData.signature || "",
      },
    }),

  // Verify HMAC signature
  verifySignature: (payload: string, signature: string) =>
    apiRequest<{
      valid: boolean
    }>("/jenga/verify-signature", {
      method: "POST",
      body: JSON.stringify({ payload, signature }),
    }),

  // Get payment status from Jenga
  getPaymentStatus: (transactionRef: string) => apiRequest<any>(`/jenga/payment-status/${transactionRef}`),

  // Initiate refund
  initiateRefund: (refundData: {
    originalTransactionRef: string
    amount: number
    reason: string
  }) =>
    apiRequest<any>("/jenga/refund", {
      method: "POST",
      body: JSON.stringify(refundData),
    }),

  // Get IPN configuration
  getConfig: () => apiRequest<any>("/jenga/ipn/config"),

  // Update IPN configuration
  updateConfig: (config: any) =>
    apiRequest<any>("/jenga/ipn/config", {
      method: "PUT",
      body: JSON.stringify(config),
    }),

  // Get IPN logs
  getLogs: (params?: {
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.status) queryParams.append("status", params.status)
    if (params?.startDate) queryParams.append("startDate", params.startDate)
    if (params?.endDate) queryParams.append("endDate", params.endDate)

    return apiRequest<any[]>(`/jenga/ipn/logs?${queryParams.toString()}`)
  },

  // Get IPN statistics
  getStatistics: (days = 30) => apiRequest<any[]>(`/jenga/ipn/statistics?days=${days}`),

  // Retry failed IPN
  retryIPN: (logId: number) =>
    apiRequest<any>(`/jenga/ipn/retry/${logId}`, {
      method: "POST",
    }),

  // Send test IPN
  sendTestIPN: (testData: any) =>
    apiRequest<any>("/jenga/ipn/test", {
      method: "POST",
      body: JSON.stringify(testData),
    }),
}

// File Upload API
export const fileApi = {
  uploadImage: (file: File, category: "tenant" | "property" | "document") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", category)

    return fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: formData,
    })
  },

  deleteFile: (fileId: string) =>
    apiRequest<void>(`/files/${fileId}`, {
      method: "DELETE",
    }),
}

// System API
export const systemApi = {
  getStatus: () =>
    apiRequest<{
      mode: "Live IPN Feed" | "Demo Mode"
      isHealthy: boolean
      lastIpnReceived?: string
      activeConnections: number
    }>("/system/status"),

  switchMode: (mode: "live" | "demo") =>
    apiRequest<{
      mode: string
      success: boolean
    }>("/system/mode", {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),

  getHealth: () =>
    apiRequest<{
      status: "healthy" | "unhealthy"
      checks: Record<string, boolean>
      timestamp: string
    }>("/system/health"),

  exportData: (options: {
    type: "payments" | "tenants" | "audit"
    propertyId?: string
    startDate?: string
    endDate?: string
    format: "csv" | "json" | "pdf"
  }) => {
    const params = new URLSearchParams()
    Object.entries(options).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    return fetch(`${API_BASE_URL}/system/export?${params.toString()}`, {
      headers: getHeaders(),
    })
  },
}

// Authentication API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: getHeaders(false),
    }),

  logout: () =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
    }),

  refreshToken: () => apiRequest<{ token: string }>("/auth/refresh"),

  getProfile: () => apiRequest<any>("/auth/profile"),

  updateProfile: (profile: any) =>
    apiRequest<any>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    }),
}

// Error handling utility
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Request interceptor for handling common errors
const originalFetch = window.fetch
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args)

    if (response.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("auth_token")
      window.location.href = "/login"
    }

    return response
  } catch (error) {
    console.error("Network error:", error)
    throw error
  }
}

export default {
  properties: propertiesApi,
  units: unitsApi,
  tenants: tenantsApi,
  payments: paymentsApi,
  audit: auditApi,
  jenga: jengaApi,
  files: fileApi,
  system: systemApi,
  auth: authApi,
}
