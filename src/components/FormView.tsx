import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, AlertCircle } from 'lucide-react';
import { getStoredForms } from '../services/forms';
import { supabase } from '../lib/supabaseClient';
import type { FormData } from '../types';

const FormView: React.FC = () => {
  const [forms, setForms] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForms = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
          throw new Error('User not found. Please log in again.');
        }

        const loadedForms = await getStoredForms(user.id);
        setForms(Array.isArray(loadedForms) ? loadedForms : []);
        setError(null);
      } catch (err) {
        setError('Failed to load forms. Please try again later.');
        console.error('Error loading forms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadForms();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-500">Loading forms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {forms.length > 0 ? (
        forms.map((form) => (
          <div key={form.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-50 rounded-lg p-2">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{form.fullName}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(form.timestamp || '').toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500">Contact Number</label>
                  <p className="text-gray-900">{form.contactNumber}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Email Address</label>
                  <p className="text-gray-900">{form.emailAddress}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Submission Date</label>
                  <p className="text-gray-900">{form.date}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Preferred Pick-Up Date</label>
                  <p className="text-gray-900">{form.preferredPickUpDate}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-gray-500">Garment Details</label>
                <p className="text-gray-900">{form.garmentDescription || 'No description provided'}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No forms submitted yet</p>
        </div>
      )}
    </div>
  );
};

export default FormView;