"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Building2, Plus, Wrench, AlertCircle, CheckCircle2, Clock, Users } from "lucide-react"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"
import type { DBProperty, DBTenant, DBMaintenanceRequest } from "../types"

export function PropertyManagement() {
  const [activeTab, setActiveTab] = useState("properties")
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false)
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false)
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false)

  const [properties, setProperties] = useState<DBProperty[]>([])
  const [tenants, setTenants] = useState<DBTenant[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<DBMaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Property form state
  const [newProperty, setNewProperty] = useState({
    name: "",
    address: "",
    rent_amount: 4500,
  })

  // Tenant form state
  const [newTenant, setNewTenant] = useState({
    property_id: "",
    name: "",
    email: "",
    phone: "",
    lease_start: "",
    lease_end: "",
  })

  // Maintenance form state
  const [newMaintenance, setNewMaintenance] = useState({
    property_id: "",
    tenant_id: "",
    title: "",
    description: "",
    priority: "medium",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [propertiesRes, tenantsRes, maintenanceRes] = await Promise.all([
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("tenants").select("*").order("created_at", { ascending: false }),
        supabase.from("maintenance_requests").select("*").order("created_at", { ascending: false }),
      ])

      if (propertiesRes.error) throw propertiesRes.error
      if (tenantsRes.error) throw tenantsRes.error
      if (maintenanceRes.error) throw maintenanceRes.error

      setProperties(propertiesRes.data || [])
      setTenants(tenantsRes.data || [])
      setMaintenanceRequests(maintenanceRes.data || [])
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddProperty = async () => {
    if (!newProperty.name) {
      toast.error("Please fill in property name")
      return
    }

    try {
      const { data, error } = await supabase.from("properties").insert([newProperty]).select().single()

      if (error) throw error

      setProperties([data, ...properties])
      toast.success(`Property ${newProperty.name} added successfully`)
      setIsAddPropertyOpen(false)
      setNewProperty({ name: "", address: "", rent_amount: 4500 })
    } catch (error) {
      console.error("[v0] Error adding property:", error)
      toast.error("Failed to add property")
    }
  }

  const handleAddTenant = async () => {
    if (!newTenant.property_id || !newTenant.name) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const { data, error } = await supabase
        .from("tenants")
        .insert([
          {
            ...newTenant,
            property_id: Number.parseInt(newTenant.property_id),
          },
        ])
        .select()
        .single()

      if (error) throw error

      setTenants([data, ...tenants])
      toast.success(`Tenant ${newTenant.name} added successfully`)
      setIsAddTenantOpen(false)
      setNewTenant({
        property_id: "",
        name: "",
        email: "",
        phone: "",
        lease_start: "",
        lease_end: "",
      })
    } catch (error) {
      console.error("[v0] Error adding tenant:", error)
      toast.error("Failed to add tenant")
    }
  }

  const handleAddMaintenance = async () => {
    if (!newMaintenance.property_id || !newMaintenance.title || !newMaintenance.description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert([
          {
            ...newMaintenance,
            property_id: Number.parseInt(newMaintenance.property_id),
            tenant_id: newMaintenance.tenant_id ? Number.parseInt(newMaintenance.tenant_id) : null,
            status: "open",
          },
        ])
        .select()
        .single()

      if (error) throw error

      setMaintenanceRequests([data, ...maintenanceRequests])
      toast.success("Maintenance request created successfully")
      setIsAddMaintenanceOpen(false)
      setNewMaintenance({
        property_id: "",
        tenant_id: "",
        title: "",
        description: "",
        priority: "medium",
      })
    } catch (error) {
      console.error("[v0] Error adding maintenance request:", error)
      toast.error("Failed to create maintenance request")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive"
      case "in_progress":
        return "default"
      case "completed":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Management</h1>
          <p className="text-muted-foreground mt-1">Manage properties, tenants, and maintenance requests</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Properties</h2>
            <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>Create a new property in the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="property-name">Property Name *</Label>
                    <Input
                      id="property-name"
                      placeholder="e.g., Block A - Unit 101"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-address">Address</Label>
                    <Input
                      id="property-address"
                      placeholder="e.g., Nairobi, Kenya"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-rent">Monthly Rent (KES)</Label>
                    <Input
                      id="property-rent"
                      type="number"
                      value={newProperty.rent_amount}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, rent_amount: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <Button onClick={handleAddProperty} className="w-full">
                    Add Property
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => {
              const propertyTenants = tenants.filter((t) => t.property_id === property.id)
              const isOccupied = propertyTenants.length > 0

              return (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Building2 className="h-8 w-8 text-primary" />
                      <Badge variant={isOccupied ? "default" : "secondary"}>{isOccupied ? "Occupied" : "Vacant"}</Badge>
                    </div>
                    <CardTitle>{property.name}</CardTitle>
                    <CardDescription>{property.address || "No address"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Rent:</span>
                        <span className="font-medium">KES {property.rent_amount?.toLocaleString() || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tenants:</span>
                        <span className="font-medium">{propertyTenants.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {properties.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No properties yet. Add one to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tenants" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Tenants</h2>
            <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tenant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Tenant</DialogTitle>
                  <DialogDescription>Register a new tenant to a property</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-property">Property *</Label>
                    <Select
                      value={newTenant.property_id}
                      onValueChange={(value) => setNewTenant({ ...newTenant, property_id: value })}
                    >
                      <SelectTrigger id="tenant-property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-name">Tenant Name *</Label>
                    <Input
                      id="tenant-name"
                      placeholder="e.g., John Kamau"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-email">Email</Label>
                    <Input
                      id="tenant-email"
                      type="email"
                      placeholder="tenant@email.com"
                      value={newTenant.email}
                      onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-phone">Phone</Label>
                    <Input
                      id="tenant-phone"
                      placeholder="+254712345678"
                      value={newTenant.phone}
                      onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tenant-lease-start">Lease Start</Label>
                      <Input
                        id="tenant-lease-start"
                        type="date"
                        value={newTenant.lease_start}
                        onChange={(e) => setNewTenant({ ...newTenant, lease_start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenant-lease-end">Lease End</Label>
                      <Input
                        id="tenant-lease-end"
                        type="date"
                        value={newTenant.lease_end}
                        onChange={(e) => setNewTenant({ ...newTenant, lease_end: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTenant} className="w-full">
                    Add Tenant
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tenant Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold">{properties.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Tenants</p>
                  <p className="text-2xl font-bold text-green-600">{tenants.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Occupied</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {properties.filter((p) => tenants.some((t) => t.property_id === p.id)).length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Vacant</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {properties.filter((p) => !tenants.some((t) => t.property_id === p.id)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((tenant) => {
              const property = properties.find((p) => p.id === tenant.property_id)

              return (
                <Card key={tenant.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Users className="h-6 w-6 text-primary" />
                      <Badge variant="outline">{property?.name || "Unknown Property"}</Badge>
                    </div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <CardDescription>
                      {tenant.email || "No email"} • {tenant.phone || "No phone"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      {tenant.lease_start && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lease Start:</span>
                          <span className="font-medium">{new Date(tenant.lease_start).toLocaleDateString()}</span>
                        </div>
                      )}
                      {tenant.lease_end && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lease End:</span>
                          <span className="font-medium">{new Date(tenant.lease_end).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {tenants.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No tenants yet. Add one to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Maintenance Requests</h2>
            <Dialog open={isAddMaintenanceOpen} onOpenChange={setIsAddMaintenanceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Maintenance Request</DialogTitle>
                  <DialogDescription>Report a maintenance issue</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maint-property">Property *</Label>
                    <Select
                      value={newMaintenance.property_id}
                      onValueChange={(value) => setNewMaintenance({ ...newMaintenance, property_id: value })}
                    >
                      <SelectTrigger id="maint-property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maint-tenant">Tenant (Optional)</Label>
                    <Select
                      value={newMaintenance.tenant_id}
                      onValueChange={(value) => setNewMaintenance({ ...newMaintenance, tenant_id: value })}
                    >
                      <SelectTrigger id="maint-tenant">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants
                          .filter((t) => t.property_id?.toString() === newMaintenance.property_id)
                          .map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id.toString()}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maint-title">Title *</Label>
                    <Input
                      id="maint-title"
                      placeholder="Brief description"
                      value={newMaintenance.title}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maint-description">Description *</Label>
                    <Textarea
                      id="maint-description"
                      placeholder="Detailed description of the issue..."
                      value={newMaintenance.description}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maint-priority">Priority</Label>
                    <Select
                      value={newMaintenance.priority}
                      onValueChange={(value) => setNewMaintenance({ ...newMaintenance, priority: value })}
                    >
                      <SelectTrigger id="maint-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddMaintenance} className="w-full">
                    Create Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {maintenanceRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No maintenance requests yet. Create one to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {maintenanceRequests.map((request) => {
                const property = properties.find((p) => p.id === request.property_id)
                const tenant = tenants.find((t) => t.id === request.tenant_id)

                return (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <CardDescription>
                            {property?.name || "Unknown Property"}
                            {tenant && ` • ${tenant.name}`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getPriorityColor(request.priority)}>{request.priority}</Badge>
                          <Badge variant={getStatusColor(request.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {request.status}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                        {request.assigned_to && <span>Assigned to: {request.assigned_to}</span>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
