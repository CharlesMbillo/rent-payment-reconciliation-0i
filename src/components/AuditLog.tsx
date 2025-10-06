import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, 
  Download, 
  Filter, 
  Calendar,
  User,
  CreditCard,
  Building,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Clock
} from 'lucide-react';
import { AuditLog as AuditLogType } from '../types';

// Extended audit logs with more comprehensive data
const auditLogs: AuditLogType[] = [
  {
    id: 'audit-1',
    action: 'Payment Received',
    actor: 'System (Jenga PGW)',
    description: 'Payment of KES 4,500 received for Unit A0101 - John Kariuki',
    timestamp: '2025-01-06T10:30:00Z',
    entityType: 'Payment',
    entityId: 'payment-unit-A0101'
  },
  {
    id: 'audit-2',
    action: 'Tenant Onboarded',
    actor: 'John Manager',
    description: 'New tenant Mary Wanjiku added to Unit B0205 with KYC verification',
    timestamp: '2025-01-06T09:15:00Z',
    entityType: 'Tenant',
    entityId: 'tenant-mary-wanjiku'
  },
  {
    id: 'audit-3',
    action: 'Mode Changed',
    actor: 'Admin User',
    description: 'Switched from Demo Mode to Live IPN Feed',
    timestamp: '2025-01-06T08:45:00Z',
    entityType: 'System'
  },
  {
    id: 'audit-4',
    action: 'Payment Status Updated',
    actor: 'Sarah Property Manager',
    description: 'Unit C0312 marked as overdue - Peter Mwangi',
    timestamp: '2025-01-06T08:30:00Z',
    entityType: 'Payment',
    entityId: 'payment-unit-C0312'
  },
  {
    id: 'audit-5',
    action: 'Partial Payment Received',
    actor: 'System (M-Pesa)',
    description: 'Partial payment of KES 2,700 received for Unit D0108 - Grace Akinyi',
    timestamp: '2025-01-06T07:22:00Z',
    entityType: 'Payment',
    entityId: 'payment-unit-D0108'
  },
  {
    id: 'audit-6',
    action: 'KYC Verification',
    actor: 'Admin User',
    description: 'KYC documents verified for David Kiprop - Unit E0201',
    timestamp: '2025-01-06T06:45:00Z',
    entityType: 'Tenant',
    entityId: 'tenant-david-kiprop'
  },
  {
    id: 'audit-7',
    action: 'Unit Vacated',
    actor: 'Michael Caretaker',
    description: 'Unit F0156 marked as vacant - Tenant moved out',
    timestamp: '2025-01-06T06:00:00Z',
    entityType: 'Unit',
    entityId: 'unit-F0156'
  },
  {
    id: 'audit-8',
    action: 'Deposit Refund',
    actor: 'Finance Team',
    description: 'Security deposit of KES 4,500 refunded to former tenant - Unit G0089',
    timestamp: '2025-01-05T16:30:00Z',
    entityType: 'Payment',
    entityId: 'refund-unit-G0089'
  },
  {
    id: 'audit-9',
    action: 'Property Configuration',
    actor: 'System Admin',
    description: 'Added new shop units to Block H ground floor',
    timestamp: '2025-01-05T14:15:00Z',
    entityType: 'Unit',
    entityId: 'property-H'
  },
  {
    id: 'audit-10',
    action: 'HMAC Verification Failed',
    actor: 'System (Jenga PGW)',
    description: 'IPN webhook received with invalid HMAC signature - Transaction rejected',
    timestamp: '2025-01-05T13:45:00Z',
    entityType: 'System',
    entityId: 'ipn-verification-failed'
  }
];

interface AuditLogProps {
  selectedProperty?: string;
}

export function AuditLog({ selectedProperty }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'action' | 'actor'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort audit logs
  const filteredLogs = useMemo(() => {
    let filtered = auditLogs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
      
      const matchesProperty = !selectedProperty || 
                            log.description.includes(`Unit ${selectedProperty}`) ||
                            log.description.includes(`Block ${selectedProperty}`) ||
                            log.entityType === 'System';
      
      return matchesSearch && matchesEntity && matchesProperty;
    });

    // Sort logs
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'action':
          comparison = a.action.localeCompare(b.action);
          break;
        case 'actor':
          comparison = a.actor.localeCompare(b.actor);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [auditLogs, searchTerm, entityFilter, selectedProperty, sortBy, sortOrder]);

  const getEntityIcon = (entityType: AuditLogType['entityType']) => {
    switch (entityType) {
      case 'Payment':
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'Tenant':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'Unit':
        return <Building className="h-4 w-4 text-purple-600" />;
      case 'System':
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEntityColor = (entityType: AuditLogType['entityType']) => {
    switch (entityType) {
      case 'Payment':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Tenant':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Unit':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'System':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Payment') || action.includes('Refund')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (action.includes('Failed') || action.includes('Rejected')) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else if (action.includes('Verification') || action.includes('KYC')) {
      return <CheckCircle className="h-4 w-4 text-blue-600" />;
    } else {
      return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const exportAuditLog = () => {
    const csvContent = [
      'Timestamp,Action,Actor,Description,Entity Type,Entity ID',
      ...filteredLogs.map(log => 
        `${log.timestamp},${log.action},${log.actor},"${log.description}",${log.entityType},${log.entityId || ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${selectedProperty || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Audit Log</h2>
          <p className="text-muted-foreground">
            System activity and action history
            {selectedProperty && ` for Block ${selectedProperty}`}
          </p>
        </div>
        
        <Button onClick={exportAuditLog} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Activity History</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="Tenant">Tenant</SelectItem>
                  <SelectItem value="Unit">Unit</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [sort, order] = value.split('-');
                setSortBy(sort as 'timestamp' | 'action' | 'actor');
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger className="w-full sm:w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp-desc">Latest First</SelectItem>
                  <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                  <SelectItem value="action-asc">Action A-Z</SelectItem>
                  <SelectItem value="actor-asc">Actor A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="font-medium">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{log.actor}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-muted-foreground truncate">
                          {log.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEntityColor(log.entityType)}>
                          {getEntityIcon(log.entityType)}
                          {log.entityType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.entityId || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredLogs.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {auditLogs.length} audit entries
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
