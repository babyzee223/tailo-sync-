import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Filter, Search, Tag } from 'lucide-react';
import type { Order } from '../types';
import { getStoredOrders, storeOrder } from '../services/orders';
import { Link } from 'react-router-dom';
import TaskCompletionButton from '../components/TaskCompletionButton';

function Tasks() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const storedOrders = await getStoredOrders();
      setOrders(storedOrders.filter(order => order.status !== 'archived'));
      setError(null);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle order completion
  const handleOrderComplete = (updatedOrder: Order) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  // Get the start and end dates for the current week view
  const getWeekDates = (weekOffset: number) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the date of the previous Monday (or today if it's Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate the date of the coming Sunday (or today if it's Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
  };

  // Get orders due today
  const getOrdersDueToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return orders
      .filter(order => {
        const dueDate = new Date(order.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const matchesSearch = 
          order.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.garments.some(g => 
            g.garmentInfo.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.garmentInfo.alterationsDescription || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        const matchesPriority = priorityFilter === 'all' || getPriority(order) === priorityFilter;
        const matchesStatus = showCompleted ? true : order.status !== 'completed';
        const isDueToday = dueDate.getTime() === today.getTime();
        
        return isDueToday && matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => getPriorityValue(getPriority(a)) - getPriorityValue(getPriority(b)));
  };

  // Get orders due tomorrow
  const getOrdersDueTomorrow = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return orders
      .filter(order => {
        const dueDate = new Date(order.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const matchesSearch = 
          order.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.garments.some(g => 
            g.garmentInfo.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.garmentInfo.alterationsDescription || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        const matchesPriority = priorityFilter === 'all' || getPriority(order) === priorityFilter;
        const matchesStatus = showCompleted ? true : order.status !== 'completed';
        const isDueTomorrow = dueDate.getTime() === tomorrow.getTime();
        
        return isDueTomorrow && matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => getPriorityValue(getPriority(a)) - getPriorityValue(getPriority(b)));
  };

  // Get orders due this week (excluding today and tomorrow)
  const getOrdersDueThisWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { startOfWeek, endOfWeek } = getWeekDates(0);
    
    return orders
      .filter(order => {
        const dueDate = new Date(order.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const matchesSearch = 
          order.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.garments.some(g => 
            g.garmentInfo.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.garmentInfo.alterationsDescription || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        const matchesPriority = priorityFilter === 'all' || getPriority(order) === priorityFilter;
        const matchesStatus = showCompleted ? true : order.status !== 'completed';
        
        // Due this week but not today or tomorrow
        const isDueThisWeek = dueDate >= startOfWeek && 
                             dueDate <= endOfWeek && 
                             dueDate.getTime() !== today.getTime() &&
                             dueDate.getTime() !== tomorrow.getTime();
        
        return isDueThisWeek && matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  // Get orders due in future weeks
  const getOrdersDueFuture = () => {
    const { endOfWeek } = getWeekDates(0);
    
    return orders
      .filter(order => {
        const dueDate = new Date(order.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const matchesSearch = 
          order.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.garments.some(g => 
            g.garmentInfo.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.garmentInfo.alterationsDescription || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        const matchesPriority = priorityFilter === 'all' || getPriority(order) === priorityFilter;
        const matchesStatus = showCompleted ? true : order.status !== 'completed';
        
        // Due after this week
        const isDueFuture = dueDate > endOfWeek;
        
        return isDueFuture && matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  // Get orders that are overdue
  const getOverdueOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders
      .filter(order => {
        const dueDate = new Date(order.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const matchesSearch = 
          order.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.garments.some(g => 
            g.garmentInfo.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.garmentInfo.alterationsDescription || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        const matchesPriority = priorityFilter === 'all' || getPriority(order) === priorityFilter;
        const matchesStatus = showCompleted ? true : order.status !== 'completed';
        
        return dueDate < today && matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  // Calculate priority based on due date and complexity
  const getPriority = (order: Order): 'high' | 'medium' | 'low' => {
    const dueDate = new Date(order.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    // Check if it's a wedding dress or complex alteration
    const isComplex = order.garments.some(g => 
      g.garmentInfo.type === 'Wedding Dress' || 
      g.garmentInfo.bridalInfo || 
      g.garmentInfo.designInfo
    );
    
    if (daysUntilDue <= 2 || dueDate < today) {
      return 'high';
    } else if (daysUntilDue <= 7 || isComplex) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  // Helper function to convert priority to numeric value for sorting
  const getPriorityValue = (priority: 'high' | 'medium' | 'low'): number => {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: return 3;
    }
  };

  // Format date range for display
  const formatWeekRange = () => {
    const { startOfWeek, endOfWeek } = getWeekDates(currentWeekOffset);
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    return `${startOfWeek.toLocaleDateString('en-US', formatOptions)} - ${endOfWeek.toLocaleDateString('en-US', formatOptions)}`;
  };

  // Get priority badge color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  // Get days until due
  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>;
      case 'in-progress':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">In Progress</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>;
      default:
        return null;
    }
  };

  const overdueOrders = getOverdueOrders();
  const ordersDueToday = getOrdersDueToday();
  const ordersDueTomorrow = getOrdersDueTomorrow();
  const ordersDueThisWeek = getOrdersDueThisWeek();
  const ordersDueFuture = getOrdersDueFuture();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <select
              className="border rounded-lg px-4 py-2"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Completed</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Overdue Tasks */}
        {overdueOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-600">Overdue Tasks</h2>
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {overdueOrders.length}
              </span>
            </div>

            <div className="space-y-4">
              {overdueOrders.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500 ${
                    order.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{order.clientInfo.name}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500">{order.clientInfo.phone}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(getPriority(order))}`}>
                        {getPriority(order).toUpperCase()} PRIORITY
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        {getDaysUntilDue(order.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {order.garments.map((garment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{garment.garmentInfo.type}</h4>
                          {garment.garmentInfo.brand && (
                            <span className="text-sm text-gray-500">{garment.garmentInfo.brand}</span>
                          )}
                        </div>
                        {garment.garmentInfo.alterationsDescription && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-gray-700">Alterations:</h5>
                            <p className="text-sm text-gray-600 mt-1">{garment.garmentInfo.alterationsDescription}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <Link 
                      to={`/orders?id=${order.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      View Order Details
                    </Link>
                    
                    {order.status !== 'completed' && (
                      <TaskCompletionButton 
                        order={order} 
                        onComplete={handleOrderComplete} 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due Today Tasks */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-blue-600">Due Today</h2>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {ordersDueToday.length}
            </span>
          </div>

          {ordersDueToday.length > 0 ? (
            <div className="space-y-4">
              {ordersDueToday.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500 ${
                    order.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{order.clientInfo.name}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500">{order.clientInfo.phone}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(getPriority(order))}`}>
                        {getPriority(order).toUpperCase()} PRIORITY
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        Due today
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {order.garments.map((garment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{garment.garmentInfo.type}</h4>
                          {garment.garmentInfo.brand && (
                            <span className="text-sm text-gray-500">{garment.garmentInfo.brand}</span>
                          )}
                        </div>
                        {garment.garmentInfo.alterationsDescription && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-gray-700">Alterations:</h5>
                            <p className="text-sm text-gray-600 mt-1">{garment.garmentInfo.alterationsDescription}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <Link 
                      to={`/orders?id=${order.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      View Order Details
                    </Link>
                    
                    {order.status !== 'completed' && (
                      <TaskCompletionButton 
                        order={order} 
                        onComplete={handleOrderComplete} 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks due today</p>
            </div>
          )}
        </div>

        {/* Due Tomorrow Tasks */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-purple-600">Due Tomorrow</h2>
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {ordersDueTomorrow.length}
            </span>
          </div>

          {ordersDueTomorrow.length > 0 ? (
            <div className="space-y-4">
              {ordersDueTomorrow.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500 ${
                    order.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{order.clientInfo.name}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500">{order.clientInfo.phone}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(getPriority(order))}`}>
                        {getPriority(order).toUpperCase()} PRIORITY
                      </span>
                      <span className="text-sm font-medium text-purple-600">
                        Due tomorrow
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {order.garments.map((garment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{garment.garmentInfo.type}</h4>
                          {garment.garmentInfo.brand && (
                            <span className="text-sm text-gray-500">{garment.garmentInfo.brand}</span>
                          )}
                        </div>
                        {garment.garmentInfo.alterationsDescription && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-gray-700">Alterations:</h5>
                            <p className="text-sm text-gray-600 mt-1">{garment.garmentInfo.alterationsDescription}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <Link 
                      to={`/orders?id=${order.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      View Order Details
                    </Link>
                    
                    {order.status !== 'completed' && (
                      <TaskCompletionButton 
                        order={order} 
                        onComplete={handleOrderComplete} 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks due tomorrow</p>
            </div>
          )}
        </div>

        {/* Due This Week Tasks */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-green-600">Due This Week</h2>
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {ordersDueThisWeek.length}
            </span>
          </div>

          {ordersDueThisWeek.length > 0 ? (
            <div className="space-y-4">
              {ordersDueThisWeek.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-lg shadow-sm p-6 ${
                    order.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{order.clientInfo.name}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500">{order.clientInfo.phone}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(getPriority(order))}`}>
                        {getPriority(order).toUpperCase()} PRIORITY
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {getDaysUntilDue(order.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {order.garments.map((garment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{garment.garmentInfo.type}</h4>
                          {garment.garmentInfo.brand && (
                            <span className="text-sm text-gray-500">{garment.garmentInfo.brand}</span>
                          )}
                        </div>
                        {garment.garmentInfo.alterationsDescription && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-gray-700">Alterations:</h5>
                            <p className="text-sm text-gray-600 mt-1">{garment.garmentInfo.alterationsDescription}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <Link 
                      to={`/orders?id=${order.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      View Order Details
                    </Link>
                    
                    {order.status !== 'completed' && (
                      <TaskCompletionButton 
                        order={order} 
                        onComplete={handleOrderComplete} 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks due this week</p>
            </div>
          )}
        </div>

        {/* Future Tasks */}
        {ordersDueFuture.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-600">Future Tasks</h2>
              <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {ordersDueFuture.length}
              </span>
            </div>

            <div className="space-y-4">
              {ordersDueFuture.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-lg shadow-sm p-6 ${
                    order.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{order.clientInfo.name}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500">{order.clientInfo.phone}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(getPriority(order))}`}>
                        {getPriority(order).toUpperCase()} PRIORITY
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {getDaysUntilDue(order.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {order.garments.map((garment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{garment.garmentInfo.type}</h4>
                          {garment.garmentInfo.brand && (
                            <span className="text-sm text-gray-500">{garment.garmentInfo.brand}</span>
                          )}
                        </div>
                        {garment.garmentInfo.alterationsDescription && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-gray-700">Alterations:</h5>
                            <p className="text-sm text-gray-600 mt-1">{garment.garmentInfo.alterationsDescription}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <Link 
                      to={`/orders?id=${order.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      View Order Details
                    </Link>
                    
                    {order.status !== 'completed' && (
                      <TaskCompletionButton 
                        order={order} 
                        onComplete={handleOrderComplete} 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-red-800">High Priority</h3>
                <Tag className="w-5 h-5 text-red-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-red-900">
                {orders.filter(order => getPriority(order) === 'high' && (showCompleted || order.status !== 'completed')).length}
              </p>
              <p className="text-sm text-red-700 mt-1">
                {overdueOrders.length} overdue
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-yellow-800">Medium Priority</h3>
                <Tag className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-yellow-900">
                {orders.filter(order => getPriority(order) === 'medium' && (showCompleted || order.status !== 'completed')).length}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Due within 7 days
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-green-800">Low Priority</h3>
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-green-900">
                {orders.filter(order => getPriority(order) === 'low' && (showCompleted || order.status !== 'completed')).length}
              </p>
              <p className="text-sm text-green-700 mt-1">
                Due after 7 days
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-blue-800">Completed</h3>
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-blue-900">
                {orders.filter(order => order.status === 'completed').length}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Total completed tasks
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Tasks;