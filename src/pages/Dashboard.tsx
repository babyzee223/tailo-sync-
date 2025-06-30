import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import NewOrderModal from '../components/NewOrderModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import CalendarView from '../components/CalendarView';
import { Plus, Search, Clock, Loader, CheckCircle, ArrowRight, AlertCircle, FileText, User, Phone, Maximize2, Minimize2, X } from 'lucide-react';
import type { Order, AlterationStatus } from '../types';
import OrderStatusSelect from '../components/OrderStatusSelect';
import { supabase } from '../lib/supabaseClient';
import { getAllStoredOrders, storeOrder, calculateTotalRevenue } from '../services/orders';

function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AlterationStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const loadOrders = async () => {
    try {
      setIsLoading(true);

      // Get the currently logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        throw new Error('User not found. Please log in again.');
      }

      // Get stored orders (limited to recent orders for dashboard)
      const storedOrders = await getAllStoredOrders(user.id);
      setOrders(storedOrders || []);
      
      // Calculate total revenue
      const total = await calculateTotalRevenue(user.id);
      setTotalRevenue(total);
      
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders. Please try again.';
      setError(message);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      await storeOrder(newOrder, user.id);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      setIsNewOrderModalOpen(false);
      navigate(`/orders/${newOrder.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      setError(message);
    }
  };

  const handleOrderUpdate = async (updatedOrder: Order) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      await storeOrder(updatedOrder, user.id);
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update order';
      setError(message);
    }
  };

  const handleArchiveOrder = async (order: Order) => {
    try {
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
      const message = error instanceof Error ? error.message : 'Failed to archive order';
      setError(message);
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Pending Orders', value: filterOrders(orders.filter(o => o.status === 'pending')).length },
            { label: 'In Progress', value: filterOrders(orders.filter(o => o.status === 'in-progress')).length },
            { label: 'Completed Today', value: filterOrders(orders.filter(o => o.status === 'completed')).length },
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` }
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <CalendarView 
              orders={orders} 
              onOrderUpdate={handleOrderUpdate}
            />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link 
                to="/orders" 
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium transition-colors"
              >
                View All Orders
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <h2 className="font-medium">Pending</h2>
                <span className="bg-gray-100 px-2 py-0.5 rounded-full text-sm">
                  {filterOrders(orders.filter(o => o.status === 'pending')).length}
                </span>
              </div>
              <div className="space-y-3">
                {filterOrders(orders.filter(o => o.status === 'pending')).slice(0, 3).map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{order.clientInfo.name}</h3>
                        <p className="text-sm text-gray-500">{order.garments[0].garmentInfo.type}</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        new Date(order.dueDate) < new Date() ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {getDaysUntilDue(order.dueDate)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Items: {order.garments.reduce((acc, g) => acc + g.garmentInfo.quantity, 0)}</p>
                      <p className="mt-1">
                        Balance: ${(order.paymentInfo.totalAmount - order.paymentInfo.depositAmount).toFixed(2)}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader className="w-5 h-5" />
                <h2 className="font-medium">In Progress</h2>
                <span className="bg-blue-50 px-2 py-0.5 rounded-full text-sm">
                  {filterOrders(orders.filter(o => o.status === 'in-progress')).length}
                </span>
              </div>
              <div className="space-y-3">
                {filterOrders(orders.filter(o => o.status === 'in-progress')).slice(0, 3).map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{order.clientInfo.name}</h3>
                        <p className="text-sm text-gray-500">{order.garments[0].garmentInfo.type}</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        new Date(order.dueDate) < new Date() ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {getDaysUntilDue(order.dueDate)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Items: {order.garments.reduce((acc, g) => acc + g.garmentInfo.quantity, 0)}</p>
                      <p className="mt-1">
                        Balance: ${(order.paymentInfo.totalAmount - order.paymentInfo.depositAmount).toFixed(2)}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <h2 className="font-medium">Completed</h2>
                <span className="bg-green-50 px-2 py-0.5 rounded-full text-sm">
                  {filterOrders(orders.filter(o => o.status === 'completed')).length}
                </span>
              </div>
              <div className="space-y-3">
                {filterOrders(orders.filter(o => o.status === 'completed')).slice(0, 3).map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{order.clientInfo.name}</h3>
                        <p className="text-sm text-gray-500">{order.garments[0].garmentInfo.type}</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        new Date(order.dueDate) < new Date() ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {getDaysUntilDue(order.dueDate)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Items: {order.garments.reduce((acc, g) => acc + g.garmentInfo.quantity, 0)}</p>
                      <p className="mt-1">
                        Balance: ${(order.paymentInfo.totalAmount - order.paymentInfo.depositAmount).toFixed(2)}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

export default Dashboard;