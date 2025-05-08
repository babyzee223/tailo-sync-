import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Plus, Search, Filter, Package, Scissors, DollarSign, AlertCircle, Archive, Tag, BarChart2 } from 'lucide-react';
import { InventoryItem } from '../types';

type Category = 'fabric' | 'notions' | 'supplies';
type Status = 'in-stock' | 'low-stock' | 'out-of-stock';

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'White Silk',
    category: 'fabric',
    description: 'Pure silk fabric for wedding dresses',
    quantity: 50,
    unit: 'yards',
    minQuantity: 20,
    price: 29.99,
    location: 'Shelf A1',
    supplier: 'Silk Suppliers Inc.',
    lastRestocked: '2024-03-01',
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Pearl Buttons',
    category: 'notions',
    description: '12mm pearl buttons',
    quantity: 100,
    unit: 'pieces',
    minQuantity: 50,
    price: 0.99,
    location: 'Drawer B2',
    supplier: 'Button World',
    lastRestocked: '2024-02-15',
    status: 'low-stock'
  },
  {
    id: '3',
    name: 'Invisible Zipper',
    category: 'notions',
    description: '20-inch invisible zipper',
    quantity: 25,
    unit: 'pieces',
    minQuantity: 30,
    price: 3.99,
    location: 'Drawer B3',
    supplier: 'Zipper Co',
    lastRestocked: '2024-02-01',
    status: 'low-stock'
  }
];

function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(item => item.status === 'low-stock').length,
    outOfStock: inventory.filter(item => item.status === 'out-of-stock').length,
    totalValue: inventory.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'fabric':
        return <Package className="w-5 h-5" />;
      case 'notions':
        return <Scissors className="w-5 h-5" />;
      case 'supplies':
        return <Archive className="w-5 h-5" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search inventory..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <select
              className="border rounded-lg px-4 py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
            >
              <option value="all">All Categories</option>
              <option value="fabric">Fabric</option>
              <option value="notions">Notions</option>
              <option value="supplies">Supplies</option>
            </select>
            <select
              className="border rounded-lg px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalItems}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.lowStock}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.outOfStock}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              ${stats.totalValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Restocked
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </div>
                      {item.quantity <= item.minQuantity && (
                        <div className="text-xs text-yellow-600">
                          Min: {item.minQuantity}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.lastRestocked).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Inventory;