import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2, DollarSign, Camera, Upload, AlertCircle, Scissors, Calendar, MapPin, Users } from 'lucide-react';
import type { ClientInfo, GarmentInfo, Accessories, PaymentMethod, Order, Measurement, DesignInfo, AlterationServices, EventInfo, Photo, Annotation } from '../types';
import { emptyDesignInfo, emptyBridalInfo } from '../types/constants';
import PhotoAnnotator from './PhotoAnnotator';
import MeasurementInput from './MeasurementInput';
import CustomDesignForm from './CustomDesignForm';
import BridalForm from './BridalForm';
import { generateOrderNumber } from '../services/orders';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
};

const emptyGarment = {
  garmentInfo: {
    type: '',
    brand: '',
    color: '',
    quantity: 1,
    photos: [] as Photo[],
    notes: '',
    annotations: {},
    notionsToFix: {
      buttons: false,
      zippers: false,
      other: '',
    },
    alterationServices: {
      steaming: false,
      pressing: false,
      pleating: {
        needed: false,
        type: 'knife' as const,
        customType: '',
        notes: ''
      }
    } as AlterationServices
  },
  accessories: {
    hanger: { included: false, description: '' },
    bag: { included: false, description: '' },
    belt: false,
    clips: false,
    other: '',
  },
  measurements: [] as Measurement[]
};

