import type { FormData, WeddingFormData } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabaseClient';

export const storeForm = async (formData: FormData | WeddingFormData, userId: string): Promise<void> => {
  try {
    // Ensure we have a user ID
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Ensure preferred_contact_method is not null
    const data = {
      ...formData,
      preferred_contact_method: formData.preferred_contact_method || formData.preferredContactMethod || 'phone',
      preferredContactMethod: formData.preferredContactMethod || formData.preferred_contact_method || 'phone',
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the form data
    const { error: formError } = await supabase
      .from('forms')
      .insert([data]);

    if (formError) throw formError;
  } catch (error) {
    console.error('Failed to store form:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getStoredForms = async (userId: string): Promise<FormData[]> => {
  try {
    // Ensure we have a user ID
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(form => ({
      id: form.id,
      fullName: form.fullName || form.full_name,
      contactNumber: form.contactNumber || form.contact_number,
      emailAddress: form.emailAddress || form.email_address,
      date: form.date,
      preferredContactMethod: form.preferredContactMethod || form.preferred_contact_method || 'phone',
      preferredPickUpDate: form.preferredPickUpDate || form.preferred_pickup_date,
      dropOffSignature: form.dropOffSignature || form.dropoff_signature,
      clientSignature: form.clientSignature || form.client_signature,
      garmentDescription: form.garmentDescription || form.garment_description,
      garmentQuantity: form.garmentQuantity || form.garment_quantity || 1,
      garmentType: form.garmentType || form.garment_type,
      timestamp: form.created_at,
      is_wedding_client: form.is_wedding_client,
      wedding_date: form.wedding_date,
      venue: form.venue,
      wedding_party_size: form.wedding_party_size,
      dress_budget: form.dress_budget,
      alterations_deadline: form.alterations_deadline,
      special_requirements: form.special_requirements,
      wedding_party_measurements: form.wedding_party_measurements
    }));
  } catch (error) {
    console.error('Failed to fetch forms:', error);
    throw new Error(handleSupabaseError(error));
  }
};