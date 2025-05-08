import { supabase, checkConnection } from '../lib/supabaseClient';
import type { Appointment } from '../types';

export const getAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to the database');
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (
          name,
          phone,
          email,
          carrier
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;

    return data.map(appointment => ({
      id: appointment.id,
      clientId: appointment.client_id,
      type: appointment.type as Appointment['type'],
      date: appointment.date,
      duration: appointment.duration,
      status: appointment.status as Appointment['status'],
      notes: appointment.notes,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at,
      client: appointment.clients ? {
        name: appointment.clients.name,
        phone: appointment.clients.phone,
        email: appointment.clients.email,
        carrier: appointment.clients.carrier
      } : undefined
    }));
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    throw error;
  }
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Appointment> => {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to the database');
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        client_id: appointment.clientId,
        type: appointment.type,
        date: appointment.date,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      clientId: data.client_id,
      type: data.type as Appointment['type'],
      date: data.date,
      duration: data.duration,
      status: data.status as Appointment['status'],
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Failed to create appointment:', error);
    throw error;
  }
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>, userId: string): Promise<void> => {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to the database');
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        client_id: updates.clientId,
        type: updates.type,
        date: updates.date,
        duration: updates.duration,
        status: updates.status,
        notes: updates.notes
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (id: string, userId: string): Promise<void> => {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to the database');
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    throw error;
  }
};