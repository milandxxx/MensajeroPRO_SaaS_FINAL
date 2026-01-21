import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const PLANS = [
  {
    type: 'basic',
    name: 'Basic',
    price: 10,
    businesses: 1,
    messages: '1,000',
    features: [
      '1 Negocio',
      '1,000 mensajes/mes',
      'IA básica',
      'WhatsApp integrado',
      'Soporte por email'
    ]
  },
  {
    type: 'pro',
    name: 'Pro',
    price: 50,
    businesses: 5,
    messages: '10,000',
    features: [
      '5 Negocios',
      '10,000 mensajes/mes',
      'IA avanzada',
      'WhatsApp + Telegram',
      'Analytics básico',
      'Soporte prioritario'
    ],
    popular: true
  },
  {
    type: 'enterprise',
    name: 'Enterprise',
    price: 200,
    businesses: 50,
    messages: '100,000',
    features: [
      '50 Negocios',
      '100,000 mensajes/mes',
      'IA personalizada',
      'Todas las integraciones',
      'Analytics avanzado',
      'Soporte 24/7',
      'Onboarding personalizado'
    ]
  }
];

export default function Subscription() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const dashRes = await axios.get(`${API_URL}/dashboard/`);
      setIsSuperadmin(dashRes.data.user.is_superadmin);

      const subRes = await axios.get(`${API_URL}/subscription/status/`);
      setCurrentPlan(subRes.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType, price) => {
    setProcessing(true);
    
    try {
      const response = await axios.post(`${API_URL}/payments/create/`, {
        amount: price,
        plan_type: planType
      });

      // Redirect to PayPal
      if (response.data.approval_url) {
        window.location.href = response.data.approval_url;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al procesar el pago');
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  // Superadmin view
  if (isSuperadmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
          <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h1 className="text-4xl font-bold mb-2">¡Eres Superadmin! 👑</h1>
          <p className="text-xl mb-4">Tienes acceso ilimitado y gratuito</p>
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-3xl font-bold">∞</p>
              <p className="text-sm">Negocios</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-3xl font-bold">∞</p>
              <p className="text-sm">Mensajes</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-3xl font-bold">$0</p>
              <p className="text-sm">Costo</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular user view
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Planes y Precios</h1>
        <p className="text-gray-600">Elige el plan perfecto para tu negocio</p>
      </div>

      {/* Current plan banner */}
      {currentPlan?.active && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <p className="text-sm text-green-700">
            <strong>Plan actual:</strong> {currentPlan.plan_type} - Activo hasta {new Date(currentPlan.end_date).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.type}
            className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition hover:shadow-xl ${
              plan.popular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-semibold">
                Popular
              </div>
            )}

            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/mes</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.type, plan.price)}
                disabled={processing || currentPlan?.plan_type === plan.type}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  currentPlan?.plan_type === plan.type
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {currentPlan?.plan_type === plan.type ? 'Plan Actual' : 'Suscribirme'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800">¿Puedo cancelar en cualquier momento?</h3>
            <p className="text-gray-600 mt-1">Sí, puedes cancelar tu suscripción cuando quieras sin cargos adicionales.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">¿Qué métodos de pago aceptan?</h3>
            <p className="text-gray-600 mt-1">Aceptamos PayPal y tarjetas de crédito/débito a través de PayPal.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">¿Puedo cambiar de plan?</h3>
            <p className="text-gray-600 mt-1">Sí, puedes actualizar o degradar tu plan en cualquier momento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}