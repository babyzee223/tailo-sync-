import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { createBooking, sendAppointmentSMS } from '../services/square';
import type { Appointment } from '../types';

type Props = {
  initialAppointment?: Partial<Appointment>;
  onSubmit: (appointment: Appointment) => void;
  onCancel: () => void;
};

const AppointmentForm: React.FC<Props> = ({ initialAppointment, onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Partial<Appointment>>(initialAppointment || {
    type: 'fitting',
    status: 'scheduled',
    duration: '1 hour'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Create booking in Square
      const booking = await createBooking(appointment as Appointment);

      // Send confirmation SMS
      if (appointment.client?.phone) {
        const message = `Your ${appointment.type} appointment has been scheduled for ${new Date(appointment.date!).toLocaleString()}. We look forward to seeing you!`;
        await sendAppointmentSMS(appointment as Appointment, message);
      }

      onSubmit({
        ...appointment,
        id: booking.id
      } as Appointment);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to schedule appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Type
          </label>
          <select
            value={appointment.type}
            onChange={(e) => setAppointment({ ...appointment, type: e.target.value as Appointment['type'] })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="fitting">Fitting</option>
            <option value="pickup">Pickup</option>
            <option value="consultation">Consultation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date and Time
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="datetime-local"
              value={appointment.date}
              onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <select
              value={appointment.duration}
              onChange={(e) => setAppointment({ ...appointment, duration: e.target.value })}
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="1.5 hours">1.5 hours</option>
              <option value="2 hours">2 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={appointment.notes || ''}
            onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special instructions or notes..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Scheduling...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Schedule Appointment
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;