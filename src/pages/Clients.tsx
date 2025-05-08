import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Search, Users, Calendar, DollarSign, ArrowUpRight, Phone, Mail, Clock, Loader, AlertCircle } from 'lucide-react';
import type { Order } from '../types';
import { getStoredOrders } from '../services/orders';

type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  upcomingAppointments: number;
  orders: Order[];
};

function Clients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const storedOrders = await getStoredOrders();
        setOrders(Array.isArray(storedOrders) ? storedOrders : []);
        setError(null);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const clients = useMemo(() => {
    const clientMap = new Map<string, Client>();

    orders.forEach(order => {
      const { clientInfo } = order;
      const clientId = `${clientInfo.name}-${clientInfo.phone}`.toLowerCase().replace(/\s+/g, '-');

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: clientId,
          name: clientInfo.name,
          phone: clientInfo.phone,
          email: clientInfo.email,
          totalOrders: 0,
          totalSpent: 0,
          lastVisit: '',
          upcomingAppointments: 0,
          orders: []
        });
      }

      const client = clientMap.get(clientId)!;
      client.totalOrders++;
      client.totalSpent += order.paymentInfo.totalAmount;
      client.orders.push(order);

      // Update last visit
      const orderDate = new Date(order.createdAt);
      if (!client.lastVisit || orderDate > new Date(client.lastVisit)) {
        client.lastVisit = order.createdAt;
      }

      // Count upcoming appointments (fittings and pickups)
      const now = new Date();
      const hasUpcomingPickup = new Date(order.dueDate) > now;
      const hasUpcomingFittings = order.garments.some(garment => 
        garment.garmentInfo.bridalInfo?.fittingSessions.some(session => 
          !session.completed && new Date(session.date) > now
        )
      );

      if (hasUpcomingPickup || hasUpcomingFittings) {
        client.upcomingAppointments++;
      }
    });

    return Array.from(clientMap.values());
  }, [orders]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  }, [clients, searchQuery]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading clients...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Client List */}
          <div className="col-span-1 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Client List</h2>
            </div>
            <div className="space-y-2">
              {filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedClient?.id === client.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.phone}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {client.totalOrders} orders
                    </span>
                  </div>
                </button>
              ))}

              {filteredClients.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No clients found</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="col-span-2">
            {selectedClient ? (
              <div className="space-y-6">
                {/* Client Overview */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedClient.phone}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {selectedClient.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last Visit</p>
                      <p className="text-lg font-medium text-gray-900">
                        {formatDate(selectedClient.lastVisit)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500">Total Orders</p>
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {selectedClient.totalOrders}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500">Total Spent</p>
                        <DollarSign className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {formatCurrency(selectedClient.totalSpent)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500">Upcoming</p>
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {selectedClient.upcomingAppointments}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visit History */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Visit History</h3>
                  <div className="space-y-4">
                    {selectedClient.orders.map(order => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-900">
                                {order.garments.map(g => g.garmentInfo.type).join(', ')}
                              </h4>
                              <Link
                                to={`/orders?id=${order.id}`}
                                className="ml-2 text-blue-600 hover:text-blue-700"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </Link>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(order.paymentInfo.totalAmount)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {order.status}
                            </p>
                          </div>
                        </div>
                        {order.garments.some(g => g.garmentInfo.bridalInfo) && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">
                              Fitting Sessions
                            </h5>
                            <div className="space-y-2">
                              {order.garments.map(garment => 
                                garment.garmentInfo.bridalInfo?.fittingSessions.map(session => (
                                  <div
                                    key={session.id}
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <span className="text-gray-600">
                                      {session.type} Fitting
                                    </span>
                                    <div className="flex items-center">
                                      <span className="text-gray-500 mr-2">
                                        {formatDate(session.date)}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        session.completed
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {session.completed ? 'Completed' : 'Scheduled'}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Client
                </h3>
                <p className="text-gray-500">
                  Choose a client from the list to view their details and history
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Clients;