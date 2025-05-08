import React, { useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { storeOrder } from '../services/orders';
import type { Order } from '../types';

type Props = {
  order: Order;
  onComplete: (updatedOrder: Order) => void;
};

const TaskCompletionButton: React.FC<Props> = ({ order, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create updated order with completed status
      const updatedOrder: Order = {
        ...order,
        status: 'completed',
        timeline: [
          ...order.timeline,
          {
            id: Date.now().toString(),
            type: 'status_change',
            timestamp: new Date().toISOString(),
            description: 'Order marked as completed'
          }
        ]
      };

      // Store the updated order
      await storeOrder(updatedOrder);
      
      // Notify parent component
      onComplete(updatedOrder);
    } catch (err) {
      console.error('Failed to complete order:', err);
      setError('Failed to mark as completed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleComplete}
        disabled={isSubmitting}
        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isSubmitting
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Completing...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </>
        )}
      </button>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default TaskCompletionButton;