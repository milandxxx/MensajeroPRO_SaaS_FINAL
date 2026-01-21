import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold">
                MensajeroPRO
              </Link>
              
              {/* Navigation links */}
              <div className="hidden md:flex space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive('/')}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/businesses" 
                  className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive('/businesses')}`}
                >
                  Negocios
                </Link>
                <Link 
                  to="/subscription" 
                  className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive('/subscription')}`}
                >
                  Suscripción
                </Link>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="font-semibold">{user?.username || 'Usuario'}</p>
                <p className="text-xs opacity-75">
                  {user?.role === 'superadmin' ? '👑 Superadmin' : user?.role || 'Usuario'}
                </p>
              </div>
              <Link 
                to="/profile" 
                className="p-2 rounded-full hover:bg-blue-700 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}