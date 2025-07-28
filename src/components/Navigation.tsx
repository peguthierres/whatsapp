import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await logout();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                WhatsFlowX
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/dashboard')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/bots"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/bots')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Bots
              </Link>
              <Link
                to="/flows"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/flows')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Fluxos
              </Link>
              <Link
                to="/messages"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/messages')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Mensagens
              </Link>
              <Link
                to="/webhooks"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/webhooks')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Webhooks
              </Link>
              <Link
                to="/flow-logs"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/flow-logs')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Logs
              </Link>
              <Link
                to="/whatsapp-config"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/whatsapp-config')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Config. WhatsApp
              </Link>
              <Link
                to="/environment"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/environment')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Ambiente
              </Link>
              <Link
                to="/sandbox"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/sandbox')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Sandbox
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleLogout}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
