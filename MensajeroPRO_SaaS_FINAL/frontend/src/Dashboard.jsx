import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  const isSuperadmin = stats?.user?.is_superadmin;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ¡Bienvenido, {stats?.user?.username}! 👋
        </h1>
        <p className="text-gray-600">
          {isSuperadmin 
            ? '🎉 Tienes acceso ilimitado como Superadmin' 
            : 'Administra tus negocios y suscripción desde aquí'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Businesses card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Negocios</p>
              <p className="text-4xl font-bold mt-2">{stats?.businesses?.total || 0}</p>
              <p className="text-blue-100 text-sm mt-2">
                Límite: {isSuperadmin ? '∞ Ilimitado' : stats?.businesses?.limit || 0}
              </p>
            </div>
            <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Active businesses card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Activos</p>
              <p className="text-4xl font-bold mt-2">{stats?.businesses?.active || 0}</p>
              <p className="text-green-100 text-sm mt-2">Negocios funcionando</p>
            </div>
            <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Subscription card */}
        <div className={`bg-gradient-to-br ${isSuperadmin ? 'from-purple-500 to-purple-600' : stats?.subscription?.active ? 'from-yellow-500 to-yellow-600' : 'from-red-500 to-red-600'} rounded-lg shadow-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Suscripción</p>
              <p className="text-2xl font-bold mt-2">
                {isSuperadmin ? 'Gratis' : stats?.subscription?.active ? 'Activa' : 'Inactiva'}
              </p>
              <p className="text-white text-sm mt-2 opacity-90">
                {isSuperadmin ? '👑 Acceso total' : stats?.subscription?.active ? 'Plan activo' : 'Requiere pago'}
              </p>
            </div>
            <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/businesses"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-semibold text-gray-700">Nuevo Negocio</span>
          </Link>

          <Link
            to="/subscription"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
          >
            <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-semibold text-gray-700">Ver Planes</span>
          </Link>

          <Link
            to="/profile"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
          >
            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-semibold text-gray-700">Mi Perfil</span>
          </Link>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-gray-700">Ayuda</span>
          </div>
        </div>
      </div>

      {/* Warning if no subscription */}
      {!isSuperadmin && stats?.permissions?.requires_payment && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Atención:</strong> Necesitas una suscripción activa para crear negocios.
                <Link to="/subscription" className="font-bold underline ml-2">
                  Ver planes disponibles
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}