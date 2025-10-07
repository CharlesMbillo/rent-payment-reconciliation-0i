"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import type { Property, Unit } from "../types"

interface RoomMatrixViewProps {
  property: Property
  onUnitClick: (unit: Unit) => void
}

const getStatusColor = (status: Unit["status"]) => {
  switch (status) {
    case "Paid":
      return "bg-green-500 hover:bg-green-600"
    case "Overdue":
      return "bg-red-500 hover:bg-red-600"
    case "Partial":
      return "bg-amber-500 hover:bg-amber-600"
    case "Vacant":
      return "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
    default:
      return "bg-gray-300 hover:bg-gray-400"
  }
}

const getStatusIcon = (status: Unit["status"]) => {
  switch (status) {
    case "Paid":
      return "✓"
    case "Overdue":
      return "!"
    case "Partial":
      return "~"
    case "Vacant":
      return "○"
    default:
      return "?"
  }
}

export function RoomMatrixView({ property, onUnitClick }: RoomMatrixViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{property.name}</h2>
          <p className="text-muted-foreground">
            {property.totalUnits} units across {property.floors.length} floors
          </p>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <span>Vacant</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {property.floors
          .sort((a, b) => b.number - a.number) // Show highest floor first
          .map((floor) => (
            <Card key={floor.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>{floor.number === 0 ? "Ground Floor" : `Floor ${floor.number}`}</span>
                  <Badge variant="outline">{floor.units.length} units</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-14 lg:grid-cols-16 xl:grid-cols-20 gap-2">
                  {floor.units.map((unit) => (
                    <TooltipProvider key={unit.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onUnitClick(unit)}
                            className={`
                            aspect-square rounded-md transition-all duration-200 
                            flex items-center justify-center text-white text-xs font-medium
                            shadow-sm hover:shadow-md transform hover:scale-105
                            ${getStatusColor(unit.status)}
                          `}
                          >
                            <span className="sr-only">{unit.roomNumber}</span>
                            {getStatusIcon(unit.status)}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">Room {unit.roomNumber}</p>
                            <p className="text-sm">Type: {unit.type}</p>
                            <p className="text-sm">Rent: KES {unit.rent.toLocaleString()}</p>
                            <p className="text-sm">Status: {unit.status}</p>
                            {unit.tenant && <p className="text-sm">Tenant: {unit.tenant.name}</p>}
                            {unit.lastPayment && (
                              <p className="text-sm">Last Payment: KES {unit.lastPayment.amount.toLocaleString()}</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
