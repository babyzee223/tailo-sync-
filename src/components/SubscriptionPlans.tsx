import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight, Scissors } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const features = [
  'Unlimited orders',
  'Client management',
  'Appointment scheduling',
  'Email notifications',
  'Revenue tracking',
  'Photo storage',
  'Custom forms'
];

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const startTrial = () => {
    if (!user) {
      navigate('/signup');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="rounded-full bg-blue-100 p-3">
          <Scissors className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Start Managing Your Alterations Business
        </h1>
        <p className="text-xl text-gray-600">
          Try Alterations Pro free for 10 days. No credit card required.
        </p>
      </div>

      {/* Trial Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-12">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Start Your Free Trial</h2>
            <p className="text-lg opacity-90 mb-6">
              Get full access to all features for 10 days
            </p>
            <button
              onClick={startTrial}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
          <Calendar className="w-12 h-12 opacity-90" />
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Everything You Need</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              What's included in the free trial?
            </h3>
            <p className="text-gray-600">
              You get full access to all features for 10 days. No credit card required to start.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              What happens after the trial?
            </h3>
            <p className="text-gray-600">
              After the trial ends, you can continue using the basic features of Alterations Pro.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Do I need to provide payment information?
            </h3>
            <p className="text-gray-600">
              No, you can start your free trial without entering any payment information.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Can I export my data?
            </h3>
            <p className="text-gray-600">
              Yes, you can export your data at any time during or after your trial period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;