"use client"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  BarChart3,
  Building,
  Users,
  CreditCard,
  FileText,
  Settings,
  ChevronLeft,
  Home,
  TrendingUp,
  AlertCircle,
  Webhook,
} from "lucide-react"
import { cn } from "./ui/utils"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  notificationCount: number
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Overview & Room Matrix",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Charts & Reports",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: CreditCard,
    description: "Payment History",
  },
  {
    id: "tenants",
    label: "Tenants",
    icon: Users,
    description: "Manage Tenants",
  },
  {
    id: "properties",
    label: "Properties",
    icon: Building,
    description: "Property Management",
  },
  {
    id: "ipn",
    label: "IPN Management",
    icon: Webhook,
    description: "Jenga PGW Webhooks",
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    description: "Export & Audit",
  },
]

export function Sidebar({ isOpen, onClose, activeTab, onTabChange, notificationCount }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 transform border-r bg-background transition-transform duration-200 ease-in-out lg:relative lg:top-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start h-auto p-3"
                onClick={() => {
                  onTabChange(item.id)
                  onClose() // Close on mobile after selection
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                {item.id === "transactions" && notificationCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="border-t p-4 space-y-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Collection Rate</p>
                    <p className="text-xs text-muted-foreground">89.2% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pending Actions</p>
                    <p className="text-xs text-muted-foreground">5 items need attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
