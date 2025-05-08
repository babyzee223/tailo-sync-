import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { DollarSign, Calendar, TrendingUp, BarChart2, ArrowUp, ArrowDown, Loader, AlertCircle, PieChart, LineChart } from 'lucide-react';
import { getMonthlyRevenue, calculateTotalRevenue } from '../services/orders';
import { supabase } from '../lib/supabaseClient';

function Revenue() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        throw new Error('User not found. Please log in again.');
      }

      const [data, total] = await Promise.all([
        getMonthlyRevenue(user.id),
        calculateTotalRevenue(user.id)
      ]);

      setMonthlyData(data || []);
      setTotalRevenue(total);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load revenue data');
      setMonthlyData([]);
      setTotalRevenue(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get unique years from data
  const years = useMemo(() => {
    const uniqueYears = [...new Set(monthlyData.map(d => d.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [monthlyData]);
  
  // Filter data for selected year
  const yearData = useMemo(() => {
    return monthlyData
      .filter(d => d.year === selectedYear)
      .sort((a, b) => a.month - b.month); // Sort by month ascending for chronological display
  }, [monthlyData, selectedYear]);

  // Calculate year totals
  const yearTotal = useMemo(() => yearData.reduce((sum, month) => sum + month.revenue, 0), [yearData]);
  const yearOrders = useMemo(() => yearData.reduce((sum, month) => sum + month.order_count, 0), [yearData]);
  
  // Calculate average order value
  const averageOrderValue = yearOrders > 0 ? yearTotal / yearOrders : 0;

  // Get previous year's data for comparison
  const previousYearData = useMemo(() => {
    return monthlyData
      .filter(d => d.year === selectedYear - 1)
      .sort((a, b) => a.month - b.month);
  }, [monthlyData, selectedYear]);

  // Calculate previous year total for comparison
  const previousYearTotal = useMemo(() => 
    previousYearData.reduce((sum, month) => sum + month.revenue, 0), 
  [previousYearData]);

  // Calculate year-over-year growth
  const yearOverYearGrowth = previousYearTotal > 0 
    ? ((yearTotal - previousYearTotal) / previousYearTotal) * 100 
    : 0;

  // Get current month's data for comparison
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthData = yearData.find(d => d.month === currentMonth);
  const previousMonthData = yearData.find(d => d.month === currentMonth - 1);
  
  // Calculate quarterly data
  const quarterlyData = useMemo(() => {
    const quarters = [
      { name: 'Q1', months: [1, 2, 3] },
      { name: 'Q2', months: [4, 5, 6] },
      { name: 'Q3', months: [7, 8, 9] },
      { name: 'Q4', months: [10, 11, 12] }
    ];
    
    return quarters.map(quarter => {
      const monthsData = yearData.filter(d => quarter.months.includes(d.month));
      return {
        name: quarter.name,
        revenue: monthsData.reduce((sum, month) => sum + month.revenue, 0),
        order_count: monthsData.reduce((sum, month) => sum + month.order_count, 0)
      };
    });
  }, [yearData]);

  // Get Q1 data
  const q1Data = useMemo(() => {
    return yearData.filter(d => d.month >= 1 && d.month <= 3);
  }, [yearData]);

  // Calculate Q1 total
  const q1Total = useMemo(() => 
    q1Data.reduce((sum, month) => sum + month.revenue, 0),
  [q1Data]);

  // Calculate Q1 orders
  const q1Orders = useMemo(() => 
    q1Data.reduce((sum, month) => sum + month.order_count, 0),
  [q1Data]);

  // Calculate Q1 average order value
  const q1AverageOrderValue = q1Orders > 0 ? q1Total / q1Orders : 0;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Calculate highest revenue month
  const highestRevenueMonth = useMemo(() => {
    if (yearData.length === 0) return null;
    return yearData.reduce((highest, current) => 
      current.revenue > highest.revenue ? current : highest, yearData[0]);
  }, [yearData]);

  // Calculate lowest revenue month
  const lowestRevenueMonth = useMemo(() => {
    if (yearData.length === 0) return null;
    return yearData.reduce((lowest, current) => 
      current.revenue < lowest.revenue ? current : lowest, yearData[0]);
  }, [yearData]);

  // Calculate month-over-month growth trend
  const growthTrend = useMemo(() => {
    const result = [];
    for (let i = 1; i < yearData.length; i++) {
      const currentMonth = yearData[i];
      const previousMonth = yearData[i-1];
      if (previousMonth.revenue > 0) {
        result.push({
          month: monthNames[currentMonth.month - 1],
          growth: ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
        });
      }
    }
    return result;
  }, [yearData]);

  // Calculate revenue distribution by month (percentage)
  const revenueDistribution = useMemo(() => {
    if (yearTotal === 0) return [];
    return yearData.map(month => ({
      month: monthNames[month.month - 1],
      percentage: (month.revenue / yearTotal) * 100
    }));
  }, [yearData, yearTotal]);

  // Calculate Q1 revenue distribution
  const q1RevenueDistribution = useMemo(() => {
    if (q1Total === 0) return [];
    return q1Data.map(month => ({
      month: monthNames[month.month - 1],
      percentage: (month.revenue / q1Total) * 100
    }));
  }, [q1Data, q1Total]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading revenue data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Revenue Data</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadRevenueData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
          <div className="flex items-center space-x-4">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'monthly' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('quarterly')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'quarterly' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Quarterly
              </button>
              <button
                onClick={() => setViewMode('yearly')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'yearly' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Yearly
              </button>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border rounded-lg px-4 py-2"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              All time
            </p>
          </div>

          {/* Q1 Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Q1 Revenue</h3>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {formatCurrency(q1Total)}
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">
                {q1Orders} orders
              </span>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {formatCurrency(q1AverageOrderValue)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Q1 average
            </p>
          </div>

          {/* Highest Month */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Highest Month</h3>
              <BarChart2 className="w-5 h-5 text-amber-500" />
            </div>
            {highestRevenueMonth && (
              <>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {formatCurrency(highestRevenueMonth.revenue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {monthNames[highestRevenueMonth.month - 1]}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Revenue Trend</h2>
          <div className="h-64 relative">
            {/* Simple bar chart visualization */}
            <div className="absolute inset-0 flex items-end">
              {viewMode === 'monthly' && yearData.map((month, index) => {
                const maxRevenue = Math.max(...yearData.map(d => d.revenue));
                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-4/5 bg-blue-500 rounded-t-lg transition-all duration-500 ease-in-out"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {monthNames[month.month - 1].substring(0, 3)}
                    </div>
                  </div>
                );
              })}

              {viewMode === 'quarterly' && quarterlyData.map((quarter, index) => {
                const maxRevenue = Math.max(...quarterlyData.map(d => d.revenue));
                const height = maxRevenue > 0 ? (quarter.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-4/5 bg-purple-500 rounded-t-lg transition-all duration-500 ease-in-out"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {quarter.name}
                    </div>
                  </div>
                );
              })}

              {viewMode === 'yearly' && years.slice(0, 5).map((year, index) => {
                const yearRevenue = monthlyData
                  .filter(d => d.year === year)
                  .reduce((sum, month) => sum + month.revenue, 0);
                
                const maxRevenue = Math.max(...years.slice(0, 5).map(y => 
                  monthlyData
                    .filter(d => d.year === y)
                    .reduce((sum, month) => sum + month.revenue, 0)
                ));
                
                const height = maxRevenue > 0 ? (yearRevenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-4/5 bg-green-500 rounded-t-lg transition-all duration-500 ease-in-out"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Q1 Revenue Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Q1 Revenue Distribution</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {q1RevenueDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Month-over-Month Growth</h2>
              <LineChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {growthTrend.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 mx-2 flex items-center">
                    <div 
                      className={`h-8 flex items-center justify-end px-2 text-xs font-medium text-white ${
                        item.growth >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(item.growth) * 2, 100)}%`,
                        marginLeft: item.growth < 0 ? 'auto' : '0',
                        marginRight: item.growth >= 0 ? 'auto' : '0',
                      }}
                    >
                      {item.growth.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Q1 Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Q1
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {q1Data.map((month) => (
                  <tr key={month.month} className={`hover:bg-gray-50 ${
                    month.month === currentMonth ? 'bg-blue-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {monthNames[month.month - 1]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(month.revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {month.order_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(month.order_count > 0 ? month.revenue / month.order_count : 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {q1Total > 0 ? ((month.revenue / q1Total) * 100).toFixed(1) : '0.0'}%
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Total Row */}
                <tr className="bg-gray-100 font-medium">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Q1 Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(q1Total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {q1Orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(q1AverageOrderValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Revenue;