const NewOrderModal: React.FC<Props> = ({ isOpen, onClose, onOrderCreated }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'client' | 'garment'>('client');
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    phone: '',
    email: '',
    carrier: 'other',
  });
  const [garments, setGarments] = useState<{ garmentInfo: GarmentInfo; accessories: Accessories; measurements: Measurement[] }[]>([
    { ...emptyGarment },
  ]);
  const [totalAmount, setTotalAmount] = useState<string>('0');
  const [depositAmount, setDepositAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [dueDate, setDueDate] = useState('');
  const [eventInfo, setEventInfo] = useState<EventInfo | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingBalance = Math.max(0, (parseFloat(totalAmount) || 0) - (parseFloat(depositAmount) || 0));

  const validateForm = (): boolean => {
    if (!clientInfo.name || !clientInfo.phone || !clientInfo.email) {
      setError('Please fill in all client information fields');
      setActiveTab('client');
      return false;
    }

    if (!garments[0].garmentInfo.type) {
      setError('Please specify at least one garment type');
      setActiveTab('garment');
      return false;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return false;
    }

    if (parseFloat(totalAmount) <= 0) {
      setError('Total amount must be greater than 0');
      return false;
    }

    if (parseFloat(depositAmount) > parseFloat(totalAmount)) {
      setError('Deposit amount cannot be greater than total amount');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = await generateOrderNumber();

      // Ensure date is in YYYY-MM-DD format
      const formattedDueDate = dueDate.split('T')[0]; // Handle both date and datetime-local inputs
      const now = new Date().toISOString();

      // Format event date if it exists
      const formattedEventInfo = eventInfo ? {
        ...eventInfo,
        date: eventInfo.date.split('T')[0] // Ensure date is in YYYY-MM-DD format
      } : undefined;

      // Format garment dates
      const formattedGarments = garments.map(garment => ({
        ...garment,
        garmentInfo: {
          ...garment.garmentInfo,
          bridalInfo: garment.garmentInfo.bridalInfo ? {
            ...garment.garmentInfo.bridalInfo,
            weddingDate: garment.garmentInfo.bridalInfo.weddingDate ? 
              garment.garmentInfo.bridalInfo.weddingDate.split('T')[0] : '', // Ensure date is in YYYY-MM-DD format
            fittingSessions: (garment.garmentInfo.bridalInfo.fittingSessions || []).map(session => ({
              ...session,
              date: session.date ? new Date(session.date).toISOString() : ''
            }))
          } : undefined,
          designInfo: garment.garmentInfo.designInfo ? {
            ...garment.garmentInfo.designInfo,
            fittingDate: garment.garmentInfo.designInfo.fittingDate ? 
              garment.garmentInfo.designInfo.fittingDate.split('T')[0] : undefined // Ensure date is in YYYY-MM-DD format
          } : undefined
        }
      }));

      const newOrder: Order = {
        id: orderId,
        clientInfo,
        garments: formattedGarments,
        paymentInfo: {
          totalAmount: parseFloat(totalAmount),
          depositAmount: parseFloat(depositAmount),
          paymentMethod,
        },
        description: garments.map(g => g.garmentInfo.type).join(', '),
        status: 'pending',
        dueDate: formattedDueDate,
        createdAt: now,
        updatedAt: now,
        timeline: [{
          id: '1',
          type: 'status_change',
          timestamp: now,
          description: 'Order created'
        }],
        eventInfo: formattedEventInfo
      };

      onOrderCreated(newOrder);
      onClose();
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGarmentChange = (index: number, updates: Partial<GarmentInfo>) => {
    const updatedGarments = [...garments];
    updatedGarments[index] = {
      ...updatedGarments[index],
      garmentInfo: {
        ...updatedGarments[index].garmentInfo,
        ...updates
      }
    };
    setGarments(updatedGarments);
  };

  const handleAccessoryChange = (index: number, updates: Partial<Accessories>) => {
    const updatedGarments = [...garments];
    updatedGarments[index] = {
      ...updatedGarments[index],
      accessories: {
        ...updatedGarments[index].accessories,
        ...updates
      }
    };
    setGarments(updatedGarments);
  };

  const handleMeasurementsChange = (index: number, measurements: Measurement[]) => {
    const updatedGarments = [...garments];
    updatedGarments[index] = {
      ...updatedGarments[index],
      measurements
    };
    setGarments(updatedGarments);
  };

  const addGarment = () => {
    setGarments([...garments, { ...emptyGarment }]);
  };

  const removeGarment = (index: number) => {
    if (garments.length > 1) {
      setGarments(garments.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Order</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-4 border-b">
            <button
              type="button"
              onClick={() => setActiveTab('client')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'client'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Client Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('garment')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'garment'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Garment Details
            </button>
          </div>

          {/* Client Information Tab */}
          {activeTab === 'client' && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Carrier
                    </label>
                    <select
                      value={clientInfo.carrier || 'other'}
                      onChange={(e) => setClientInfo({ ...clientInfo, carrier: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="verizon">Verizon</option>
                      <option value="att">AT&T</option>
                      <option value="tmobile">T-Mobile</option>
                      <option value="sprint">Sprint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="venmo">Venmo</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Remaining Balance:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${remainingBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Garment Details Tab */}
          {activeTab === 'garment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Garments</h3>
                <button
                  type="button"
                  onClick={addGarment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Garment
                </button>
              </div>

              {garments.map((garment, index) => (
                <div key={index} className="bg-white rounded-lg border p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-medium text-gray-900">Garment {index + 1}</h4>
                    {garments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGarment(index)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Basic Garment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Garment Type
                      </label>
                      <select
                        value={garment.garmentInfo.type}
                        onChange={(e) => {
                          const type = e.target.value;
                          const updates: Partial<GarmentInfo> = { type };
                          
                          // Add bridalInfo only for Wedding Dress
                          if (type === 'Wedding Dress') {
                            updates.bridalInfo = emptyBridalInfo;
                          }
                          
                          // Add designInfo only for Custom
                          if (type === 'Custom') {
                            updates.designInfo = emptyDesignInfo;
                          }
                          
                          handleGarmentChange(index, updates);
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select type</option>
                        <option value="Wedding Dress">Wedding Dress</option>
                        <option value="Custom">Custom Design</option>
                        <option value="Dress">Dress</option>
                        <option value="Suit">Suit</option>
                        <option value="Pants">Pants</option>
                        <option value="Shirt">Shirt</option>
                        <option value="Skirt">Skirt</option>
                        <option value="Jacket">Jacket</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={garment.garmentInfo.brand}
                        onChange={(e) => handleGarmentChange(index, { brand: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        value={garment.garmentInfo.color}
                        onChange={(e) => handleGarmentChange(index, { color: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={garment.garmentInfo.quantity}
                        onChange={(e) => handleGarmentChange(index, { quantity: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Photos & Annotations */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Photos & Notes</h5>
                    <PhotoAnnotator
                      photos={garment.garmentInfo.photos}
                      annotations={garment.garmentInfo.annotations}
                      alterationsDescription={garment.garmentInfo.alterationsDescription}
                      onPhotosChange={(photos) => handleGarmentChange(index, { photos })}
                      onAnnotationsChange={(photoIndex, annotations) => {
                        const updatedAnnotations = {
                          ...garment.garmentInfo.annotations,
                          [photoIndex]: annotations
                        };
                        handleGarmentChange(index, { annotations: updatedAnnotations });
                      }}
                      onAlterationsDescriptionChange={(description) => 
                        handleGarmentChange(index, { alterationsDescription: description })
                      }
                    />
                  </div>

                  {/* Measurements */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Measurements</h5>
                    <MeasurementInput
                      measurements={garment.measurements}
                      onChange={(measurements) => handleMeasurementsChange(index, measurements)}
                    />
                  </div>

                  {/* Custom Design Form - Only show if type is Custom */}
                  {garment.garmentInfo.type === 'Custom' && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Custom Design Details</h5>
                      <CustomDesignForm
                        designInfo={garment.garmentInfo.designInfo || emptyDesignInfo}
                        onChange={(designInfo) => handleGarmentChange(index, { designInfo })}
                      />
                    </div>
                  )}

                  {/* Bridal Form - Only show if type is Wedding Dress */}
                  {garment.garmentInfo.type === 'Wedding Dress' && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Bridal Details</h5>
                      <BridalForm
                        bridalInfo={garment.garmentInfo.bridalInfo || emptyBridalInfo}
                        onChange={(bridalInfo) => handleGarmentChange(index, { bridalInfo })}
                      />
                    </div>
                  )}

                  {/* Accessories */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Accessories</h5>
                    
                    {/* Hanger */}
                    <div className="bg-white rounded-lg p-4 border mb-4">
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={garment.accessories.hanger.included}
                          onChange={(e) => handleAccessoryChange(index, {
                            hanger: {
                              ...garment.accessories.hanger,
                              included: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Hanger Included</span>
                      </label>
                      {garment.accessories.hanger.included && (
                        <textarea
                          value={garment.accessories.hanger.description}
                          onChange={(e) => handleAccessoryChange(index, {
                            hanger: {
                              ...garment.accessories.hanger,
                              description: e.target.value
                            }
                          })}
                          placeholder="Describe the hanger..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>

                    {/* Bag */}
                    <div className="bg-white rounded-lg p-4 border mb-4">
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={garment.accessories.bag.included}
                          onChange={(e) => handleAccessoryChange(index, {
                            bag: {
                              ...garment.accessories.bag,
                              included: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Bag Included</span>
                      </label>
                      {garment.accessories.bag.included && (
                        <textarea
                          value={garment.accessories.bag.description}
                          onChange={(e) => handleAccessoryChange(index, {
                            bag: {
                              ...garment.accessories.bag,
                              description: e.target.value
                            }
                          })}
                          placeholder="Describe the bag..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>

                    {/* Other Accessories */}
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={garment.accessories.belt}
                          onChange={(e) => handleAccessoryChange(index, { belt: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Belt</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={garment.accessories.clips}
                          onChange={(e) => handleAccessoryChange(index, { clips: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Clips</span>
                      </label>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Other</label>
                        <input
                          type="text"
                          value={garment.accessories.other}
                          onChange={(e) => handleAccessoryChange(index, { other: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="List any other accessories..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-base font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Order...
                </>
              ) : (
                'Create Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderModal;