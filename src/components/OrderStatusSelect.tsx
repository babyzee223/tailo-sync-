import React, { useState, useMemo } from 'react';
import { Save, Mail, AlertCircle, Calendar } from 'lucide-react';
import type { Order, AlterationStatus } from '../types';
import { sendStatusUpdateEmail } from '../services/email';
import { sendStatusUpdateSMS } from '../services/sms';

type Props = {
  order: Order;
  onStatusChange: (newStatus: AlterationStatus) => void;
};

const OrderStatusSelect: React.FC<Props> = ({ order, onStatusChange }) => {
  const [selectedStatus, setSelectedStatus] = useState<AlterationStatus>(order.status);
  const [isFittingUpdate, setIsFittingUpdate] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const nextFitting = useMemo(() => {
    if (!isFittingUpdate) return null;

    const fittingSessions = order.garments
      .flatMap(g => g.garmentInfo.bridalInfo?.fittingSessions || [])
      .filter(session => !session.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return fittingSessions[0] || null;
  }, [order, isFittingUpdate]);

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as AlterationStatus;
    setSelectedStatus(newStatus);
    setHasChanges(true);
    setNotification(null);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // Only send notifications for in-progress and completed status
      if (selectedStatus === 'in-progress' || selectedStatus === 'completed') {
        const updatedOrder = { 
          ...order, 
          status: selectedStatus,
          isFittingUpdate // Add this flag to the order for the email template
        };
        
        // Send both notifications in parallel
        const [emailResult, smsResult] = await Promise.all([
          sendStatusUpdateEmail(updatedOrder),
          sendStatusUpdateSMS(updatedOrder)
        ]);

        setNotification({
          type: 'success',
          message: `Status updated and notifications sent to ${order.clientInfo.email}`
        });
      }
      
      onStatusChange(selectedStatus);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to send notifications. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={selectedStatus}
          onChange={handleStatusSelect}
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            selectedStatus === 'pending'
              ? 'bg-gray-100 text-gray-700'
              : selectedStatus === 'in-progress'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {hasChanges && (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFittingUpdate}
                onChange={(e) => setIsFittingUpdate(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Fitting Update
            </label>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isSaving
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      </div>

      {/* Show next fitting date when fitting update is selected */}
      {isFittingUpdate && nextFitting && (
        <div className="flex items-center gap-2 text-sm bg-purple-50 text-purple-700 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span>
            Next Fitting: {new Date(nextFitting.date).toLocaleString()} ({nextFitting.type})
          </span>
        </div>
      )}

      {notification && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {notification.type === 'success' ? (
            <Mail className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default OrderStatusSelect;