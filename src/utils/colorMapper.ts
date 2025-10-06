import { Unit } from '../types';

export type StatusColor = {
  background: string;
  text: string;
  border: string;
  hover: string;
};

export type StatusColors = {
  [K in Unit['status']]: StatusColor;
};

// Color mapping for payment statuses
export const statusColors: StatusColors = {
  Paid: {
    background: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-600',
    hover: 'hover:bg-green-600'
  },
  Overdue: {
    background: 'bg-red-500',
    text: 'text-white',
    border: 'border-red-600',
    hover: 'hover:bg-red-600'
  },
  Partial: {
    background: 'bg-amber-500',
    text: 'text-white',
    border: 'border-amber-600',
    hover: 'hover:bg-amber-600'
  },
  Vacant: {
    background: 'bg-gray-300 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-400 dark:border-gray-600',
    hover: 'hover:bg-gray-400 dark:hover:bg-gray-600'
  }
};

// Get status-specific styling classes
export function getStatusColor(status: Unit['status']): string {
  const colors = statusColors[status];
  return `${colors.background} ${colors.text} ${colors.hover}`;
}

// Get status background color only
export function getStatusBackground(status: Unit['status']): string {
  return statusColors[status].background;
}

// Get status text color only
export function getStatusTextColor(status: Unit['status']): string {
  return statusColors[status].text;
}

// Get status border color
export function getStatusBorderColor(status: Unit['status']): string {
  return statusColors[status].border;
}

// Get status hover color
export function getStatusHoverColor(status: Unit['status']): string {
  return statusColors[status].hover;
}

// Badge color mapping for different contexts
export const badgeColors = {
  Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Vacant: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

// Get badge styling for status
export function getBadgeColor(status: Unit['status']): string {
  return badgeColors[status];
}

// Status icons mapping
export const statusIcons = {
  Paid: '✓',
  Overdue: '!',
  Partial: '~',
  Vacant: '○'
};

// Get icon for status
export function getStatusIcon(status: Unit['status']): string {
  return statusIcons[status];
}

// Priority mapping for sorting/filtering
export const statusPriority = {
  Overdue: 1,    // Highest priority
  Partial: 2,    // Medium priority
  Vacant: 3,     // Low priority
  Paid: 4        // Lowest priority (good status)
};

// Get priority value for status
export function getStatusPriority(status: Unit['status']): number {
  return statusPriority[status];
}

// Color palette for charts and visualizations
export const chartColors = {
  primary: '#10b981',     // Green for positive metrics
  secondary: '#ef4444',   // Red for negative metrics
  warning: '#f59e0b',     // Amber for warnings
  neutral: '#6b7280',     // Gray for neutral data
  accent: '#3b82f6'       // Blue for accent data
};

// Get chart color by type
export function getChartColor(type: 'primary' | 'secondary' | 'warning' | 'neutral' | 'accent'): string {
  return chartColors[type];
}

// Revenue calculation helpers with color coding
export function getRevenueColorClass(collectionRate: number): string {
  if (collectionRate >= 90) return 'text-green-600';
  if (collectionRate >= 70) return 'text-amber-600';
  return 'text-red-600';
}

// Occupancy rate color coding
export function getOccupancyColorClass(occupancyRate: number): string {
  if (occupancyRate >= 85) return 'text-green-600';
  if (occupancyRate >= 70) return 'text-amber-600';
  return 'text-red-600';
}

// Property performance color coding
export function getPropertyPerformanceColor(paidPercentage: number): StatusColor {
  if (paidPercentage >= 85) return statusColors.Paid;
  if (paidPercentage >= 70) return statusColors.Partial;
  return statusColors.Overdue;
}

// Unit type color mapping
export const unitTypeColors = {
  Residential: {
    background: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800'
  },
  Shop: {
    background: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-800'
  }
};

// Get unit type styling
export function getUnitTypeColor(type: 'Residential' | 'Shop'): string {
  const colors = unitTypeColors[type];
  return `${colors.background} ${colors.text} ${colors.border}`;
}

// KYC status color mapping
export const kycStatusColors = {
  Verified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

// Get KYC status color
export function getKycStatusColor(status: 'Verified' | 'Pending' | 'Rejected'): string {
  return kycStatusColors[status];
}

// Payment method color mapping
export const paymentMethodColors = {
  'M-Pesa': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Jenga PGW': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Bank Transfer': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Cash': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

// Get payment method color
export function getPaymentMethodColor(method: string): string {
  return paymentMethodColors[method as keyof typeof paymentMethodColors] || paymentMethodColors['Cash'];
}

// Gradient mappings for visual elements
export const gradients = {
  success: 'from-green-400 to-green-600',
  warning: 'from-amber-400 to-amber-600',
  danger: 'from-red-400 to-red-600',
  neutral: 'from-gray-400 to-gray-600',
  primary: 'from-blue-400 to-blue-600'
};

// Get gradient class
export function getGradientClass(type: keyof typeof gradients): string {
  return `bg-gradient-to-r ${gradients[type]}`;
}

// Utility function to determine text color based on background
export function getContrastTextColor(backgroundColor: string): 'text-white' | 'text-black' {
  // Simple logic - in a real app, you might want more sophisticated color contrast calculation
  const darkBackgrounds = ['bg-green-500', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500'];
  return darkBackgrounds.some(bg => backgroundColor.includes(bg.split('-')[1])) ? 'text-white' : 'text-black';
}

// Export all utility functions
export default {
  getStatusColor,
  getStatusBackground,
  getStatusTextColor,
  getStatusBorderColor,
  getStatusHoverColor,
  getBadgeColor,
  getStatusIcon,
  getStatusPriority,
  getChartColor,
  getRevenueColorClass,
  getOccupancyColorClass,
  getPropertyPerformanceColor,
  getUnitTypeColor,
  getKycStatusColor,
  getPaymentMethodColor,
  getGradientClass,
  getContrastTextColor,
  statusColors,
  badgeColors,
  statusIcons,
  chartColors,
  unitTypeColors,
  kycStatusColors,
  paymentMethodColors,
  gradients
};
