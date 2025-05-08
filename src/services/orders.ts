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

// Remove the local declaration of AlterationStatus to avoid conflict

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

export const getStoredOrders = async (userId: string): Promise<Order[]> => {
  try {
    return await withRetry(async () => {
      // Split the query into smaller chunks to avoid timeout
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, phone, email, carrier')
        .eq('user_id', userId);

      if (clientsError) throw clientsError;

      const clientMap = new Map(clients.map(c => [c.id, c]));

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      console.log('Fetched orders:', orders);

      return orders.map(order => ({
        id: order.id,
        clientInfo: {
          name: clientMap.get(order.client_id)?.name || '',
          phone: clientMap.get(order.client_id)?.phone || '',
          email: clientMap.get(order.client_id)?.email || '',
          carrier: clientMap.get(order.client_id)?.carrier || 'other'
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
    });
  } catch (error) {
    console.error('Failed to get orders:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const calculateTotalRevenue = async (userId: string): Promise<number> => {
  try {
    return await withRetry(async () => {
      const orders = await getStoredOrders(userId);
      if (!Array.isArray(orders) || orders.length === 0) {
        return 0;
      }
      
      return orders.reduce((total, order) => total + order.paymentInfo.totalAmount, 0);
    });
  } catch (error) {
    console.error('Failed to calculate total revenue:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getMonthlyRevenue = async (userId: string) => {
  try {
    return await withRetry(async () => {
      const orders = await getStoredOrders(userId);
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
        const orderDate = new Date(order.createdAt || 0);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const key = `${year}-${month}`;

        if (year === currentYear) {
          revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + order.paymentInfo.totalAmount);
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