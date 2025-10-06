import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Unit } from '../types';

interface UnitDetailsDialogProps {
  unit: Unit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentUpdate: (unitId: string, status: Unit['status']) => void;
}

export function UnitDetailsDialog({ unit, open, onOpenChange, onPaymentUpdate }: UnitDetailsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!unit) return null;

  const getStatusIcon = (status: Unit['status']) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Partial':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'Vacant':
        return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Unit['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Partial':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Vacant':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleStatusUpdate = async (newStatus: Unit['status']) => {
    setIsUpdating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onPaymentUpdate(unit.id, newStatus);
    setIsUpdating(false);
  };

  const outstanding = unit.rent - (unit.lastPayment?.amount || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Room {unit.roomNumber}
            <Badge className={getStatusColor(unit.status)}>
              {getStatusIcon(unit.status)}
              {unit.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {unit.type} • Floor {unit.floor} • KES {unit.rent.toLocaleString()}/month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Unit Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{unit.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="font-medium">KES {unit.rent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-medium">Floor {unit.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(unit.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Information */}
          {unit.tenant ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tenant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={unit.tenant.profileImage} />
                    <AvatarFallback>
                      {unit.tenant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{unit.tenant.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {unit.tenant.kycStatus}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{unit.tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{unit.tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">ID: {unit.tenant.idNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Moved in: {new Date(unit.tenant.moveInDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Security Deposit</p>
                  <p className="font-medium">KES {unit.tenant.depositAmount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p>This unit is currently vacant</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          {unit.lastPayment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Payment</p>
                    <p className="font-medium">KES {unit.lastPayment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Date</p>
                    <p className="font-medium">
                      {new Date(unit.lastPayment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium">{unit.lastPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-medium text-xs">{unit.lastPayment.transactionRef}</p>
                  </div>
                </div>
                
                {outstanding > 0 && (
                  <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">Outstanding Amount</p>
                    <p className="font-bold text-red-700 dark:text-red-300">
                      KES {outstanding.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {unit.status !== 'Vacant' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {unit.status !== 'Paid' && (
                    <Button
                      onClick={() => handleStatusUpdate('Paid')}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Paid
                    </Button>
                  )}
                  {unit.status !== 'Partial' && unit.status !== 'Vacant' && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate('Partial')}
                      disabled={isUpdating}
                    >
                      Mark as Partial
                    </Button>
                  )}
                  {unit.status !== 'Overdue' && unit.status !== 'Vacant' && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate('Overdue')}
                      disabled={isUpdating}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Mark as Overdue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
