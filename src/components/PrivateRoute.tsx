import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  element: React.ReactElement;
};

const PrivateRoute: React.FC<Props> = ({ element }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login with return path
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} />;
  }

  return element;
};

export default PrivateRoute;