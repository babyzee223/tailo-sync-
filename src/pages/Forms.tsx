import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Save, FileText, Calendar, Phone, Mail, User, AlertCircle, BellRing as Ring } from 'lucide-react';
import { storeForm } from '../services/forms';
import type { FormData, WeddingFormData } from '../types';
import { useAuth } from '../contexts/AuthContext';

function Forms() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<WeddingFormData>>({
    fullName: '',
    contactNumber: '',
    emailAddress: '',
    date: new Date().toISOString().split('T')[0],
    preferredContactMethod: 'phone', // Set default value
    preferred_contact_method: 'phone', // Add this field for database compatibility
    preferredPickUpDate: '',
    dropOffSignature: null,
    clientSignature: null,
    garmentDescription: '',
    garmentQuantity: 1,
    garmentType: '',
    is_wedding_client: false,
    wedding_date: '',
  });

  const dropOffCanvasRef = useRef<HTMLCanvasElement>(null);
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvases
  useEffect(() => {
    const initCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    initCanvas(dropOffCanvasRef.current);
    initCanvas(clientCanvasRef.current);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const pos = getEventPosition(e, rect);
    setLastPos(pos);

    // Start new path
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    e.preventDefault(); // Prevent scrolling on touch devices

    const rect = canvas.getBoundingClientRect();
    const pos = getEventPosition(e, rect);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    
    setLastPos(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  const getEventPosition = (e: React.MouseEvent | React.TouchEvent, rect: DOMRect) => {
    const touch = 'touches' in e ? e.touches[0] : null;
    const mouseEvent = touch || (e as React.MouseEvent);
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top
    };
  };

  const clearSignature = (type: 'dropOff' | 'client') => {
    try {
      const canvas = type === 'dropOff' ? dropOffCanvasRef.current : clientCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Reset form data signature
          setFormData(prev => ({
            ...prev,
            [type === 'dropOff' ? 'dropOffSignature' : 'clientSignature']: null
          }));
        }
      }
    } catch (err) {
      console.error('Error clearing signature:', err);
      setError('Failed to clear signature. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (!user?.id) {
        throw new Error('Please log in to submit forms');
      }

      // Validate required fields
      if (!formData.fullName || !formData.contactNumber || !formData.emailAddress || !formData.preferredPickUpDate) {
        throw new Error('Please fill in all required fields');
      }

      // Get signatures from canvases
      const dropOffSignature = dropOffCanvasRef.current?.toDataURL() || null;
      const clientSignature = clientCanvasRef.current?.toDataURL() || null;

      if (!dropOffSignature || !clientSignature) {
        throw new Error('Both signatures are required');
      }

      // Validate wedding date if is wedding client
      if (formData.is_wedding_client && !formData.wedding_date) {
        throw new Error('Wedding date is required for wedding clients');
      }

      // Ensure preferred contact method is not null
      const contactMethod = formData.preferredContactMethod || 'phone';

      // Format dates before submission
      const formattedData = {
        ...formData,
        date: new Date(formData.date || '').toISOString().split('T')[0],
        preferredPickUpDate: formData.preferredPickUpDate 
  ? new Date(formData.preferredPickUpDate).toISOString().split('T')[0]
  : null,
        preferredContactMethod: contactMethod,
        preferred_contact_method: contactMethod, // Add both versions for database compatibility
        wedding_date: formData.wedding_date ? new Date(formData.wedding_date).toISOString().split('T')[0] : null,
        dropOffSignature,
        clientSignature
      } as WeddingFormData;

      await storeForm(formattedData, user.id);
      
      // Reset form
      setFormData({
        fullName: '',
        contactNumber: '',
        emailAddress: '',
        date: new Date().toISOString().split('T')[0],
        preferredContactMethod: 'phone',
        preferred_contact_method: 'phone',
        preferredPickUpDate: '',
        dropOffSignature: null,
        clientSignature: null,
        garmentDescription: '',
        garmentQuantity: 1,
        garmentType: '',
        is_wedding_client: false,
        wedding_date: '',
      });

      // Clear signatures
      clearSignature('dropOff');
      clearSignature('client');

      // Show success message
      alert('Form submitted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle preferred contact method change
  const handleContactMethodChange = (method: string) => {
    setFormData({
      ...formData,
      preferredContactMethod: method,
      preferred_contact_method: method // Update both fields
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit Form</h1>
        </div>

        {/* Form Submission Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Wedding Client Checkbox */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_wedding_client}
                  onChange={(e) => setFormData({ ...formData, is_wedding_client: e.target.checked })}
                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-purple-900 font-medium flex items-center">
                  <Ring className="w-4 h-4 mr-2" />
                  This is for a wedding
                </span>
              </label>

              {formData.is_wedding_client && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Wedding Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.wedding_date}
                    onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required={formData.is_wedding_client}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Client Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Contact Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.preferredContactMethod || 'phone'}
                    onChange={(e) => handleContactMethodChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="text">Text Message</option>
                  </select>
                </div>
              </div>

              {/* Garment Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Garment Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Garment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.garmentType}
                    onChange={(e) => setFormData({ ...formData, garmentType: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="dress">Dress</option>
                    <option value="suit">Suit</option>
                    <option value="pants">Pants</option>
                    <option value="shirt">Shirt</option>
                    <option value="skirt">Skirt</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.garmentQuantity}
                    onChange={(e) => setFormData({ ...formData, garmentQuantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.garmentDescription}
                    onChange={(e) => setFormData({ ...formData, garmentDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the garment and alterations needed..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Pick-Up Date <span className="text-red-500">*</span>
                  </label>          
                  <input
                    type="date"
                    value={formData.preferredPickUpDate || ""}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        preferredPickUpDate: e.target.value 
                      });
                    }}
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6">
              {/* Drop-off Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drop-off Signature <span className="text-red-500">*</span>
                </label>
                <div className="border rounded-lg p-2">
                  <canvas
                    ref={dropOffCanvasRef}
                    width={400}
                    height={150}
                    className="border rounded w-full touch-none bg-white"
                    onMouseDown={(e) => startDrawing(e, dropOffCanvasRef)}
                    onMouseMove={(e) => draw(e, dropOffCanvasRef)}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => startDrawing(e, dropOffCanvasRef)}
                    onTouchMove={(e) => draw(e, dropOffCanvasRef)}
                    onTouchEnd={stopDrawing}
                  />
                  <button
                    type="button"
                    onClick={() => clearSignature('dropOff')}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>

              {/* Client Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Signature <span className="text-red-500">*</span>
                </label>
                <div className="border rounded-lg p-2">
                  <canvas
                    ref={clientCanvasRef}
                    width={400}
                    height={150}
                    className="border rounded w-full touch-none bg-white"
                    onMouseDown={(e) => startDrawing(e, clientCanvasRef)}
                    onMouseMove={(e) => draw(e, clientCanvasRef)}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => startDrawing(e, clientCanvasRef)}
                    onTouchMove={(e) => draw(e, clientCanvasRef)}
                    onTouchEnd={stopDrawing}
                  />
                  <button
                    type="button"
                    onClick={() => clearSignature('client')}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Submit Form
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Forms;