import { supabase, handleSupabaseError, withRetry } from '../lib/supabaseClient';
import type { AlterationStatus } from '../types';

// Add the definition and export of ClientInfo if missing
export interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  carrier: string;
}

// Define and export the Order type
export interface Order {
  id: string;
  clientInfo: ClientInfo;
  garments: string[];
  paymentInfo: {
    totalAmount: number;
    paymentMethod: string;
  };
  description?: string;
  status: AlterationStatus;
  dueDate: string;
  eventInfo?: string;
  timeline?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Pagination interface
export interface PaginatedOrders {
  orders: Order[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

// Generate a unique order number
export const generateOrderNumber = async (): Promise<string> => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

// Store client info and return the client ID
const storeClientInfo = async (clientInfo: ClientInfo, userId: string): Promise<string> => {
  try {
    return await withRetry(async () => {
      // Check for existing client
      const { data: existingClients, error: searchError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', clientInfo.email)
        .eq('user_id', userId)
        .maybeSingle();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      if (existingClients?.id) {
        // Update existing client
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            name: clientInfo.name,
            phone: clientInfo.phone,
            carrier: clientInfo.carrier,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingClients.id)
          .eq('user_id', userId);

        if (updateError) throw updateError;
        return existingClients.id;
      }

      // Insert new client
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          name: clientInfo.name,
          phone: clientInfo.phone,
          email: clientInfo.email,
          carrier: clientInfo.carrier,
          user_id: userId
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      return newClient.id;
    });
  } catch (error) {
    console.error('Failed to store client info:', error);
    throw error;
  }
};

export const storeOrder = async (order: Order, userId: string): Promise<void> => {
  try {
    await withRetry(async () => {
      // First store/update client info
      const clientId = await storeClientInfo(order.clientInfo, userId);

      // Format the order data
      const orderData = {
        id: order.id,
        client_id: clientId,
        user_id: userId,
        garments: order.garments,
        payment_info: order.paymentInfo,
        description: order.description,
        status: order.status,
        due_date: order.dueDate,
        event_info: order.eventInfo,
        timeline: order.timeline,
        updated_at: new Date().toISOString()
      };

      // Use upsert with onConflict strategy
      const { error } = await supabase
        .from('orders')
        .upsert(orderData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) throw error;
    });
  } catch (error) {
    console.error('Failed to store order:', error);
    throw new Error(handleSupabaseError(error));
  }
};

// Get paginated orders with improved performance
export const getStoredOrders = async (
  userId: string, 
  page: number = 1, 
  pageSize: number = 20,
  statusFilter?: AlterationStatus
): Promise<PaginatedOrders> => {
  try {
    return await withRetry(async () => {
      const offset = (page - 1) * pageSize;
      
      // Build query with optional status filter
      let query = supabase
        .from('orders')
       .select('*', { count: 'exact' })

      // Add status filter if provided
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      // Add pagination and ordering
     const start = performance.now(); // ⏱️ Start the timer

const { data: orders, error: ordersError, count } = await query
  .order('created_at', { ascending: false })
  .range(offset, offset + pageSize - 1);

const duration = performance.now() - start; // ⏱️ Calculate how long it took
console.log(`📦 Supabase query took ${duration.toFixed(2)}ms`);


      if (ordersError) throw ordersError;

      const totalCount = count || 0;
      const hasMore = totalCount > offset + pageSize;

      const formattedOrders = orders.map(order => ({
        id: order.id,
        clientInfo: {
          name: order.client?.name || '',
          phone: order.client?.phone || '',
          email: order.client?.email || '',
          carrier: order.client?.carrier || 'other'
        },
        garments: order.garments,
        paymentInfo: order.payment_info,
        description: order.description || '',
        status: order.status as AlterationStatus,
        dueDate: order.due_date,
        eventInfo: order.event_info,
        timeline: order.timeline,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }));

      return {
        orders: formattedOrders,
        totalCount,
        hasMore,
        nextPage: hasMore ? page + 1 : undefined
      };
    });
  } catch (error) {
    console.error('Failed to get orders:', error);
    throw new Error(handleSupabaseError(error));
  }
};

// Legacy function for backward compatibility - loads first page only
export const getAllStoredOrders = async (userId: string): Promise<Order[]> => {
  const result = await getStoredOrders(userId, 1, 50); // Load first 50 orders
  return result.orders;
};

export const calculateTotalRevenue = async (userId: string): Promise<number> => {
  try {
    return await withRetry(async () => {
      // Use aggregation for better performance
      const { data, error } = await supabase
        .from('orders')
        .select('payment_info')
        .eq('user_id', userId);

      if (error) throw error;

      if (!Array.isArray(data) || data.length === 0) {
        return 0;
      }
      
      return data.reduce((total, order) => {
        const paymentInfo = order.payment_info;
        return total + (paymentInfo?.totalAmount || 0);
      }, 0);
    });
  } catch (error) {
    console.error('Failed to calculate total revenue:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getMonthlyRevenue = async (userId: string) => {
  try {
    return await withRetry(async () => {
      // Get orders for revenue calculation
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, payment_info')
        .eq('user_id', userId);

      if (error) throw error;

      if (!Array.isArray(orders) || orders.length === 0) {
        return [];
      }

      // Group orders by year and month
      const revenueByMonth = new Map();
      const orderCountByMonth = new Map();

      // Initialize with zero values for current year
      const currentYear = new Date().getFullYear();
      for (let month = 1; month <= 12; month++) {
        const key = `${currentYear}-${month}`;
        revenueByMonth.set(key, 0);
        orderCountByMonth.set(key, 0);
      }

      // Calculate revenue and order count by month
      orders.forEach(order => {
        const orderDate = new Date(order.created_at || 0);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const key = `${year}-${month}`;

        if (year === currentYear) {
          const amount = order.payment_info?.totalAmount || 0;
          revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + amount);
          orderCountByMonth.set(key, (orderCountByMonth.get(key) || 0) + 1);
        }
      });

      // Format data for the revenue page
      return Array.from(revenueByMonth.entries()).map(([key, revenue]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          id: key,
          year,
          month,
          revenue,
          order_count: orderCountByMonth.get(key) || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
    });
  } catch (error) {
    console.error('Failed to get monthly revenue:', error);
    throw new Error(handleSupabaseError(error));
  }
};