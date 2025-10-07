import type { Property, Unit, Tenant, AuditLog, ConnectionStatus, User } from "../types"

// Kenyan names for tenants
const KENYAN_NAMES = [
  "John Kariuki",
  "Mary Wanjiku",
  "Peter Mwangi",
  "Grace Akinyi",
  "David Kiprop",
  "Sarah Nyambura",
  "James Ochieng",
  "Lucy Wambui",
  "Michael Kiprotich",
  "Catherine Njeri",
  "Samuel Maina",
  "Rose Adhiambo",
  "Francis Macharia",
  "Margaret Wangari",
  "Daniel Kimani",
  "Esther Moraa",
  "Robert Omondi",
  "Alice Chebet",
  "Stephen Mutua",
  "Joyce Wanjiru",
  "Paul Wamalwa",
  "Hannah Nakato",
  "Andrew Gitau",
  "Beatrice Auma",
  "Joseph Rono",
  "Faith Muthoni",
  "Emmanuel Obiero",
  "Priscilla Kiptoo",
  "Vincent Kamau",
  "Caroline Naserian",
]

const generatePhoneNumber = () => {
  const prefixes = ["0701", "0702", "0703", "0704", "0705", "0706", "0707", "0708", "0709", "0710"]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
  return prefix + suffix
}

const generateEmail = (name: string) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, ".")
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${cleanName}@${domain}`
}

const generateIDNumber = () => {
  return Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0")
}

const getRandomStatus = (): "Paid" | "Overdue" | "Partial" | "Vacant" => {
  const statuses: ("Paid" | "Overdue" | "Partial" | "Vacant")[] = ["Paid", "Overdue", "Partial", "Vacant"]
  const weights = [0.6, 0.15, 0.1, 0.15] // 60% paid, 15% overdue, 10% partial, 15% vacant

  const random = Math.random()
  let sum = 0

  for (let i = 0; i < weights.length; i++) {
    sum += weights[i]
    if (random <= sum) {
      return statuses[i]
    }
  }

  return "Paid"
}

const generateTenant = (name: string): Tenant => ({
  id: `tenant-${Math.random().toString(36).substr(2, 9)}`,
  name,
  phone: generatePhoneNumber(),
  email: generateEmail(name),
  idNumber: generateIDNumber(),
  depositAmount: Math.random() > 0.5 ? 4500 : 8000, // Matches rent amount
  moveInDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  kycStatus: Math.random() > 0.1 ? "Verified" : "Pending",
})

const BLOCK_CONFIGS = [
  { id: "A", name: "Block A", total: 224, perFloor: 28, lastFloor: 28 },
  { id: "B", name: "Block B", total: 231, perFloor: 28, lastFloor: 7 },
  { id: "C", name: "Block C", total: 224, perFloor: 28, lastFloor: 28 },
  { id: "D", name: "Block D", total: 358, perFloor: 42, lastFloor: 22 },
  { id: "E", name: "Block E", total: 350, perFloor: 42, lastFloor: 14 },
  { id: "F", name: "Block F", total: 234, perFloor: 28, lastFloor: 10 },
  { id: "G", name: "Block G", total: 234, perFloor: 28, lastFloor: 10 },
  { id: "H", name: "Block H", total: 74, perFloor: 9, lastFloor: 2 },
]

const generateUnitsForProperty = (
  propertyId: string,
  totalUnits: number,
  unitsPerFloor: number,
  lastFloorUnits: number,
): Unit[] => {
  const units: Unit[] = []
  const totalFloors = Math.ceil(totalUnits / unitsPerFloor)

  let nameIndex = 0
  let roomCount = 0

  // Generate units for floors 0-7 (Ground Floor to 7th Floor)
  for (let floor = 0; floor < 8 && roomCount < totalUnits; floor++) {
    const unitsOnThisFloor =
      floor === 7 && totalUnits > unitsPerFloor * 8
        ? Math.min(unitsPerFloor, totalUnits - roomCount)
        : Math.min(unitsPerFloor, totalUnits - roomCount)

    for (let unitOnFloor = 1; unitOnFloor <= unitsOnThisFloor && roomCount < totalUnits; unitOnFloor++) {
      const roomNumber = `${propertyId}${floor.toString().padStart(2, "0")}${unitOnFloor.toString().padStart(2, "0")}`
      const isShop = floor === 0 && Math.random() > 0.8 // Ground floor shops (20% chance)
      const type: "Residential" | "Shop" = isShop ? "Shop" : "Residential"
      const rent = type === "Shop" ? 8000 : 4500
      const status = getRandomStatus()

      const unit: Unit = {
        id: `unit-${roomNumber}`,
        roomNumber,
        type,
        rent,
        status,
        floor: floor, // Floor numbers start from 0 (Ground Floor)
        dueDate: "2025-01-05", // 5th of current month
      }

      if (status !== "Vacant" && nameIndex < KENYAN_NAMES.length) {
        unit.tenant = generateTenant(KENYAN_NAMES[nameIndex])
        nameIndex++

        // Generate payment if not vacant
        if (status !== "Vacant") {
          const paymentAmount = status === "Partial" ? rent * 0.6 : rent
          unit.lastPayment = {
            id: `payment-${unit.id}`,
            tenantId: unit.tenant.id,
            unitId: unit.id,
            amount: paymentAmount,
            dueAmount: rent,
            paymentDate: status === "Overdue" ? "2024-12-05" : "2025-01-03",
            dueDate: unit.dueDate,
            status: status === "Vacant" ? "Overdue" : status,
            transactionRef: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            paymentMethod: Math.random() > 0.5 ? "M-Pesa" : "Jenga PGW",
          }
        }
      }

      units.push(unit)
      roomCount++
    }
  }

  // Handle 8th floor if there are remaining rooms
  if (roomCount < totalUnits && lastFloorUnits > 0) {
    for (let unitOnFloor = 1; unitOnFloor <= lastFloorUnits && roomCount < totalUnits; unitOnFloor++) {
      const roomNumber = `${propertyId}08${unitOnFloor.toString().padStart(2, "0")}`
      const type: "Residential" | "Shop" = "Residential"
      const rent = 4500
      const status = getRandomStatus()

      const unit: Unit = {
        id: `unit-${roomNumber}`,
        roomNumber,
        type,
        rent,
        status,
        floor: 8, // 8th floor
        dueDate: "2025-01-05",
      }

      if (status !== "Vacant" && nameIndex < KENYAN_NAMES.length) {
        unit.tenant = generateTenant(KENYAN_NAMES[nameIndex])
        nameIndex++

        if (status !== "Vacant") {
          const paymentAmount = status === "Partial" ? rent * 0.6 : rent
          unit.lastPayment = {
            id: `payment-${unit.id}`,
            tenantId: unit.tenant.id,
            unitId: unit.id,
            amount: paymentAmount,
            dueAmount: rent,
            paymentDate: status === "Overdue" ? "2024-12-05" : "2025-01-03",
            dueDate: unit.dueDate,
            status: status === "Vacant" ? "Overdue" : status,
            transactionRef: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            paymentMethod: Math.random() > 0.5 ? "M-Pesa" : "Jenga PGW",
          }
        }
      }

      units.push(unit)
      roomCount++
    }
  }

  return units
}

const createProperty = (
  id: string,
  name: string,
  totalUnits: number,
  perFloor: number,
  lastFloor: number,
): Property => {
  const units = generateUnitsForProperty(id, totalUnits, perFloor, lastFloor)
  const floors: { [key: number]: Unit[] } = {}

  units.forEach((unit) => {
    if (!floors[unit.floor]) {
      floors[unit.floor] = []
    }
    floors[unit.floor].push(unit)
  })

  const floorArray = Object.keys(floors)
    .map((floorNum) => ({
      id: `${id}-floor-${floorNum}`,
      number: Number.parseInt(floorNum),
      units: floors[Number.parseInt(floorNum)],
    }))
    .sort((a, b) => a.number - b.number)

  return {
    id,
    name,
    label: `Property ${id}`,
    totalUnits,
    floors: floorArray,
  }
}

export const properties: Property[] = BLOCK_CONFIGS.map((config) =>
  createProperty(config.id, config.name, config.total, config.perFloor, config.lastFloor),
)

export const auditLogs: AuditLog[] = [
  {
    id: "audit-1",
    action: "Payment Received",
    actor: "System (Jenga PGW)",
    description: "Payment of KES 4,500 received for Unit A0101",
    timestamp: "2025-01-06T10:30:00Z",
    entityType: "Payment",
    entityId: "payment-unit-A0101",
  },
  {
    id: "audit-2",
    action: "Tenant Onboarded",
    actor: "John Manager",
    description: "New tenant John Kariuki added to Unit B0205",
    timestamp: "2025-01-06T09:15:00Z",
    entityType: "Tenant",
    entityId: "tenant-john-kariuki",
  },
  {
    id: "audit-3",
    action: "Mode Changed",
    actor: "Admin User",
    description: "Switched from Demo Mode to Live IPN Feed",
    timestamp: "2025-01-06T08:45:00Z",
    entityType: "System",
  },
]

export const connectionStatus: ConnectionStatus = {
  isLive: false,
  lastUpdate: new Date().toISOString(),
  mode: "Demo Mode",
}

export const currentUser: User = {
  id: "user-1",
  name: "Admin User",
  email: "admin@rentflow.co.ke",
  role: "Admin",
}

// Helper functions
export const getAllUnits = (): Unit[] => {
  return properties.flatMap((property) => property.floors.flatMap((floor) => floor.units))
}

export const getUnitsByStatus = (status: Unit["status"]): Unit[] => {
  return getAllUnits().filter((unit) => unit.status === status)
}

export const getTotalRentCollected = (): number => {
  return getAllUnits()
    .filter((unit) => unit.lastPayment && unit.status === "Paid")
    .reduce((total, unit) => total + (unit.lastPayment?.amount || 0), 0)
}

export const getTotalOutstanding = (): number => {
  return getAllUnits()
    .filter((unit) => unit.status === "Overdue" || unit.status === "Partial")
    .reduce((total, unit) => {
      const outstanding = unit.rent - (unit.lastPayment?.amount || 0)
      return total + outstanding
    }, 0)
}

export const getOccupancyRate = (): number => {
  const totalUnits = getAllUnits().length
  const occupiedUnits = getAllUnits().filter((unit) => unit.status !== "Vacant").length
  return (occupiedUnits / totalUnits) * 100
}
