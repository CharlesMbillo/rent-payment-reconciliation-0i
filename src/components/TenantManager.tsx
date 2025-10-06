import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Camera, 
  Upload, 
  FileImage, 
  Edit, 
  Trash2, 
  UserPlus, 
  Phone, 
  Mail, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Tenant } from '../types';
import { getAllUnits } from '../data/mockData';

interface TenantManagerProps {
  selectedProperty: string;
}

export function TenantManager({ selectedProperty }: TenantManagerProps) {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const units = getAllUnits();
    return units
      .filter(unit => unit.tenant && unit.roomNumber.startsWith(selectedProperty))
      .map(unit => unit.tenant!)
      .filter((tenant, index, self) => self.findIndex(t => t.id === tenant.id) === index);
  });
  
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    unitType: 'Residential' as 'Residential' | 'Shop'
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageCapture = () => {
    // Simulate camera capture
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.fillText('Captured Image', 60, 100);
      setCapturedImage(canvas.toDataURL());
    }
  };

  const handleFileUpload = (type: 'idFront' | 'idBack') => {
    // Simulate file upload
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, 0, 300, 200);
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.fillText(`ID ${type === 'idFront' ? 'Front' : 'Back'}`, 110, 100);
      
      if (type === 'idFront') {
        setIdFront(canvas.toDataURL());
      } else {
        setIdBack(canvas.toDataURL());
      }
    }
  };

  // Signature pad functionality
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignature(null);
  };

  const handleSubmit = () => {
    const depositAmount = formData.unitType === 'Shop' ? 8000 : 4500;
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      idNumber: formData.idNumber,
      depositAmount,
      moveInDate: new Date().toISOString().split('T')[0],
      profileImage: capturedImage || undefined,
      idFront: idFront || undefined,
      idBack: idBack || undefined,
      signature: signature || undefined,
      kycStatus: 'Pending'
    };

    setTenants(prev => [...prev, newTenant]);
    resetForm();
    setIsAddingTenant(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      idNumber: '',
      unitType: 'Residential'
    });
    setCapturedImage(null);
    setIdFront(null);
    setIdBack(null);
    setSignature(null);
  };

  const getKycStatusIcon = (status: Tenant['kycStatus']) => {
    switch (status) {
      case 'Verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getKycStatusColor = (status: Tenant['kycStatus']) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Tenant Management</h2>
          <p className="text-muted-foreground">
            Manage tenant onboarding, KYC verification, and profiles for Block {selectedProperty}
          </p>
        </div>
        
        <Dialog open={isAddingTenant} onOpenChange={setIsAddingTenant}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tenant Onboarding</DialogTitle>
              <DialogDescription>
                Complete tenant registration with KYC verification
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="photo">Photo Capture</TabsTrigger>
                <TabsTrigger value="documents">ID Documents</TabsTrigger>
                <TabsTrigger value="signature">Signature</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="0700000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="tenant@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitType">Unit Type</Label>
                    <select
                      id="unitType"
                      value={formData.unitType}
                      onChange={(e) => handleInputChange('unitType', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Residential">Residential (KES 4,500)</option>
                      <option value="Shop">Shop (KES 8,000)</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="photo" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="w-48 h-48 mx-auto border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Captured" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No photo captured</p>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleImageCapture}>
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>ID Front</Label>
                    <div className="w-full h-32 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                      {idFront ? (
                        <img src={idFront} alt="ID Front" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-center">
                          <FileImage className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">ID Front</p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload('idFront')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Front
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>ID Back</Label>
                    <div className="w-full h-32 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                      {idBack ? (
                        <img src={idBack} alt="ID Back" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-center">
                          <FileImage className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">ID Back</p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload('idBack')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Back
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signature" className="space-y-4">
                <div className="space-y-4">
                  <Label>Digital Signature</Label>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <canvas
                      ref={signatureCanvasRef}
                      width={600}
                      height={200}
                      className="border bg-white rounded cursor-crosshair w-full"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={clearSignature}>
                        Clear Signature
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddingTenant(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.phone}>
                Complete Onboarding
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenants in Block {selectedProperty}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Move-in Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tenants found for Block {selectedProperty}
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={tenant.profileImage} />
                          <AvatarFallback>
                            {tenant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{tenant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {tenant.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {tenant.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {tenant.idNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      KES {tenant.depositAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getKycStatusColor(tenant.kycStatus)}>
                        {getKycStatusIcon(tenant.kycStatus)}
                        {tenant.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.moveInDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTenant(tenant)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
