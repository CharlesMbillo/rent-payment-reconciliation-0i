import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Unit, Property } from '../types';

interface ChartsViewProps {
  properties: Property[];
  selectedProperty: string;
}

export function ChartsView({ properties, selectedProperty }: ChartsViewProps) {
  const currentProperty = properties.find(p => p.id === selectedProperty);
  const allUnits = currentProperty?.floors.flatMap(floor => floor.units) || [];

  // Payment status distribution
  const statusData = [
    { name: 'Paid', value: allUnits.filter(u => u.status === 'Paid').length, color: '#10b981' },
    { name: 'Overdue', value: allUnits.filter(u => u.status === 'Overdue').length, color: '#ef4444' },
    { name: 'Partial', value: allUnits.filter(u => u.status === 'Partial').length, color: '#f59e0b' },
    { name: 'Vacant', value: allUnits.filter(u => u.status === 'Vacant').length, color: '#6b7280' }
  ];

  // Revenue by floor
  const floorRevenueData = currentProperty?.floors.map(floor => {
    const floorUnits = floor.units;
    const collected = floorUnits
      .filter(unit => unit.lastPayment && unit.status === 'Paid')
      .reduce((sum, unit) => sum + (unit.lastPayment?.amount || 0), 0);
    
    const potential = floorUnits.reduce((sum, unit) => sum + unit.rent, 0);
    
    return {
      floor: `Floor ${floor.number}`,
      collected,
      potential,
      outstanding: potential - collected
    };
  }) || [];

  // Unit type distribution
  const unitTypeData = [
    { 
      name: 'Residential', 
      total: allUnits.filter(u => u.type === 'Residential').length,
      occupied: allUnits.filter(u => u.type === 'Residential' && u.status !== 'Vacant').length,
      revenue: allUnits
        .filter(u => u.type === 'Residential' && u.lastPayment && u.status === 'Paid')
        .reduce((sum, u) => sum + (u.lastPayment?.amount || 0), 0)
    },
    { 
      name: 'Shop', 
      total: allUnits.filter(u => u.type === 'Shop').length,
      occupied: allUnits.filter(u => u.type === 'Shop' && u.status !== 'Vacant').length,
      revenue: allUnits
        .filter(u => u.type === 'Shop' && u.lastPayment && u.status === 'Paid')
        .reduce((sum, u) => sum + (u.lastPayment?.amount || 0), 0)
    }
  ];

  // Monthly trend (simulated)
  const monthlyTrend = [
    { month: 'Sep 2024', collected: 850000, target: 1000000 },
    { month: 'Oct 2024', collected: 920000, target: 1000000 },
    { month: 'Nov 2024', collected: 780000, target: 1000000 },
    { month: 'Dec 2024', collected: 650000, target: 1000000 },
    { month: 'Jan 2025', collected: 890000, target: 1000000 }
  ];

  const totalCollected = allUnits
    .filter(unit => unit.lastPayment && unit.status === 'Paid')
    .reduce((sum, unit) => sum + (unit.lastPayment?.amount || 0), 0);

  const totalOutstanding = allUnits
    .filter(unit => unit.status === 'Overdue' || unit.status === 'Partial')
    .reduce((sum, unit) => sum + (unit.rent - (unit.lastPayment?.amount || 0)), 0);

  const occupancyRate = allUnits.length > 0 
    ? (allUnits.filter(unit => unit.status !== 'Vacant').length / allUnits.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              KES {totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              KES {totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {occupancyRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Occupancy Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {allUnits.filter(u => u.status === 'Paid').length}
            </div>
            <p className="text-xs text-muted-foreground">Units Paid</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Unit Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Type Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={unitTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `KES ${Number(value).toLocaleString()}` : value,
                    name
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="total" fill="#8884d8" name="Total Units" />
                <Bar yAxisId="left" dataKey="occupied" fill="#82ca9d" name="Occupied Units" />
                <Bar yAxisId="right" dataKey="revenue" fill="#ffc658" name="Revenue (KES)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Floor */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Floor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={floorRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="floor" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value) => [`KES ${Number(value).toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="collected" stackId="a" fill="#10b981" name="Collected" />
                <Bar dataKey="outstanding" stackId="a" fill="#ef4444" name="Outstanding" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Collection Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value) => [`KES ${Number(value).toLocaleString()}`, '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="collected" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Collected"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#6b7280" 
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
