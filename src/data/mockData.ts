import { Property, Unit, Tenant, Payment, AuditLog, ConnectionStatus, User } from '../types';

// Kenyan names for tenants
const KENYAN_NAMES = [
  'John Kariuki', 'Mary Wanjiku', 'Peter Mwangi', 'Grace Akinyi', 'David Kiprop',
  'Sarah Nyambura', 'James Ochieng', 'Lucy Wambui', 'Michael Kiprotich', 'Catherine Njeri',
  'Samuel Maina', 'Rose Adhiambo', 'Francis Macharia', 'Margaret Wangari', 'Daniel Kimani',
  'Esther Moraa', 'Robert Omondi', 'Alice Chebet', 'Stephen Mutua', 'Joyce Wanjiru',
  'Paul Wamalwa', 'Hannah Nakato', 'Andrew Gitau', 'Beatrice Auma', 'Joseph Rono',
  'Faith Muthoni', 'Emmanuel Obiero', 'Priscilla Kiptoo', 'Vincent Kamau', 'Caroline Naserian'
];

const generatePhoneNumber = () => {
  const prefixes = ['0701', '0702', '0703', '0704', '0705', '0706', '0707', '0708', '0709', '0710'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return prefix + suffix;
};

const generateEmail = (name: string) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${cleanName}@${domain}`;
};

const generateIDNumber = () => {
  return Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
};

const getRandomStatus = (): 'Paid' | 'Overdue' | 'Partial' | 'Vacant' => {
  const statuses: ('Paid' | 'Overdue' | 'Partial' | 'Vacant')[] = ['Paid', 'Overdue', 'Partial', 'Vacant'];
  const weights = [0.6, 0.15, 0.1, 0.15]; // 60% paid, 15% overdue, 10% partial, 15% vacant
  
  const random = Math.random();
  let sum = 0;
  
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) {
      return statuses[i];
    }
  }
  
  return 'Paid';
};

const generateTenant = (name: string): Tenant => ({
  id: `tenant-${Math.random().toString(36).substr(2, 9)}`,
  name,
  phone: generatePhoneNumber(),
  email: generateEmail(name),
  idNumber: generateIDNumber(),
  depositAmount: Math.random() > 0.5 ? 4500 : 8000, // Matches rent amount
  moveInDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  kycStatus: Math.random() > 0.1 ? 'Verified' : 'Pending'
});

const generateUnitsForProperty = (propertyId: string, totalUnits: number): Unit[] => {
  const units: Unit[] = [];
  const unitsPerFloor = 28; // Based on Property A having 28 units per floor
  const totalFloors = Math.ceil(totalUnits / unitsPerFloor);
  
  let nameIndex = 0;
  
  for (let floor = 0; floor < totalFloors; floor++) {
    const unitsOnThisFloor = Math.min(unitsPerFloor, totalUnits - (floor * unitsPerFloor));
    
    for (let unitOnFloor = 1; unitOnFloor <= unitsOnThisFloor; unitOnFloor++) {
      const roomNumber = `${propertyId}${floor.toString().padStart(2, '0')}${unitOnFloor.toString().padStart(2, '0')}`;
      const isShop = floor === 0 && Math.random() > 0.7; // Ground floor shops
      const type: 'Residential' | 'Shop' = isShop ? 'Shop' : 'Residential';
      const rent = type === 'Shop' ? 8000 : 4500;
      const status = getRandomStatus();
      
      const unit: Unit = {
        id: `unit-${roomNumber}`,
        roomNumber,
        type,
        rent,
        status,
        floor: floor + 1, // Floor numbers start from 1
        dueDate: '2025-01-05' // 5th of current month
      };
      
      if (status !== 'Vacant' && nameIndex < KENYAN_NAMES.length) {
        unit.tenant = generateTenant(KENYAN_NAMES[nameIndex]);
        nameIndex++;
        
        // Generate payment if not vacant
        if (status !== 'Vacant') {
          const paymentAmount = status === 'Partial' ? rent * 0.6 : rent;
          unit.lastPayment = {
            id: `payment-${unit.id}`,
            tenantId: unit.tenant.id,
            unitId: unit.id,
            amount: paymentAmount,
            dueAmount: rent,
            paymentDate: status === 'Overdue' ? '2024-12-05' : '2025-01-03',
            dueDate: unit.dueDate,
            status: status === 'Vacant' ? 'Overdue' : status,
            transactionRef: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            paymentMethod: Math.random() > 0.5 ? 'M-Pesa' : 'Jenga PGW'
          };
        }
      }
      
      units.push(unit);
    }
  }
  
  return units;
};

const createProperty = (id: string, name: string, totalUnits: number): Property => {
  const units = generateUnitsForProperty(id, totalUnits);
  const floors: { [key: number]: Unit[] } = {};
  
  units.forEach(unit => {
    if (!floors[unit.floor]) {
      floors[unit.floor] = [];
    }
    floors[unit.floor].push(unit);
  });
  
  const floorArray = Object.keys(floors).map(floorNum => ({
    id: `${id}-floor-${floorNum}`,
    number: parseInt(floorNum),
    units: floors[parseInt(floorNum)]
  })).sort((a, b) => a.number - b.number);
  
  return {
    id,
    name,
    label: `Property ${id}`,
    totalUnits,
    floors: floorArray
  };
};

export const properties: Property[] = [
  createProperty('A', 'Block A', 224),
  createProperty('B', 'Block B', 200),
  createProperty('C', 'Block C', 180),
  createProperty('D', 'Block D', 200),
  createProperty('E', 'Block E', 200),
  createProperty('F', 'Block F', 190),
  createProperty('G', 'Block G', 200),
  createProperty('H', 'Block H', 74)
];

export const auditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    action: 'Payment Received',
    actor: 'System (Jenga PGW)',
    description: 'Payment of KES 4,500 received for Unit A0101',
    timestamp: '2025-01-06T10:30:00Z',
    entityType: 'Payment',
    entityId: 'payment-unit-A0101'
  },
  {
    id: 'audit-2',
    action: 'Tenant Onboarded',
    actor: 'John Manager',
    description: 'New tenant John Kariuki added to Unit B0205',
    timestamp: '2025-01-06T09:15:00Z',
    entityType: 'Tenant',
    entityId: 'tenant-john-kariuki'
  },
  {
    id: 'audit-3',
    action: 'Mode Changed',
    actor: 'Admin User',
    description: 'Switched from Demo Mode to Live IPN Feed',
    timestamp: '2025-01-06T08:45:00Z',
    entityType: 'System'
  }
];

export const connectionStatus: ConnectionStatus = {
  isLive: false,
  lastUpdate: new Date().toISOString(),
  mode: 'Demo Mode'
};

export const currentUser: User = {
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@rentroll.co.ke',
  role: 'Admin'
};

// Helper functions
export const getAllUnits = (): Unit[] => {
  return properties.flatMap(property => 
    property.floors.flatMap(floor => floor.units)
  );
};

export const getUnitsByStatus = (status: Unit['status']): Unit[] => {
  return getAllUnits().filter(unit => unit.status === status);
};

export const getTotalRentCollected = (): number => {
  return getAllUnits()
    .filter(unit => unit.lastPayment && unit.status === 'Paid')
    .reduce((total, unit) => total + (unit.lastPayment?.amount || 0), 0);
};

export const getTotalOutstanding = (): number => {
  return getAllUnits()
    .filter(unit => unit.status === 'Overdue' || unit.status === 'Partial')
    .reduce((total, unit) => {
      const outstanding = unit.rent - (unit.lastPayment?.amount || 0);
      return total + outstanding;
    }, 0);
};

export const getOccupancyRate = (): number => {
  const totalUnits = getAllUnits().length;
  const occupiedUnits = getAllUnits().filter(unit => unit.status !== 'Vacant').length;
  return (occupiedUnits / totalUnits) * 100;
};
