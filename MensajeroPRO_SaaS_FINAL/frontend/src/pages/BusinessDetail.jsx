import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    try {
      const response = await axios.get(`${API_URL}/businesses/${id}/`);
      setBusiness(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error loading business:', error);
      alert('Negocio no encontrado');
      navigate('/businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`${API_URL}/businesses/${id}/`, formData);
      setBusiness(response.data);
      setEditing(false);
      alert('Negocio actualizado exitosamente');
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Error al actualizar negocio');
    }
  };

  const handleToggleActive = async () => {
    try {
      const response = await axios.put(`${API_URL}/businesses/${id}/`, {
        is_active: !business.is_active
      });
      setBusiness(response.data);
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{business.name}</h1>
          <p className="text-gray-600 mt-1">Gestiona tu negocio</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              business.is_active
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {business.is_active ? 'Desactivar' : 'Activar'}
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            {editing ? 'Cancelar' : 'Editar'}
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center space-x-2">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          business.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {business.is_active ? '✓ Activo' : '○ Inactivo'}
        </span>
        <span className="text-gray-500 text-sm">
          Creado: {new Date(business.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Main content */}
      {editing ? (
        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Negocio
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp
            </label>
            <input
              type="text"
              value={formData.whatsapp_number || ''}
              onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+573001234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token de WhatsApp
            </label>
            <input
              type="password"
              value={formData.whatsapp_token || ''}
              onChange={(e) => setFormData({...formData, whatsapp_token: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tu token de WhatsApp API"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contexto para IA
            </label>
            <textarea
              value={formData.ai_context || ''}
              onChange={(e) => setFormData({...formData, ai_context: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="6"
              placeholder="Eres un asistente virtual que ayuda a los clientes de mi negocio..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Define la personalidad y comportamiento de las respuestas automáticas
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormData(business);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Info card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Información</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-semibold text-gray-800">{business.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="text-gray-800">{business.description || 'Sin descripción'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Propietario</p>
                <p className="font-semibold text-gray-800">{business.owner_username}</p>
              </div>
            </div>
          </div>

          {/* WhatsApp card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">WhatsApp</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Número</p>
                <p className="font-semibold text-gray-800">
                  {business.whatsapp_number || 'No configurado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado del Token</p>
                <p className={`font-semibold ${business.whatsapp_token ? 'text-green-600' : 'text-red-600'}`}>
                  {business.whatsapp_token ? '✓ Configurado' : '✗ Sin configurar'}
                </p>
              </div>
            </div>
          </div>

          {/* AI card */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Configuración de IA</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {business.ai_context || 'No se ha configurado un contexto para la IA'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}