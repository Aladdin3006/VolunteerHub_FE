import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/Authentication.service';

const Unauthorized: React.FC = () => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  const getHomeRoute = () => {
    if (!isAuthenticated) return '/';
    
    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return '/admin/dashboard';
      case 'manager':
        return '/manager/dashboard';
      case 'organization':
        return '/organization/dashboard';
      case 'user':
        return '/user/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <div className="space-y-4">
              <Link
                to={getHomeRoute()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;