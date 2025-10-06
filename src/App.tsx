"use client"

import { useState, useEffect } from "react"
import { Header } from "./components/Header"
import { Sidebar } from "./components/Sidebar"
import { PropertySelector } from "./components/PropertySelector"
import { RoomMatrixView } from "./components/RoomMatrixView"
import { UnitDetailsDialog } from "./components/UnitDetailsDialog"
import { TransactionTable } from "./components/TransactionTable"
import { ChartsView } from "./components/ChartsView"
import { TenantManager } from "./components/TenantManager"
import { AuditLog } from "./components/AuditLog"
import { useWebSocket } from "./hooks/useWebSocket"
import { toast } from "sonner"
import { Toaster } from "./components/ui/sonner"
import { properties, connectionStatus as initialConnectionStatus, currentUser, getAllUnits } from "./data/mockData"
import type { Unit, ConnectionStatus } from "./types"
import { PropertyManagement } from "./components/PropertyManagement"
import { IPNManagement } from "./components/IPNManagement"

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedProperty, setSelectedProperty] = useState("A")
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(initialConnectionStatus)
  const [units, setUnits] = useState(getAllUnits())

  // WebSocket integration for real-time updates
  const { isConnected, lastMessage, connectionState } = useWebSocket({
    url: connectionStatus.isLive ? "ws://localhost:3001/ws" : "ws://localhost:3001/demo",
    onMessage: (message) => {
      switch (message.type) {
        case "payment_update":
          handleRealTimePaymentUpdate(message.data)
          break
        case "tenant_update":
          toast.info("Tenant information updated")
          break
        case "system_status":
          // Update connection status based on system message
          break
        case "audit_log":
          toast.success(message.data.description)
          break
      }
    },
    onConnect: () => {
      toast.success("Connected to real-time updates")
    },
    onDisconnect: () => {
      toast.warning("Disconnected from real-time updates")
    },
  })

  const handleRealTimePaymentUpdate = (paymentData: any) => {
    setUnits((currentUnits) =>
      currentUnits.map((unit) =>
        unit.id === paymentData.unitId
          ? {
              ...unit,
              status: paymentData.status,
              lastPayment: {
                ...unit.lastPayment!,
                amount: paymentData.amount,
                paymentDate: paymentData.timestamp,
                status: paymentData.status,
              },
            }
          : unit,
      ),
    )

    toast.success(`Payment received for ${paymentData.unitId}`)
  }

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark)

    setIsDarkMode(shouldUseDark)
    document.documentElement.classList.toggle("dark", shouldUseDark)
  }, [])

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    document.documentElement.classList.toggle("dark", newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  const handleModeChange = (isLive: boolean) => {
    setConnectionStatus({
      isLive,
      lastUpdate: new Date().toISOString(),
      mode: isLive ? "Live IPN Feed" : "Demo Mode",
    })

    // Show toast notification about mode change
    toast.info(`Switched to ${isLive ? "Live IPN Feed" : "Demo Mode"}`)
  }

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit)
  }

  const handlePaymentUpdate = (unitId: string, newStatus: Unit["status"]) => {
    setUnits((currentUnits) => currentUnits.map((unit) => (unit.id === unitId ? { ...unit, status: newStatus } : unit)))

    // Update the selected unit if it's the one being updated
    if (selectedUnit?.id === unitId) {
      setSelectedUnit((prev) => (prev ? { ...prev, status: newStatus } : null))
    }

    // Close the dialog after update
    setSelectedUnit(null)
  }

  const currentProperty = properties.find((p) => p.id === selectedProperty)
  const currentPropertyUnits = currentProperty?.floors.flatMap((floor) => floor.units) || []

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <PropertySelector
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
          >
            {currentProperty && <RoomMatrixView property={currentProperty} onUnitClick={handleUnitClick} />}
          </PropertySelector>
        )

      case "analytics":
        return (
          <PropertySelector
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
          >
            <ChartsView properties={properties} selectedProperty={selectedProperty} />
          </PropertySelector>
        )

      case "transactions":
        return (
          <PropertySelector
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
          >
            <TransactionTable units={currentPropertyUnits} />
          </PropertySelector>
        )

      case "tenants":
        return (
          <PropertySelector
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
          >
            <TenantManager selectedProperty={selectedProperty} />
          </PropertySelector>
        )

      case "properties":
        return <PropertyManagement />

      case "ipn":
        return <IPNManagement />

      case "reports":
        return (
          <PropertySelector
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
          >
            <AuditLog selectedProperty={selectedProperty} />
          </PropertySelector>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={currentUser}
        connectionStatus={{
          ...connectionStatus,
          isLive: connectionStatus.isLive && isConnected,
        }}
        onModeChange={handleModeChange}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notificationCount={lastMessage ? 4 : 3}
        />

        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>

      <UnitDetailsDialog
        unit={selectedUnit}
        open={!!selectedUnit}
        onOpenChange={(open) => !open && setSelectedUnit(null)}
        onPaymentUpdate={handlePaymentUpdate}
      />

      <Toaster position="top-right" theme={isDarkMode ? "dark" : "light"} richColors />
    </div>
  )
}
