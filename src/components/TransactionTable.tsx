import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Download, Filter } from 'lucide-react';
import { Payment, Unit } from '../types';

interface TransactionTableProps {
  units: Unit[];
}

export function TransactionTable({ units }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'tenant'>('date');

  // Extract all payments from units
  const payments = useMemo(() => {
    return units
      .filter(unit => unit.lastPayment && unit.tenant)
      .map(unit => ({
        ...unit.lastPayment!,
        tenantName: unit.tenant!.name,
        roomNumber: unit.roomNumber,
        unitType: unit.type
      }));
  }, [units]);

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let filtered = payments.filter(payment => {
      const matchesSearch = payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.transactionRef.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort payments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'tenant':
          return a.tenantName.localeCompare(b.tenantName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [payments, searchTerm, statusFilter, sortBy]);

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Partial':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      'Date,Tenant,Room,Type,Amount,Due Amount,Status,Method,Reference',
      ...filteredPayments.map(payment => 
        `${payment.paymentDate},${payment.tenantName},${payment.roomNumber},${payment.unitType},${payment.amount},${payment.dueAmount},${payment.status},${payment.paymentMethod},${payment.transactionRef}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Recent Transactions</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'tenant') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
                <SelectItem value="tenant">Sort by Tenant</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportTransactions} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{payment.tenantName}</TableCell>
                    <TableCell>{payment.roomNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {payment.unitType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      KES {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      KES {payment.dueAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.transactionRef}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredPayments.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredPayments.length} of {payments.length} transactions
          </div>
        )}
      </CardContent>
    </Card>
  );
}
