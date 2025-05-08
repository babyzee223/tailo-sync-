import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Messages from './pages/Messages';
import Clients from './pages/Clients';
import Inventory from './pages/Inventory';
import Forms from './pages/Forms';
import Tools from './pages/Tools';
import Revenue from './pages/Revenue';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/orders" element={<PrivateRoute element={<Orders />} />} />
            <Route path="/messages" element={<PrivateRoute element={<Messages />} />} />
            <Route path="/clients" element={<PrivateRoute element={<Clients />} />} />
            <Route path="/inventory" element={<PrivateRoute element={<Inventory />} />} />
            <Route path="/forms" element={<PrivateRoute element={<Forms />} />} />
            <Route path="/tools" element={<PrivateRoute element={<Tools />} />} />
            <Route path="/revenue" element={<PrivateRoute element={<Revenue />} />} />
            <Route path="/tasks" element={<PrivateRoute element={<Tasks />} />} />
            <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;