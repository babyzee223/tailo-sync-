import React, { useState } from 'react';
import { Menu, Settings, User, FileText, Box, Mail, Home, X, LogOut, FileSignature, Wrench, DollarSign, CheckSquare } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const NavItem = ({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) => (
    <NavLink
      to={to}
      onClick={() => setIsSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 px-4">
        <div className="flex items-center justify-between h-full">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Logo size="sm" />
          <div className="w-10" />
        </div>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-[280px] bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-50 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {user && (
              <div className="mt-4 flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            )}
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem to="/" icon={Home}>Dashboard</NavItem>
            <NavItem to="/orders" icon={FileText}>Orders</NavItem>
            <NavItem to="/tasks" icon={CheckSquare}>Tasks</NavItem>
            <NavItem to="/clients" icon={User}>Clients</NavItem>
            <NavItem to="/inventory" icon={Box}>Inventory</NavItem>
            <NavItem to="/messages" icon={Mail}>Messages</NavItem>
            <NavItem to="/forms" icon={FileSignature}>Forms</NavItem>
            <NavItem to="/tools" icon={Wrench}>Tools</NavItem>
            <NavItem to="/revenue" icon={DollarSign}>Revenue</NavItem>
          </nav>

          <div className="p-4 border-t space-y-1">
            <NavItem to="/settings" icon={Settings}>Settings</NavItem>
            <button 
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-[280px] p-4 lg:p-8 mt-16 lg:mt-0 min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;