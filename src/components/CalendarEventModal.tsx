import React, { useState, useEffect } from 'react';
import { X, Save, Archive, Camera, Upload, Plus } from 'lucide-react';
import type { Order, Photo, GarmentInfo } from '../types';

type Props = {
  event: {
    id: string;
    title: string;
    date: Date;
    type: 'fitting' | 'pickup' | 'wedding';
    clientName: string;
    status: string;
    order: Order;
    fittingSession?: any;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (order: Order) => void;
  onOrderDelete?: (order: Order) => void;
};

const CalendarEventModal: React.FC<Props> = ({ event, isOpen, onClose, onUpdate, onOrderDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localDate, setLocalDate] = useState('');
  const [localNotes, setLocalNotes] = useState(
    event.type === 'fitting' 
      ? event.fittingSession?.notes || ''
      : event.order.garments[0].garmentInfo.notes
  );

  useEffect(() => {
    // Format date to YYYY-MM-DDTHH:mm
    const date = event.date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    setLocalDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, [event.date]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedOrder = { ...event.order };
    const newDate = new Date(localDate);

    if (event.type === 'pickup') {
      // For pickup events, update the due date
      // Keep only the date part for due_date
      updatedOrder.dueDate = newDate.toISOString().split('T')[0];
    } else if (event.type === 'wedding') {
      // For wedding events, update the wedding date in bridalInfo
      updatedOrder.garments = updatedOrder.garments.map(garment => ({
        ...garment,
        garmentInfo: {
          ...garment.garmentInfo,
          bridalInfo: garment.garmentInfo.bridalInfo ? {
            ...garment.garmentInfo.bridalInfo,
            weddingDate: newDate.toISOString().split('T')[0]
          } : undefined
        }
      }));
    } else if (event.type === 'fitting' && event.fittingSession) {
      // For fitting events, update the fitting session date
      updatedOrder.garments = updatedOrder.garments.map(garment => {
        if (!garment.garmentInfo.bridalInfo) return garment;

        return {
          ...garment,
          garmentInfo: {
            ...garment.garmentInfo,
            bridalInfo: {
              ...garment.garmentInfo.bridalInfo,
              fittingSessions: garment.garmentInfo.bridalInfo.fittingSessions.map(session =>
                session.id === event.fittingSession?.id
                  ? { ...session, date: newDate.toISOString(), notes: localNotes }
                  : session
              )
            }
          }
        };
      });
    }

    onUpdate?.(updatedOrder);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onOrderDelete) {
      onOrderDelete(event.order);
    }
    onClose();
  };

  const getStatusBadge = () => {
    if (event.type === 'fitting') {
      return (
        <span className={`text-xs px-2 py-1 rounded-full ${
          event.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {event.status === 'completed' ? 'Completed' : 'Scheduled'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 m-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-sm text-gray-500">{event.clientName}</p>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge()}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date and Time
            </label>
            {isEditing ? (
              <input
                type="datetime-local"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">
                {event.date.toLocaleString()}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-600">{localNotes || 'No notes'}</p>
            )}
          </div>

          {/* Garment Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Garment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {event.order.garments.map((garment, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-medium">{garment.garmentInfo.type}</p>
                  <p className="text-sm text-gray-600">{garment.garmentInfo.brand}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:text-red-700"
                >
                  Delete Event
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Event
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;