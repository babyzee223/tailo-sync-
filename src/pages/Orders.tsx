import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Clock, Loader, CheckCircle, Search, Plus, Archive } from 'lucide-react';
import NewOrderModal from '../components/NewOrderModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import type { Order, AlterationStatus } from '../types';
import OrderStatusSelect from '../components/OrderStatusSelect';
import { getStoredOrders, storeOrder } from '../services/orders';
import { supabase } from '../lib/supabaseClient';

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AlterationStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        throw new Error('User not found. Please log in again.');
      }

      const storedOrders = await getStoredOrders(user.id);
      setOrders(Array.isArray(storedOrders) ? storedOrders : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOrderCreated = async (newOrder: Order) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      await storeOrder(newOrder, user.id);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      setIsNewOrderModalOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create order');
    }
  };

  const handleOrderUpdate = async (updatedOrder: Order) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      await storeOrder(updatedOrder, user.id);
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order)
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update order');
    }
  };

  const handleArchiveOrder = async (order: Order) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const confirmed = window.confirm('Are you sure you want to archive this order? It will be hidden from the main view.');
      if (!confirmed) return;

      const updatedOrder = {
        ...order,
        status: 'archived' as AlterationStatus,
        timeline: [
          ...order.timeline,
          {
            id: Date.now().toString(),
            type: 'status_change',
            timestamp: new Date().toISOString(),
            description: 'Order archived'
          }
        ]
      };

      await storeOrder(updatedOrder, user.id);
      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to archive order');
    }
  };

  const filterOrders = (orders: Order[]) => {
    if (!Array.isArray(orders)) return [];
    
    return orders
      .filter(order => {
        // Filter archived orders
        if (order.status === 'archived' && !showArchived) return false;
        
        const matchesSearch = 
          order.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.garments.some(g => g.garmentInfo.type.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredOrders = filterOrders(orders);
  const archivedCount = orders.filter(order => order.status === 'archived').length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <select
              className="border rounded-lg px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AlterationStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              {showArchived && <option value="archived">Archived</option>}
            </select>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Archive className="w-5 h-5 mr-2" />
              {showArchived ? 'Hide Archived' : `Show Archived (${archivedCount})`}
            </button>
            <button 
              onClick={() => setIsNewOrderModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Order
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className={`bg-white rounded-lg shadow-sm p-6 ${
              order.status === 'archived' ? 'opacity-75' : ''
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{order.clientInfo.name}</h3>
                  <p className="text-sm text-gray-500">{order.clientInfo.phone}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <OrderStatusSelect
                    order={order}
                    onStatusChange={(newStatus) => handleOrderUpdate({ ...order, status: newStatus })}
                  />
                  <span className={`text-sm font-medium ${
                    new Date(order.dueDate) < new Date() ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getDaysUntilDue(order.dueDate)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Garments</h4>
                  <ul className="mt-1 space-y-1">
                    {order.garments.map((garment, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {garment.garmentInfo.quantity}x {garment.garmentInfo.type}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Payment</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Total: ${order.paymentInfo.totalAmount}
                    <br />
                    Balance: ${order.paymentInfo.totalAmount - order.paymentInfo.depositAmount}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="mt-1 text-sm text-gray-600">{order.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-end space-x-4">
                {order.status !== 'archived' && (
                  <button 
                    onClick={() => handleArchiveOrder(order)}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    Archive
                  </button>
                )}
                <button 
                  onClick={() => handleViewDetails(order)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>

        <NewOrderModal 
          isOpen={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          onOrderCreated={handleOrderCreated}
        />

        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            isOpen={true}
            onClose={() => setSelectedOrder(null)}
            onOrderUpdate={handleOrderUpdate}
            onOrderDelete={handleArchiveOrder}
          />
        )}
      </div>
    </Layout>
  );
}

export default Orders;