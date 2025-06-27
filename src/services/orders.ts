export const getStoredOrders = async (userId: string): Promise<Order[]> => {
  try {
    return await withRetry(async () => {
      // Fetch 20 most recent orders for the user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          due_date,
          event_info,
          timeline,
          garments,
          payment_info,
          client:clients (
            name,
            phone,
            email,
            carrier
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(0, 19); // Load only first 20 orders

      if (ordersError) throw ordersError;

      return orders.map(order => ({
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
    });
  } catch (error) {
    console.error('Failed to get orders:', error);
    throw new Error(handleSupabaseError(error));
  }
};
