import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { initSquare, createCard, tokenizeCard, createPayment } from '../services/square';
import type { Order } from '../types';

type Props = {
  order: Order;
  onPaymentComplete: (transactionId: string) => void;
};

const PaymentForm: React.FC<Props> = ({ order, onPaymentComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const initializeSquare = async () => {
      try {
        await initSquare();
        const cardInstance = await createCard('card-container');
        setCard(cardInstance);
      } catch (error) {
        setError('Failed to initialize payment form. Please try again.');
        console.error('Square initialization failed:', error);
      }
    };

    initializeSquare();

    // Cleanup
    return () => {
      if (card) {
        card.destroy();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = await tokenizeCard(card);
      const result = await createPayment(order, token);
      
      if (result.success) {
        setIsSuccess(true);
        onPaymentComplete(result.transactionId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your payment has been processed successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-gray-600">Amount to Pay:</span>
        </div>
        <span className="text-lg font-medium text-gray-900">
          ${(order.paymentInfo.totalAmount - order.paymentInfo.depositAmount).toFixed(2)}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div
          id="card-container"
          className="p-3 border rounded-lg bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay Now
          </>
        )}
      </button>
    </form>
  );
};

export default PaymentForm;