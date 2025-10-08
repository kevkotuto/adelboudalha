import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, PaymentStatus, OrderFilters } from '@/types';
import { orderService } from '@/services/orderService';

// ==================================
// ORDER STORE INTERFACES
// ==================================

interface OrderState {
  // Data
  orders: Order[];
  currentOrder: Order | null;

  // Pagination
  page: number;
  limit: number;
  totalPages: number;
  totalOrders: number;

  // Filters
  statusFilter: OrderStatus | null;
  paymentStatusFilter: PaymentStatus | null;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isCreating: boolean;
  isCancelling: boolean;

  // Error state
  error: string | null;

  // Last sync time
  lastSync: number | null;
}

interface OrderActions {
  // Fetch orders
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchMoreOrders: () => Promise<void>;

  // Get single order
  fetchOrderById: (orderId: string) => Promise<void>;

  // Create order
  createOrder: (orderData: {
    shippingAddressId?: string;
    billingAddressId?: string;
    paymentMethod: 'WAVE';
    contactPhone: string;
    notes?: string;
    promotionCode?: string;
  }) => Promise<Order>;

  // Cancel order
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;

  // Track order
  trackOrder: (orderId: string) => Promise<any>;

  // Filters
  setStatusFilter: (status: OrderStatus | null) => void;
  setPaymentStatusFilter: (status: PaymentStatus | null) => void;
  clearFilters: () => void;

  // Local state management
  setCurrentOrder: (order: Order | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;

  // Sync status
  needsSync: () => boolean;
}

type OrderStore = OrderState & OrderActions;

// ==================================
// INITIAL STATE
// ==================================

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  page: 1,
  limit: 20,
  totalPages: 1,
  totalOrders: 0,
  statusFilter: null,
  paymentStatusFilter: null,
  isLoading: false,
  isLoadingMore: false,
  isCreating: false,
  isCancelling: false,
  error: null,
  lastSync: null,
};

