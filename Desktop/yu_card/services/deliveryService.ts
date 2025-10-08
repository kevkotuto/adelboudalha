import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  currentOrders: number;
  rating: number;
  totalDeliveries: number;
  avatar?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerKm: number;
  estimatedTime: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  isActive: boolean;
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  driver?: Driver;
  status: DeliveryStatus;
  recipientName: string;
  recipientPhone: string;
  address: {
    street: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  estimatedArrival?: string;
  actualArrival?: string;
  notes?: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateDeliveryRequest {
  status?: DeliveryStatus;
  driverId?: string;
  notes?: string;
  estimatedArrival?: string;
  actualArrival?: string;
}

export interface CreateDeliveryRequest {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  address: {
    street: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  notes?: string;
}

export interface DeliveryListParams {
  page?: number;
  limit?: number;
  status?: DeliveryStatus;
  driverId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DeliveryStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  failed: number;
  averageDeliveryTime: number;
  totalDistance: number;
}

class DeliveryService {
  // Delivery management
  async getAllDeliveries(params: DeliveryListParams = {}) {
    const response = await apiClient.get(API_ENDPOINTS.DELIVERIES, { params });
    return response.data;
  }

  async getDeliveryById(id: string) {
    const response = await apiClient.get(`${API_ENDPOINTS.DELIVERIES}/${id}`);
    return response.data;
  }

  async createDelivery(data: CreateDeliveryRequest) {
    const response = await apiClient.post(API_ENDPOINTS.DELIVERIES, data);
    return response.data;
  }

  async updateDelivery(id: string, data: UpdateDeliveryRequest) {
    const response = await apiClient.put(`${API_ENDPOINTS.DELIVERIES}/${id}`, data);
    return response.data;
  }

  async deleteDelivery(id: string) {
    const response = await apiClient.delete(`${API_ENDPOINTS.DELIVERIES}/${id}`);
    return response.data;
  }

  async assignDriver(deliveryId: string, driverId: string) {
    const response = await apiClient.put(`${API_ENDPOINTS.DELIVERIES}/${deliveryId}/assign`, {
      driverId,
    });
    return response.data;
  }

  async trackDelivery(trackingCode: string) {
    const response = await apiClient.get(`${API_ENDPOINTS.DELIVERIES}/track/${trackingCode}`);
    return response.data;
  }

  // Driver management
  async getAllDrivers(params: { page?: number; limit?: number; status?: string } = {}) {
    const response = await apiClient.get(API_ENDPOINTS.DRIVERS, { params });
    return response.data;
  }

  async getDriverById(id: string) {
    const response = await apiClient.get(`${API_ENDPOINTS.DRIVERS}/${id}`);
    return response.data;
  }

  async createDriver(data: Omit<Driver, 'id' | 'currentOrders' | 'rating' | 'totalDeliveries'>) {
    const response = await apiClient.post(API_ENDPOINTS.DRIVERS, data);
    return response.data;
  }

  async updateDriver(id: string, data: Partial<Driver>) {
    const response = await apiClient.put(`${API_ENDPOINTS.DRIVERS}/${id}`, data);
    return response.data;
  }

  async deleteDriver(id: string) {
    const response = await apiClient.delete(`${API_ENDPOINTS.DRIVERS}/${id}`);
    return response.data;
  }

  async getDriverDeliveries(driverId: string, params: DeliveryListParams = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.DRIVERS}/${driverId}/deliveries`, { params });
    return response.data;
  }

  // Delivery zones management
  async getAllZones() {
    const response = await apiClient.get(API_ENDPOINTS.DELIVERY_ZONES);
    return response.data;
  }

  async getZoneById(id: string) {
    const response = await apiClient.get(`${API_ENDPOINTS.DELIVERY_ZONES}/${id}`);
    return response.data;
  }

  async createZone(data: Omit<DeliveryZone, 'id'>) {
    const response = await apiClient.post(API_ENDPOINTS.DELIVERY_ZONES, data);
    return response.data;
  }

  async updateZone(id: string, data: Partial<DeliveryZone>) {
    const response = await apiClient.put(`${API_ENDPOINTS.DELIVERY_ZONES}/${id}`, data);
    return response.data;
  }

  async deleteZone(id: string) {
    const response = await apiClient.delete(`${API_ENDPOINTS.DELIVERY_ZONES}/${id}`);
    return response.data;
  }

  // Statistics and analytics
  async getDeliveryStats(dateFrom?: string, dateTo?: string) {
    const params = { dateFrom, dateTo };
    const response = await apiClient.get(`${API_ENDPOINTS.DELIVERIES}/stats`, { params });
    return response.data as DeliveryStats;
  }

  async getDriverStats(driverId: string, dateFrom?: string, dateTo?: string) {
    const params = { dateFrom, dateTo };
    const response = await apiClient.get(`${API_ENDPOINTS.DRIVERS}/${driverId}/stats`, { params });
    return response.data;
  }

  // Utility methods
  async calculateDeliveryFee(address: string, weight?: number) {
    const response = await apiClient.post(`${API_ENDPOINTS.DELIVERIES}/calculate-fee`, {
      address,
      weight,
    });
    return response.data;
  }

  async getEstimatedDeliveryTime(address: string) {
    const response = await apiClient.post(`${API_ENDPOINTS.DELIVERIES}/estimate-time`, {
      address,
    });
    return response.data;
  }

  // Real-time updates
  async subscribeToDeliveryUpdates(deliveryId: string, callback: (delivery: Delivery) => void) {
    // In a real implementation, this would establish a WebSocket connection
    // For now, we'll simulate with periodic polling
    const interval = setInterval(async () => {
      try {
        const delivery = await this.getDeliveryById(deliveryId);
        callback(delivery);
      } catch (error) {
        console.error('Error fetching delivery updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }

  // Bulk operations
  async bulkUpdateDeliveries(deliveryIds: string[], updates: Partial<UpdateDeliveryRequest>) {
    const response = await apiClient.put(`${API_ENDPOINTS.DELIVERIES}/bulk`, {
      deliveryIds,
      updates,
    });
    return response.data;
  }

  async exportDeliveries(params: DeliveryListParams & { format?: 'csv' | 'xlsx' } = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.DELIVERIES}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

export const deliveryService = new DeliveryService();