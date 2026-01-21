 import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Profile() {
  const { user, loadUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, paymentsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/`),
        axios.get(`${API_URL}/payments/`)
      ]);
      
      setStats(dashRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  const isSuperadmin = stats?.user?.is_superadmin;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {stats?.user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{stats?.user?.username}</h1>
            <p className="text-gray-600">{stats?.user?.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
              isSuperadmin 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isSuperadmin ? '👑 Superadmin' : stats?.user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Información de Cuenta</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Usuario</p>
              <p className="font-semibold text-gray-800">{stats?.user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-gray-800">{stats?.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rol</p>
              <p className="font-semibold text-gray-800">
                {isSuperadmin ? 'Superadmin' : 'Usuario'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Límite de Negocios</p>
              <p className="font-semibold text-gray-800">
                {isSuperadmin ? '∞ Ilimitado' : stats?.businesses?.limit}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription info */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Suscripción</h2>
        </div>
        <div className="p-6">
          {isSuperadmin ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-purple-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Acceso de Superadmin</h3>
              <p className="text-gray-600">Tienes acceso ilimitado y gratuito a todas las funciones</p>
            </div>
          ) : stats?.subscription?.active ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold text-green-600">✓ Activa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {stats?.subscription?.plan_type || 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sin Suscripción Activa</h3>
              <p className="text-gray-600 mb-4">Suscríbete para crear negocios</p>
              <a
                href="/subscription"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Ver Planes
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Payment history */}
      {!isSuperadmin && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Historial de Pagos</h2>
          </div>
          <div className="p-6">
            {payments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay pagos registrados</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        Plan {payment.plan_type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">${payment.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats?.businesses?.total || 0}</p>
            <p className="text-sm text-gray-600">Negocios</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats?.businesses?.active || 0}</p>
            <p className="text-sm text-gray-600">Activos</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              {isSuperadmin ? '∞' : stats?.businesses?.limit || 0}
            </p>
            <p className="text-sm text-gray-600">Límite</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{payments.length}</p>
            <p className="text-sm text-gray-600">Pagos</p>
          </div>
        </div>
      </div>
    </div>
  );
}