// ==================================
// ORDER STORE
// ==================================

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==================================
      // FETCH ORDERS
      // ==================================
      fetchOrders: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const { statusFilter, paymentStatusFilter, page, limit } = get();

          // Build query filters, removing undefined values
          const queryFilters: OrderFilters = {
            page,
            limit,
          };

          // Only add filters if they have values
          const status = filters?.status || statusFilter;
          if (status) queryFilters.status = status;

          const paymentStatus = filters?.paymentStatus || paymentStatusFilter;
          if (paymentStatus) queryFilters.paymentStatus = paymentStatus;

          // Add any other filters from the filters parameter
          if (filters) {
            Object.keys(filters).forEach(key => {
              const value = filters[key as keyof OrderFilters];
              if (value !== undefined && value !== null && key !== 'status' && key !== 'paymentStatus') {
                (queryFilters as any)[key] = value;
              }
            });
          }

          console.log('📦 Fetching orders with filters:', queryFilters);

          const response = await orderService.getOrders(queryFilters);

          // Debug: Log the exact response structure
          console.log('✅ Orders fetched - RAW response:', response);
          console.log('✅ Response type:', typeof response);
          console.log('✅ Response keys:', response ? Object.keys(response) : 'null');

          // Support multiple response formats:
          // Format 1 (correct): { items: [...], pagination: {...} }
          // Format 2 (fallback): { data: [...], pagination: {...} }
          const ordersData = response.items || (response as any).data || [];
          const paginationData = response.pagination || {};

          console.log('✅ Orders fetched successfully:', {
            count: ordersData.length,
            total: paginationData.total || 0,
            page: paginationData.page || 1,
            format: response.items ? 'items' : (response as any).data ? 'data' : 'unknown',
          });

          set({
            orders: ordersData,
            totalPages: paginationData.totalPages || 1,
            totalOrders: paginationData.total || 0,
            page: paginationData.page || 1,
            lastSync: Date.now(),
            isLoading: false,
          });
        } catch (error: any) {
          console.error('❌ Failed to fetch orders:', {
            message: error.message,
            code: error.code,
            details: error.response?.data || error,
          });

          // Provide user-friendly error messages
          let errorMessage = 'Échec du chargement des commandes';
          if (error.message?.includes('Invalid UUID')) {
            errorMessage = 'Erreur d\'authentification. Veuillez vous reconnecter.';
          } else if (error.message?.includes('Network')) {
            errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            isLoading: false,
            // DO NOT reset orders array - keep existing data on error
          });
        }
      },

      // ==================================
      // FETCH MORE ORDERS (PAGINATION)
      // ==================================
      fetchMoreOrders: async () => {
        const { page, totalPages, isLoadingMore } = get();

        if (isLoadingMore || page >= totalPages) return;

        set({ isLoadingMore: true, error: null });
        try {
          const nextPage = page + 1;
          const { statusFilter, paymentStatusFilter, limit } = get();

          const queryFilters: OrderFilters = {
            page: nextPage,
            limit,
            status: statusFilter || undefined,
            paymentStatus: paymentStatusFilter || undefined,
          };

          const response = await orderService.getOrders(queryFilters);

          // Support multiple response formats
          const moreOrders = response.items || (response as any).data || [];

          set((state) => ({
            orders: [...state.orders, ...moreOrders],
            page: nextPage,
            isLoadingMore: false,
          }));
        } catch (error: any) {
          console.error('Failed to fetch more orders:', error);
          set({
            error: error.message || 'Échec du chargement',
            isLoadingMore: false,
          });
        }
      },

      // ==================================
      // FETCH ORDER BY ID
      // ==================================
      fetchOrderById: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const order = await orderService.getOrderById(orderId);

          set({
            currentOrder: order,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Failed to fetch order:', error);
          set({
            error: error.message || 'Échec du chargement de la commande',
            isLoading: false,
          });
          throw error;
        }
      },

      // ==================================
      // CREATE ORDER
      // ==================================
      createOrder: async (orderData) => {
        set({ isCreating: true, error: null });
        try {
          const newOrder = await orderService.createOrder(orderData);

          // Add to beginning of orders list
          set((state) => ({
            orders: [newOrder, ...state.orders],
            currentOrder: newOrder,
            isCreating: false,
          }));

          return newOrder;
        } catch (error: any) {
          console.error('Failed to create order:', error);
          set({
            error: error.message || 'Échec de la création de la commande',
            isCreating: false,
          });
          throw error;
        }
      },

      // ==================================
      // CANCEL ORDER
      // ==================================
      cancelOrder: async (orderId, reason) => {
        set({ isCancelling: true, error: null });
        try {
          const cancelledOrder = await orderService.cancelOrder(orderId, reason);

          // Update order in list
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? cancelledOrder : order
            ),
            currentOrder:
              state.currentOrder?.id === orderId ? cancelledOrder : state.currentOrder,
            isCancelling: false,
          }));
        } catch (error: any) {
          console.error('Failed to cancel order:', error);
          set({
            error: error.message || 'Échec de l\'annulation',
            isCancelling: false,
          });
          throw error;
        }
      },

      // ==================================
      // TRACK ORDER
      // ==================================
      trackOrder: async (orderId) => {
        try {
          const trackingInfo = await orderService.trackOrder(orderId);
          return trackingInfo;
        } catch (error: any) {
          console.error('Failed to track order:', error);
          set({ error: error.message || 'Échec du suivi de la commande' });
          throw error;
        }
      },

      // ==================================
      // FILTERS
      // ==================================
      setStatusFilter: (status) => {
        set({ statusFilter: status, page: 1 });
        get().fetchOrders();
      },

      setPaymentStatusFilter: (status) => {
        set({ paymentStatusFilter: status, page: 1 });
        get().fetchOrders();
      },

      clearFilters: () => {
        set({ statusFilter: null, paymentStatusFilter: null, page: 1 });
        get().fetchOrders();
      },

      // ==================================
      // LOCAL STATE MANAGEMENT
      // ==================================
      setCurrentOrder: (order) => set({ currentOrder: order }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),

      // ==================================
      // SYNC STATUS
      // ==================================
      needsSync: () => {
        const { lastSync } = get();
        if (!lastSync) return true;

        const FIVE_MINUTES = 5 * 60 * 1000;
        return Date.now() - lastSync > FIVE_MINUTES;
      },
    }),
    {
      name: 'yu-card-orders',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
        currentOrder: state.currentOrder,
        lastSync: state.lastSync,
      }),
    }
  )
);

// ==================================
// SELECTORS
// ==================================

export const useOrders = () => useOrderStore((state) => state.orders);
export const useCurrentOrder = () => useOrderStore((state) => state.currentOrder);
export const useOrdersLoading = () => useOrderStore((state) => state.isLoading);
export const useOrderError = () => useOrderStore((state) => state.error);

// Order statistics selector - Using useMemo to prevent infinite loop
export const useOrderStats = () => {
  const orders = useOrderStore((state) => state.orders);

  return React.useMemo(() => {
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED').length;
    const processingOrders = orders.filter((o) => o.status === 'PROCESSING').length;
    const shippedOrders = orders.filter((o) => o.status === 'SHIPPED').length;
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;

    const totalSpent = orders
      .filter((o) => o.paymentStatus === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent,
    };
  }, [orders]);
};

export default useOrderStore;
