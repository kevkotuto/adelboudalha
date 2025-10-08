import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  Order,
  OrderItem,
  OrderTracking,
  TrackingEvent,
  OrderSummary,
  CreateOrderRequest,
  CancelOrderRequest,
  UpdateOrderStatusRequest,
  CreateTrackingRequest,
  AddTrackingEventRequest,
  OrderFilters,
  PaginatedResponse,
  OrderStatus,
} from '@/types';
import { productHelpers } from './productService';

// ==================================
// ORDER SERVICE
// ==================================

export class OrderService {
  // ==================================
  // ORDER MANAGEMENT
  // ==================================

  /**
   * Create new order from cart
   * @param orderData - Order creation data
   * @returns Created order with all details
   */
  async createOrder(orderData: {
    shippingAddressId?: string;
    billingAddressId?: string;
    paymentMethod: 'WAVE';
    contactPhone: string;
    notes?: string;
    promotionCode?: string;
  }): Promise<Order> {
    console.log('📦 OrderService.createOrder called with:', {
      endpoint: API_ENDPOINTS.ORDERS.CREATE,
      data: orderData,
    });

    try {
      const result = await apiClient.post<any>(API_ENDPOINTS.ORDERS.CREATE, orderData);
      console.log('✅ Order created successfully, raw result:', result);
      console.log('✅ Result type:', typeof result);
      console.log('✅ Result keys:', result ? Object.keys(result) : 'null');

      // Handle different response structures
      // Backend may return { order: {...} } or directly {...}
      const order = result?.order || result;

      if (!order || !order.id) {
        console.error('❌ Invalid order structure:', { result, order });
        throw new Error('La commande a été créée mais la réponse du serveur est invalide');
      }

      console.log('✅ Extracted order:', order);
      return order as Order;
    } catch (error: any) {
      console.error('❌ OrderService.createOrder failed:', {
        error: error.message,
        endpoint: API_ENDPOINTS.ORDERS.CREATE,
        data: orderData,
      });
      throw error;
    }
  }

  /**
   * Get user's orders with pagination and filters
   */
  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    return await apiClient.getPaginated<Order>(API_ENDPOINTS.ORDERS.HISTORY, filters);
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    return await apiClient.get<Order>(API_ENDPOINTS.ORDERS.BY_ID(orderId));
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    return await apiClient.post<Order>(
      API_ENDPOINTS.ORDERS.CANCEL(orderId),
      { reason }
    );
  }

  /**
   * Track order
   */
  async trackOrder(orderId: string): Promise<{
    orderId: string;
    status: OrderStatus;
    tracking: OrderTracking;
    events: TrackingEvent[];
  }> {
    return await apiClient.get<{
      orderId: string;
      status: OrderStatus;
      tracking: OrderTracking;
      events: TrackingEvent[];
    }>(API_ENDPOINTS.ORDERS.TRACK(orderId));
  }

  /**
   * Get order invoice
   */
  async getOrderInvoice(orderId: string): Promise<Blob> {
    return await apiClient.get<Blob>(API_ENDPOINTS.ORDERS.INVOICE(orderId), {
      responseType: 'blob',
    });
  }

  // ==================================
  // ORDER TRACKING
  // ==================================

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string): Promise<OrderTracking> {
    return await apiClient.get<OrderTracking>(API_ENDPOINTS.ORDERS.TRACK(orderId));
  }

  // ==================================
  // ADMIN FUNCTIONS
  // ==================================

  /**
   * Get all orders (Admin only)
   */
  async getAllOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    return await apiClient.getPaginated<Order>(
      API_ENDPOINTS.ADMIN.ORDERS,
      filters
    );
  }

  /**
   * Update order status (Admin only)
   */
  async updateOrderStatus(
    orderId: string,
    statusData: UpdateOrderStatusRequest
  ): Promise<Order> {
    return await apiClient.patch<Order>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
      statusData
    );
  }

  /**
   * Create tracking for order (Admin only)
   */
  async createTracking(trackingData: CreateTrackingRequest): Promise<OrderTracking> {
    return await apiClient.post<OrderTracking>(
      `/orders/${trackingData.orderId}/tracking`,
      trackingData
    );
  }

  /**
   * Add tracking event (Admin only)
   */
  async addTrackingEvent(
    trackingId: string,
    eventData: AddTrackingEventRequest
  ): Promise<TrackingEvent> {
    return await apiClient.post<TrackingEvent>(
      `/tracking/${trackingId}/events`,
      eventData
    );
  }
}

