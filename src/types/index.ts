export interface Property {
  id: string
  name: string
  label: string
  totalUnits: number
  floors: Floor[]
}

export interface Floor {
  id: string
  number: number
  units: Unit[]
}

export interface Unit {
  id: string
  roomNumber: string
  type: "Residential" | "Shop"
  rent: number
  status: "Paid" | "Overdue" | "Partial" | "Vacant"
  tenant?: Tenant
  floor: number
  lastPayment?: Payment
  dueDate: string
}

export interface Tenant {
  id: string
  name: string
  phone: string
  email: string
  idNumber: string
  depositAmount: number
  moveInDate: string
  profileImage?: string
  idFront?: string
  idBack?: string
  signature?: string
  kycStatus: "Pending" | "Verified" | "Rejected"
}

export interface Payment {
  id: string
  tenantId: string
  unitId: string
  amount: number
  dueAmount: number
  paymentDate: string
  dueDate: string
  status: "Paid" | "Partial" | "Overdue"
  transactionRef: string
  paymentMethod: "M-Pesa" | "Bank Transfer" | "Cash" | "Jenga PGW"
}

export interface AuditLog {
  id: string
  action: string
  actor: string
  description: string
  timestamp: string
  entityType: "Tenant" | "Payment" | "Unit" | "System"
  entityId?: string
}

export interface ConnectionStatus {
  isLive: boolean
  lastUpdate: string
  mode: "Live IPN Feed" | "Demo Mode"
}

export type UserRole = "Admin" | "Manager" | "Accountant"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface MaintenanceRequest {
  id: string
  property_id: string
  unit_id?: string
  title: string
  description: string
  category: "Plumbing" | "Electrical" | "Structural" | "Cleaning" | "Other"
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "Open" | "In Progress" | "Completed" | "Cancelled"
  reported_by?: string
  assigned_to?: string
  cost?: number
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface DBProperty {
  id: number
  name: string
  address: string | null
  rent_amount: number | null
  created_at: string
  updated_at: string
}

export interface DBTenant {
  id: number
  property_id: number | null
  name: string
  email: string | null
  phone: string | null
  lease_start: string | null
  lease_end: string | null
  created_at: string
}

export interface DBPayment {
  id: number
  tenant_id: number | null
  property_id: number | null
  amount: number
  payment_date: string
  due_date: string | null
  status: string
  payment_method: string | null
  reference_number: string | null
  created_at: string
}

export interface DBMaintenanceRequest {
  id: number
  property_id: number | null
  tenant_id: number | null
  title: string
  description: string | null
  priority: string
  status: string
  assigned_to: string | null
  created_at: string
  resolved_at: string | null
}

export interface IPNConfig {
  id: number
  webhook_url: string
  webhook_secret: string
  is_active: boolean
  retry_attempts: number
  retry_delay_seconds: number
  timeout_seconds: number
  created_at: string
  updated_at: string
}

export interface IPNLog {
  id: number
  transaction_ref: string
  payment_id: number | null
  request_payload: any
  response_payload: any | null
  signature: string | null
  signature_valid: boolean | null
  status: "received" | "processing" | "success" | "failed" | "retry"
  error_message: string | null
  response_time_ms: number | null
  retry_count: number
  ip_address: string | null
  user_agent: string | null
  created_at: string
  processed_at: string | null
}

export interface IPNStatistics {
  id: number
  date: string
  total_received: number
  total_success: number
  total_failed: number
  total_retries: number
  avg_response_time_ms: number
  created_at: string
}

export interface IPNTestLog {
  id: number
  test_type: string
  test_payload: any
  expected_result: string | null
  actual_result: string | null
  passed: boolean | null
  error_message: string | null
  created_at: string
}

export interface IPNTestScenario {
  id: string
  name: string
  description: string
  payload: any
  expectedStatus: "success" | "failed"
}
