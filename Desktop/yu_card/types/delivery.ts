import { TimestampFields, ID, PhoneNumber, Email } from './index';

// Driver types
export interface Driver {
  id: ID;
  name: string;
  phone: PhoneNumber;
  email: Email;
  status: DriverStatus;
  currentOrders: number;
  rating: number;
  totalDeliveries: number;
  avatar?: string;
  vehicle?: DriverVehicle;
  location?: GeoLocation;
  isActive: boolean;
}

export type DriverStatus = 'available' | 'busy' | 'offline';

export interface DriverVehicle {
  type: 'motorcycle' | 'car' | 'bicycle' | 'van';
  make?: string;
  model?: string;
  licensePlate?: string;
  color?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

// Delivery Zone types
export interface DeliveryZone extends TimestampFields {
  id: ID;
  name: string;
  description?: string;
  basePrice: number;
  pricePerKm: number;
  estimatedTime: string;
  coordinates: GeoLocation[];
  isActive: boolean;
  maxWeight?: number;
  restrictions?: string[];
}

// Address types
export interface DeliveryAddress {
  street: string;
  city: string;
  postalCode?: string;
  region?: string;
  country?: string;
  coordinates?: GeoLocation;
  landmarks?: string;
  instructions?: string;
}

// Delivery types
export interface Delivery extends TimestampFields {
  id: ID;
  orderId: ID;
  trackingCode: string;
  driverId?: ID;
  driver?: Driver;
  status: DeliveryStatus;

  // Recipient information
  recipientName: string;
  recipientPhone: PhoneNumber;
  recipientEmail?: Email;
  address: DeliveryAddress;

  // Timing
  scheduledDate?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  deliveredAt?: string;

  // Logistics
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  // Status tracking
  statusHistory: DeliveryStatusChange[];
  notes?: string;
  internalNotes?: string;

  // Pricing
  deliveryFee: number;
  tip?: number;

  // Special requirements
  requiresSignature?: boolean;
  fragile?: boolean;
  priority: DeliveryPriority;

  // Photos/proof
  proofOfDelivery?: DeliveryProof;
}

export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'returned';

export type DeliveryPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface DeliveryStatusChange extends TimestampFields {
  id: ID;
  status: DeliveryStatus;
  notes?: string;
  location?: GeoLocation;
  changedBy?: ID;
  reason?: string;
}

export interface DeliveryProof {
  photos?: string[];
  signature?: string;
  recipientName?: string;
  notes?: string;
  timestamp: string;
}

// Request/Response types
export interface CreateDeliveryRequest {
  orderId: ID;
  recipientName: string;
  recipientPhone: PhoneNumber;
  recipientEmail?: Email;
  address: DeliveryAddress;
  scheduledDate?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  notes?: string;
  priority?: DeliveryPriority;
  requiresSignature?: boolean;
  fragile?: boolean;
}

export interface UpdateDeliveryRequest {
  status?: DeliveryStatus;
  driverId?: ID;
  notes?: string;
  internalNotes?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  deliveredAt?: string;
  proofOfDelivery?: DeliveryProof;
  statusReason?: string;
}

export interface DeliveryListParams {
  page?: number;
  limit?: number;
  status?: DeliveryStatus;
  driverId?: ID;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  priority?: DeliveryPriority;
  zoneId?: ID;
}

// Statistics types
export interface DeliveryStats {
  total: number;
  pending: number;
  assigned: number;
  inTransit: number;
  delivered: number;
  failed: number;
  cancelled: number;
  averageDeliveryTime: number;
  totalDistance: number;
  totalRevenue: number;
  successRate: number;
}

export interface DriverStats extends TimestampFields {
  driverId: ID;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  averageRating: number;
  totalDistance: number;
  averageDeliveryTime: number;
  totalRevenue: number;
  successRate: number;
  onTimeRate: number;
}

export interface DeliveryAnalytics {
  dailyDeliveries: {
    date: string;
    count: number;
    revenue: number;
  }[];
  popularZones: {
    zone: DeliveryZone;
    count: number;
  }[];
  driverPerformance: DriverStats[];
  averageDeliveryTimes: {
    zoneId: ID;
    zoneName: string;
    averageTime: number;
  }[];
}

// Route optimization types
export interface DeliveryRoute {
  id: ID;
  driverId: ID;
  deliveries: ID[];
  optimizedOrder: ID[];
  totalDistance: number;
  estimatedDuration: number;
  waypoints: GeoLocation[];
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface RouteOptimizationRequest {
  driverId: ID;
  deliveries: ID[];
  startLocation?: GeoLocation;
  constraints?: {
    maxDeliveries?: number;
    maxDuration?: number;
    maxDistance?: number;
    timeWindows?: {
      deliveryId: ID;
      earliest: string;
      latest: string;
    }[];
  };
}

// Notification types
export interface DeliveryNotification {
  id: ID;
  deliveryId: ID;
  recipientPhone: PhoneNumber;
  type: DeliveryNotificationType;
  message: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  retryCount: number;
}

export type DeliveryNotificationType =
  | 'order_confirmed'
  | 'driver_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'delayed';

// Real-time tracking types
export interface DeliveryTracking {
  deliveryId: ID;
  currentLocation?: GeoLocation;
  estimatedArrival?: string;
  status: DeliveryStatus;
  lastUpdate: string;
  route?: GeoLocation[];
  distanceRemaining?: number;
  timeRemaining?: number;
}

export interface TrackingUpdate {
  deliveryId: ID;
  location: GeoLocation;
  status?: DeliveryStatus;
  notes?: string;
  timestamp: string;
}