// ==================================
// ORDER HELPER FUNCTIONS
// ==================================

export const orderHelpers = {
  /**
   * Format order number for display
   */
  formatOrderNumber(orderNumber: string): string {
    // Format YC20241225001 to YC-2024-1225-001
    if (orderNumber.length === 11 && orderNumber.startsWith('YC')) {
      return `${orderNumber.slice(0, 2)}-${orderNumber.slice(2, 6)}-${orderNumber.slice(6, 10)}-${orderNumber.slice(10)}`;
    }
    return orderNumber;
  },

  /**
   * Get order status display info
   */
  getOrderStatusInfo(status: OrderStatus): {
    label: string;
    color: string;
    icon: string;
    description: string;
  } {
    const statusMap = {
      PENDING: {
        label: 'En attente',
        color: '#FFA500',
        icon: '⏳',
        description: 'Votre commande est en cours de traitement',
      },
      CONFIRMED: {
        label: 'Confirmée',
        color: '#4CAF50',
        icon: '✅',
        description: 'Votre commande a été confirmée',
      },
      PROCESSING: {
        label: 'En cours',
        color: '#2196F3',
        icon: '⚙️',
        description: 'Votre commande est en cours de préparation',
      },
      SHIPPED: {
        label: 'Expédiée',
        color: '#9C27B0',
        icon: '🚚',
        description: 'Votre commande a été expédiée',
      },
      DELIVERED: {
        label: 'Livrée',
        color: '#4CAF50',
        icon: '📦',
        description: 'Votre commande a été livrée',
      },
      CANCELLED: {
        label: 'Annulée',
        color: '#F44336',
        icon: '❌',
        description: 'Votre commande a été annulée',
      },
      REFUNDED: {
        label: 'Remboursée',
        color: '#607D8B',
        icon: '💰',
        description: 'Votre commande a été remboursée',
      },
    };

    return statusMap[status] || {
      label: status,
      color: '#757575',
      icon: '❓',
      description: 'Statut inconnu',
    };
  },

  /**
   * Calculate order totals
   */
  calculateOrderTotals(order: Order): {
    itemsTotal: number;
    savings: number;
    finalTotal: number;
  } {
    const itemsTotal = order.items.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity),
      0
    );

    const savings = order.discountAmount;
    const finalTotal = order.totalAmount;

    return {
      itemsTotal,
      savings,
      finalTotal,
    };
  },

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    const cancellableStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(order.status);
  },

  /**
   * Check if order can be returned
   */
  canReturnOrder(order: Order): boolean {
    if (order.status !== 'DELIVERED' || !order.deliveredAt) {
      return false;
    }

    // Allow returns within 14 days of delivery
    const deliveredDate = new Date(order.deliveredAt);
    const now = new Date();
    const daysSinceDelivery = (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceDelivery <= 14;
  },

  /**
   * Get estimated delivery date
   */
  getEstimatedDelivery(order: Order): Date | null {
    if (order.status === 'DELIVERED' && order.deliveredAt) {
      return new Date(order.deliveredAt);
    }

    if (order.tracking?.estimatedDelivery) {
      return new Date(order.tracking.estimatedDelivery);
    }

    // Calculate based on order date and product delivery times
    const orderDate = new Date(order.createdAt);
    let maxDeliveryDays = 3; // Default

    // Get maximum delivery time from order items
    order.items.forEach(item => {
      if (item.physicalProduct) {
        maxDeliveryDays = Math.max(
          maxDeliveryDays,
          item.physicalProduct.deliveryTimeDays
        );
      }
    });

    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + maxDeliveryDays);

    return estimatedDate;
  },

  /**
   * Format order item for display
   */
  formatOrderItemForDisplay(item: OrderItem): {
    name: string;
    brand?: string;
    image?: string;
    unitPrice: string;
    totalPrice: string;
    details?: string;
  } {
    const baseInfo = {
      name: item.productName,
      brand: item.productBrand || undefined,
      image: item.productImage || undefined,
      unitPrice: productHelpers.formatPrice(item.unitPrice),
      totalPrice: productHelpers.formatPrice(item.totalPrice),
    };

    if (item.productType === 'GIFT_CARD' && item.giftCardAmount) {
      return {
        ...baseInfo,
        details: `Montant: ${productHelpers.formatPrice(item.giftCardAmount)} × ${item.quantity}`,
      };
    }

    if (item.productType === 'PHYSICAL_PRODUCT') {
      return {
        ...baseInfo,
        details: `Quantité: ${item.quantity}`,
      };
    }

    return baseInfo;
  },

  /**
   * Get order progress percentage
   */
  getOrderProgress(status: OrderStatus): number {
    const progressMap = {
      PENDING: 10,
      CONFIRMED: 25,
      PROCESSING: 50,
      SHIPPED: 75,
      DELIVERED: 100,
      CANCELLED: 0,
      REFUNDED: 0,
    };

    return progressMap[status] || 0;
  },

  /**
   * Get order timeline steps
   */
  getOrderTimeline(order: Order): Array<{
    status: OrderStatus;
    label: string;
    date?: string;
    completed: boolean;
    current: boolean;
  }> {
    const steps: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

    const timeline = steps.map(stepStatus => {
      const statusInfo = orderHelpers.getOrderStatusInfo(stepStatus);
      const stepIndex = steps.indexOf(stepStatus);
      const currentIndex = steps.indexOf(order.status);

      // Get date for this step
      let stepDate: string | undefined;
      switch (stepStatus) {
        case 'PENDING':
          stepDate = order.createdAt;
          break;
        case 'CONFIRMED':
          stepDate = order.confirmedAt || undefined;
          break;
        case 'SHIPPED':
          stepDate = order.shippedAt || undefined;
          break;
        case 'DELIVERED':
          stepDate = order.deliveredAt || undefined;
          break;
      }

      return {
        status: stepStatus,
        label: statusInfo.label,
        date: stepDate,
        completed: stepIndex < currentIndex || order.status === stepStatus,
        current: order.status === stepStatus,
      };
    });

    return timeline;
  },

  /**
   * Group orders by status
   */
  groupOrdersByStatus(orders: Order[]): Record<OrderStatus, Order[]> {
    const grouped = {
      PENDING: [],
      CONFIRMED: [],
      PROCESSING: [],
      SHIPPED: [],
      DELIVERED: [],
      CANCELLED: [],
      REFUNDED: [],
    } as Record<OrderStatus, Order[]>;

    orders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    return grouped;
  },

  /**
   * Get order statistics
   */
  getOrderStatistics(orders: Order[]): {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    statusCounts: Record<OrderStatus, number>;
    mostRecentOrder?: Order;
    largestOrder?: Order;
  } {
    if (orders.length === 0) {
      return {
        totalOrders: 0,
        totalValue: 0,
        averageOrderValue: 0,
        statusCounts: {
          PENDING: 0,
          CONFIRMED: 0,
          PROCESSING: 0,
          SHIPPED: 0,
          DELIVERED: 0,
          CANCELLED: 0,
          REFUNDED: 0,
        },
      };
    }

    const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalValue / orders.length;

    const statusCounts = orders.reduce((counts, order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
      return counts;
    }, {} as Record<OrderStatus, number>);

    // Fill missing statuses
    Object.keys({
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    }).forEach(status => {
      if (!statusCounts[status as OrderStatus]) {
        statusCounts[status as OrderStatus] = 0;
      }
    });

    // Find most recent order
    const mostRecentOrder = orders.reduce((latest, order) =>
      new Date(order.createdAt) > new Date(latest.createdAt) ? order : latest
    );

    // Find largest order
    const largestOrder = orders.reduce((largest, order) =>
      order.totalAmount > largest.totalAmount ? order : largest
    );

    return {
      totalOrders: orders.length,
      totalValue,
      averageOrderValue,
      statusCounts,
      mostRecentOrder,
      largestOrder,
    };
  },

  /**
   * Validate order for processing
   */
  validateOrderForProcessing(order: Order): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if order has items
    if (!order.items || order.items.length === 0) {
      errors.push('La commande ne contient aucun article');
    }

    // Check if shipping address is provided for physical products
    const hasPhysicalProducts = order.items.some(
      item => item.productType === 'PHYSICAL_PRODUCT'
    );

    if (hasPhysicalProducts && !order.shippingAddressId) {
      errors.push('Une adresse de livraison est requise pour les produits physiques');
    }

    // Check payment status
    if (order.paymentStatus !== 'COMPLETED') {
      errors.push('Le paiement n\'a pas été confirmé');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const orderService = new OrderService();
export default orderService;