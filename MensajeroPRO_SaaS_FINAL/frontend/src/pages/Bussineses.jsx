import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ai_context: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const response = await axios.get(`${API_URL}/businesses/`);
      setBusinesses(response.data.businesses);
      setStats({
        total: response.data.total,
        limit: response.data.limit,
        can_create: response.data.can_create_more
      });
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`${API_URL}/businesses/`, formData);
      setShowModal(false);
      setFormData({ name: '', description: '', ai_context: '' });
      loadBusinesses();
    } catch (error) {
      console.error('Error creating business:', error);
      setError(error.response?.data?.error || 'Error al crear negocio');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar el negocio "${name}"?`)) return;

    try {
      await axios.delete(`${API_URL}/businesses/${id}/`);
      loadBusinesses();
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Error al eliminar negocio');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando negocios...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mis Negocios</h1>
          <p className="text-gray-600 mt-1">
            {stats?.total} de {stats?.limit} negocios creados
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!stats?.can_create}
          className={`px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2 ${
            stats?.can_create
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Negocio</span>
        </button>
      </div>

      {/* Warning if limit reached */}
      {!stats?.can_create && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-700">
            <strong>Límite alcanzado:</strong> Has creado el máximo de negocios permitidos.
            <Link to="/subscription" className="font-bold underline ml-2">
              Actualiza tu plan
            </Link>
          </p>
        </div>
      )}

      {/* Businesses grid */}
      {businesses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes negocios</h3>
          <p className="text-gray-500">Crea tu primer negocio para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{business.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  business.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {business.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {business.description || 'Sin descripción'}
              </p>

              <div className="flex space-x-2">
                <Link
                  to={`/businesses/${business.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center transition"
                >
                  Ver detalles
                </Link>
                <button
                  onClick={() => handleDelete(business.id, business.name)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Crear Nuevo Negocio</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mi Negocio"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Descripción breve..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contexto para IA
                </label>
                <textarea
                  value={formData.ai_context}
                  onChange={(e) => setFormData({...formData, ai_context: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Eres un asistente de..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setFormData({ name: '', description: '', ai_context: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Negocio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}