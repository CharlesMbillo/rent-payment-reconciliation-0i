import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Property } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface PropertySelectorProps {
  properties: Property[];
  selectedProperty: string;
  onPropertyChange: (propertyId: string) => void;
  children: React.ReactNode;
}

export function PropertySelector({ 
  properties, 
  selectedProperty, 
  onPropertyChange, 
  children 
}: PropertySelectorProps) {
  const getPropertyStats = (property: Property) => {
    const allUnits = property.floors.flatMap(floor => floor.units);
    const occupied = allUnits.filter(unit => unit.status !== 'Vacant').length;
    const paid = allUnits.filter(unit => unit.status === 'Paid').length;
    const overdue = allUnits.filter(unit => unit.status === 'Overdue').length;
    const partial = allUnits.filter(unit => unit.status === 'Partial').length;
    
    return { occupied, paid, overdue, partial, total: allUnits.length };
  };

  return (
    <Tabs value={selectedProperty} onValueChange={onPropertyChange} className="w-full">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
          {properties.map((property) => {
            const stats = getPropertyStats(property);
            return (
              <TabsTrigger 
                key={property.id} 
                value={property.id}
                className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="font-medium">Property {property.id}</span>
                <div className="flex gap-1 flex-wrap justify-center">
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-1 py-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {stats.paid}
                  </Badge>
                  {stats.overdue > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1 py-0 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    >
                      {stats.overdue}
                    </Badge>
                  )}
                  {stats.partial > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1 py-0 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                    >
                      {stats.partial}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {stats.occupied}/{stats.total}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {properties.map((property) => (
        <TabsContent key={property.id} value={property.id} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {(() => {
              const stats = getPropertyStats(property);
              return (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.paid}
                      </div>
                      <p className="text-xs text-muted-foreground">Paid Units</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.overdue}
                      </div>
                      <p className="text-xs text-muted-foreground">Overdue Units</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.partial}
                      </div>
                      <p className="text-xs text-muted-foreground">Partial Payments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {Math.round((stats.occupied / stats.total) * 100)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Occupancy Rate</p>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>
          {children}
        </TabsContent>
      ))}
    </Tabs>
  );
}
