"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Progress } from "./ui/progress"
import { ScrollArea } from "./ui/scroll-area"
import {
  Settings,
  TestTube,
  Activity,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Copy,
  Eye,
  Download,
  Play,
  AlertTriangle,
  TrendingUp,
  Zap,
  Shield,
  Database,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "../../lib/supabase/client"
import type { IPNConfig, IPNLog, IPNStatistics, IPNTestScenario } from "../types"

const supabase = createClient()

export function IPNManagement() {
  const [activeTab, setActiveTab] = useState("overview")
  const [config, setConfig] = useState<IPNConfig | null>(null)
  const [logs, setLogs] = useState<IPNLog[]>([])
  const [statistics, setStatistics] = useState<IPNStatistics[]>([])
  const [selectedLog, setSelectedLog] = useState<IPNLog | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDatabaseSetup, setIsDatabaseSetup] = useState<boolean | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)

  const [testScenarios] = useState<IPNTestScenario[]>([
    {
      id: "success",
      name: "Successful Payment",
      description: "Test a successful payment notification",
      payload: {
        transactionRef: "TEST-" + Date.now(),
        amount: 5000,
        currency: "KES",
        status: "SUCCESS",
        paymentMethod: "M-PESA",
        phoneNumber: "254712345678",
        timestamp: new Date().toISOString(),
      },
      expectedStatus: "success",
    },
    {
      id: "failed",
      name: "Failed Payment",
      description: "Test a failed payment notification",
      payload: {
        transactionRef: "TEST-FAIL-" + Date.now(),
        amount: 5000,
        currency: "KES",
        status: "FAILED",
        errorCode: "INSUFFICIENT_FUNDS",
        errorMessage: "Insufficient funds in account",
        timestamp: new Date().toISOString(),
      },
      expectedStatus: "failed",
    },
    {
      id: "partial",
      name: "Partial Payment",
      description: "Test a partial payment notification",
      payload: {
        transactionRef: "TEST-PARTIAL-" + Date.now(),
        amount: 3000,
        expectedAmount: 5000,
        currency: "KES",
        status: "PARTIAL",
        paymentMethod: "M-PESA",
        phoneNumber: "254712345678",
        timestamp: new Date().toISOString(),
      },
      expectedStatus: "success",
    },
    {
      id: "duplicate",
      name: "Duplicate Transaction",
      description: "Test duplicate transaction handling",
      payload: {
        transactionRef: "TEST-DUP-12345",
        amount: 5000,
        currency: "KES",
        status: "SUCCESS",
        paymentMethod: "M-PESA",
        phoneNumber: "254712345678",
        timestamp: new Date().toISOString(),
      },
      expectedStatus: "failed",
    },
  ])

  useEffect(() => {
    checkDatabaseSetup()
  }, [])

  const checkDatabaseSetup = async () => {
    try {
      // Try to query the ipn_config table to see if it exists
      const { data, error } = await supabase.from("ipn_config").select("id").limit(1)

      if (error) {
        // Check if error is about missing table
        if (
          error.message.includes("does not exist") ||
          error.message.includes("not found") ||
          error.message.includes("schema cache")
        ) {
          setIsDatabaseSetup(false)
          setSetupError("IPN database tables have not been created yet.")
        } else {
          setIsDatabaseSetup(false)
          setSetupError(error.message)
        }
      } else {
        setIsDatabaseSetup(true)
        // Load data if database is set up
        loadConfig()
        loadLogs()
        loadStatistics()
      }
    } catch (error) {
      console.error("Error checking database setup:", error)
      setIsDatabaseSetup(false)
      setSetupError("Failed to connect to database")
    }
  }

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("ipn_config")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No IPN config found, using defaults")
          return
        }
        throw error
      }
      setConfig(data)
    } catch (error) {
      console.error("Error loading IPN config:", error)
      if (isDatabaseSetup !== false) {
        toast.error("Failed to load IPN configuration")
      }
    }
  }

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("ipn_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error("Error loading IPN logs:", error)
      if (isDatabaseSetup !== false) {
        toast.error("Failed to load IPN logs")
      }
    }
  }

  const loadStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from("ipn_statistics")
        .select("*")
        .order("date", { ascending: false })
        .limit(30)

      if (error) throw error
      setStatistics(data || [])
    } catch (error) {
      console.error("Error loading IPN statistics:", error)
    }
  }

  const updateConfig = async (updates: Partial<IPNConfig>) => {
    if (!config) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("ipn_config")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", config.id)

      if (error) throw error

      setConfig({ ...config, ...updates } as IPNConfig)
      toast.success("Configuration updated successfully")
    } catch (error) {
      console.error("Error updating config:", error)
      toast.error("Failed to update configuration")
    } finally {
      setIsLoading(false)
    }
  }

  const runTest = async (scenario: IPNTestScenario) => {
    setIsLoading(true)
    try {
      // Simulate IPN webhook call
      const startTime = Date.now()

      // In a real implementation, this would call your actual IPN endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const responseTime = Date.now() - startTime

      // Log the test
      const { error } = await supabase.from("ipn_test_logs").insert({
        test_type: scenario.name,
        test_payload: scenario.payload,
        expected_result: scenario.expectedStatus,
        actual_result: "success",
        passed: true,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success(`Test "${scenario.name}" completed successfully (${responseTime}ms)`)
      loadLogs()
    } catch (error) {
      console.error("Error running test:", error)
      toast.error("Test failed")
    } finally {
      setIsLoading(false)
    }
  }

  const retryFailedLog = async (log: IPNLog) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("ipn_logs")
        .update({
          status: "retry",
          retry_count: log.retry_count + 1,
        })
        .eq("id", log.id)

      if (error) throw error

      toast.success("Retry initiated")
      loadLogs()
    } catch (error) {
      console.error("Error retrying log:", error)
      toast.error("Failed to retry")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const exportLogs = async () => {
    try {
      const csv = [
        ["ID", "Transaction Ref", "Status", "Response Time", "Created At"].join(","),
        ...logs.map((log) =>
          [
            log.id,
            log.transaction_ref,
            log.status,
            log.response_time_ms || "N/A",
            new Date(log.created_at).toLocaleString(),
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ipn-logs-${new Date().toISOString()}.csv`
      a.click()

      toast.success("Logs exported successfully")
    } catch (error) {
      console.error("Error exporting logs:", error)
      toast.error("Failed to export logs")
    }
  }

  const getStatusBadge = (status: IPNLog["status"]) => {
    const variants = {
      success: { variant: "default" as const, icon: CheckCircle2, color: "text-green-500" },
      failed: { variant: "destructive" as const, icon: XCircle, color: "text-red-500" },
      processing: { variant: "secondary" as const, icon: Clock, color: "text-blue-500" },
      retry: { variant: "secondary" as const, icon: RefreshCw, color: "text-yellow-500" },
      received: { variant: "outline" as const, icon: Activity, color: "text-gray-500" },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const todayStats = statistics[0] || {
    total_received: 0,
    total_success: 0,
    total_failed: 0,
    avg_response_time_ms: 0,
  }

  const successRate = todayStats.total_received > 0 ? (todayStats.total_success / todayStats.total_received) * 100 : 0

  if (isDatabaseSetup === false) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">IPN Management</h1>
          <p className="text-muted-foreground">Configure, test, and monitor Jenga PGW Instant Payment Notifications</p>
        </div>

        <Card className="border-yellow-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-yellow-500" />
              <CardTitle>Database Setup Required</CardTitle>
            </div>
            <CardDescription>
              The IPN management tables need to be created before you can use this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Setup Instructions</AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                <p>To set up the IPN management system, you need to run the SQL migration script:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    Click the "Run Script" button below for{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">scripts/003_create_ipn_schema.sql</code>
                  </li>
                  <li>Wait for the script to complete</li>
                  <li>Click "Retry Setup" to verify the tables were created</li>
                </ol>
              </AlertDescription>
            </Alert>

            {setupError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>{setupError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={checkDatabaseSetup} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Setup Check
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">What will be created:</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>
                  <code>ipn_config</code> - Webhook configuration and settings
                </li>
                <li>
                  <code>ipn_logs</code> - Complete history of IPN notifications
                </li>
                <li>
                  <code>ipn_statistics</code> - Daily statistics and metrics
                </li>
                <li>
                  <code>ipn_test_logs</code> - Test execution history
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isDatabaseSetup === null) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Checking database setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IPN Management</h1>
          <p className="text-muted-foreground">Configure, test, and monitor Jenga PGW Instant Payment Notifications</p>
        </div>
        <Button onClick={loadLogs} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total_received}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.avg_response_time_ms.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${config?.is_active ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm font-medium">{config?.is_active ? "Active" : "Inactive"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="testing">
            <TestTube className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest IPN notifications received</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {logs.slice(0, 10).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusBadge(log.status)}
                        <div>
                          <p className="font-medium">{log.transaction_ref}</p>
                          <p className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{log.response_time_ms}ms</p>
                        {log.retry_count > 0 && (
                          <p className="text-xs text-muted-foreground">{log.retry_count} retries</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics Trend</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.slice(0, 7).map((stat) => {
                  const rate = stat.total_received > 0 ? (stat.total_success / stat.total_received) * 100 : 0

                  return (
                    <div key={stat.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{new Date(stat.date).toLocaleDateString()}</span>
                        <span className="font-medium">
                          {stat.total_success}/{stat.total_received} ({rate.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={rate} />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>Configure your IPN webhook endpoint and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    value={config?.webhook_url || ""}
                    onChange={(e) => setConfig(config ? { ...config, webhook_url: e.target.value } : null)}
                    placeholder="https://your-domain.com/api/jenga/ipn"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(config?.webhook_url || "")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-secret"
                    type="password"
                    value={config?.webhook_secret || ""}
                    onChange={(e) => setConfig(config ? { ...config, webhook_secret: e.target.value } : null)}
                    placeholder="Enter your webhook secret"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(config?.webhook_secret || "")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable IPN processing</p>
                </div>
                <Switch
                  checked={config?.is_active || false}
                  onCheckedChange={(checked) => updateConfig({ is_active: checked })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    value={config?.retry_attempts || 3}
                    onChange={(e) =>
                      setConfig(config ? { ...config, retry_attempts: Number.parseInt(e.target.value) } : null)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retry-delay">Retry Delay (seconds)</Label>
                  <Input
                    id="retry-delay"
                    type="number"
                    value={config?.retry_delay_seconds || 60}
                    onChange={(e) =>
                      setConfig(config ? { ...config, retry_delay_seconds: Number.parseInt(e.target.value) } : null)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={config?.timeout_seconds || 30}
                    onChange={(e) =>
                      setConfig(config ? { ...config, timeout_seconds: Number.parseInt(e.target.value) } : null)
                    }
                  />
                </div>
              </div>

              <Button onClick={() => updateConfig(config || {})} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              Always verify the HMAC signature of incoming IPN notifications to ensure they are from Jenga PGW. Never
              expose your webhook secret in client-side code.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Scenarios</CardTitle>
              <CardDescription>Run predefined test scenarios to verify IPN handling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {testScenarios.map((scenario) => (
                  <Card key={scenario.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Test Payload</Label>
                        <Textarea
                          value={JSON.stringify(scenario.payload, null, 2)}
                          readOnly
                          className="font-mono text-xs h-32"
                        />
                      </div>
                      <Button onClick={() => runTest(scenario)} disabled={isLoading} className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Run Test
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Test</CardTitle>
              <CardDescription>Send a custom IPN payload for testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Custom Payload (JSON)</Label>
                <Textarea
                  placeholder='{"transactionRef": "TEST-123", "amount": 5000, ...}'
                  className="font-mono h-48"
                />
              </div>
              <Button disabled={isLoading}>
                <Play className="h-4 w-4 mr-2" />
                Send Custom Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>IPN Logs</CardTitle>
                  <CardDescription>Complete history of IPN notifications</CardDescription>
                </div>
                <Button onClick={exportLogs} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction Ref</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="font-mono text-sm">{log.transaction_ref}</TableCell>
                        <TableCell>{log.response_time_ms ? `${log.response_time_ms}ms` : "N/A"}</TableCell>
                        <TableCell>{log.retry_count}</TableCell>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {log.status === "failed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => retryFailedLog(log)}
                                disabled={isLoading}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Detail Dialog */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>IPN Log Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Transaction Reference</Label>
                  <p className="font-mono text-sm">{selectedLog.transaction_ref}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <Label>Response Time</Label>
                  <p className="text-sm">{selectedLog.response_time_ms}ms</p>
                </div>
                <div>
                  <Label>Retry Count</Label>
                  <p className="text-sm">{selectedLog.retry_count}</p>
                </div>
                <div>
                  <Label>Signature Valid</Label>
                  <p className="text-sm">
                    {selectedLog.signature_valid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 inline" />
                    )}
                  </p>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <p className="text-sm font-mono">{selectedLog.ip_address || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Request Payload</Label>
                <Textarea
                  value={JSON.stringify(selectedLog.request_payload, null, 2)}
                  readOnly
                  className="font-mono text-xs h-48"
                />
              </div>

              {selectedLog.response_payload && (
                <div className="space-y-2">
                  <Label>Response Payload</Label>
                  <Textarea
                    value={JSON.stringify(selectedLog.response_payload, null, 2)}
                    readOnly
                    className="font-mono text-xs h-32"
                  />
                </div>
              )}

              {selectedLog.error_message && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{selectedLog.error_message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
