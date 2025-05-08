import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Lock, AlertCircle, Scissors } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const planId = location.state?.planId;
      if (!planId) {
        throw new Error('No plan selected');
      }

      // Get the plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // Create Stripe Checkout Session
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { data: session, error: sessionError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId: plan.id,
          userId: user.id,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing`
        }
      });

      if (sessionError) throw sessionError;

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (result.error) throw result.error;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-3">
            <Scissors className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Complete Your Subscription
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You're just one step away from getting started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              <p className="text-sm">
                You'll be redirected to our secure payment provider
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              What's included:
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>• Unlimited orders and clients</li>
              <li>• Full access to all features</li>
              <li>• Email and SMS notifications</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Questions? Contact us at support@alterationspro.com
        </p>
      </div>
    </div>
  );
};

export default CheckoutForm;