import type { Order, Appointment } from '../types';
import axios from 'axios';

const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID || '';
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID || '';
const SQUARE_ACCESS_TOKEN = import.meta.env.VITE_SQUARE_ACCESS_TOKEN || '';

const api = axios.create({
  baseURL: 'https://connect.squareup.com/v2',
  headers: {
    'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

let payments: any;

export const initSquare = async () => {
  if (!SQUARE_APP_ID || !SQUARE_LOCATION_ID) {
    throw new Error('Square credentials not configured');
  }

  if (typeof window === 'undefined') return;

  try {
    payments = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
  } catch (error) {
    console.error('Failed to initialize Square:', error);
    throw error;
  }
};

export const createPayment = async (order: Order, card: any) => {
  if (!payments) {
    throw new Error('Square payments not initialized');
  }

  try {
    const amount = Math.round((order.paymentInfo.totalAmount - order.paymentInfo.depositAmount) * 100);
    
    const paymentResponse = await payments.createPayment({
      source: card,
      amount,
      currency: 'USD',
      locationId: SQUARE_LOCATION_ID,
      idempotencyKey: `${order.id}-${Date.now()}`,
      note: `Payment for Order #${order.id}`,
      customerId: order.clientInfo.email,
      referenceId: order.id
    });

    if (paymentResponse.errors) {
      throw new Error(paymentResponse.errors[0].detail);
    }

    return {
      success: true,
      transactionId: paymentResponse.payment.id,
      amount: amount / 100
    };
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
};

export const createCard = async (elementId: string) => {
  if (!payments) {
    throw new Error('Square payments not initialized');
  }

  try {
    const card = await payments.card();
    await card.attach(`#${elementId}`);
    return card;
  } catch (error) {
    console.error('Failed to create card:', error);
    throw error;
  }
};

export const tokenizeCard = async (card: any) => {
  try {
    const result = await card.tokenize();
    if (result.status === 'OK') {
      return result.token;
    }
    throw new Error(result.errors[0].message);
  } catch (error) {
    console.error('Failed to tokenize card:', error);
    throw error;
  }
};

// Appointments Integration
export const createBooking = async (appointment: Appointment) => {
  try {
    const startAt = new Date(appointment.date).toISOString();
    const endAt = new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000).toISOString();

    const response = await api.post('/bookings', {
      booking: {
        start_at: startAt,
        end_at: endAt,
        location_id: SQUARE_LOCATION_ID,
        customer_id: appointment.clientId,
        appointment_segments: [{
          duration_minutes: 60,
          service_variation_id: getServiceIdForType(appointment.type),
          team_member_id: 'TMXXx', // Replace with actual team member ID
          service_variation_version: 1
        }],
        status: 'ACCEPTED'
      },
      idempotency_key: `${appointment.id}-${Date.now()}`
    });

    return response.data.booking;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
};

export const updateBooking = async (bookingId: string, appointment: Appointment) => {
  try {
    const startAt = new Date(appointment.date).toISOString();
    const endAt = new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000).toISOString();

    const response = await api.put(`/bookings/${bookingId}`, {
      booking: {
        start_at: startAt,
        end_at: endAt,
        status: appointment.status === 'cancelled' ? 'CANCELLED' : 'ACCEPTED'
      }
    });

    return response.data.booking;
  } catch (error) {
    console.error('Failed to update booking:', error);
    throw error;
  }
};

// SMS Integration with Square Messages API
export const sendAppointmentSMS = async (appointment: Appointment, message: string) => {
  try {
    const response = await api.post('/messages', {
      message: {
        recipient: {
          customer_id: appointment.clientId,
          phone_number: appointment.client?.phone
        },
        content: {
          type: 'TEXT',
          text: message
        },
        delivery: {
          method: 'SMS'
        }
      },
      idempotency_key: `sms-${appointment.id}-${Date.now()}`
    });

    return response.data.message;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
};

// Helper function to map appointment types to Square service IDs
const getServiceIdForType = (type: Appointment['type']) => {
  const serviceMap: Record<Appointment['type'], string> = {
    'fitting': 'SRVXXx1', // Replace with actual service IDs
    'pickup': 'SRVXXx2',
    'consultation': 'SRVXXx3',
    'other': 'SRVXXx4'
  };
  return serviceMap[type];
};