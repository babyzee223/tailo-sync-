import React, { useState, useEffect } from 'react';
import { X, Save, Archive, Camera, Upload, Plus } from 'lucide-react';
import type { Order, Photo, GarmentInfo } from '../types';
import PhotoAnnotator from './PhotoAnnotator';
import MeasurementInput from './MeasurementInput';
import CustomDesignForm from './CustomDesignForm';
import BridalForm from './BridalForm';

type Props = {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate?: (updatedOrder: Order) => void;
  onOrderDelete?: (order: Order) => void;
};

const OrderDetailsModal: React.FC<Props> = ({ order, isOpen, onClose, onOrderUpdate, onOrderDelete }) => {
  const [localOrder, setLocalOrder] = useState<Order>(order);
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'accessories' | 'measurements' | 'bridal' | 'custom'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGarmentIndex, setSelectedGarmentIndex] = useState(0);

  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  if (!isOpen) return null;

  const handleSaveChanges = () => {
    onOrderUpdate?.(localOrder);
    setIsEditing(false);
  };

  const handleArchive = () => {
    if (onOrderDelete) {
      onOrderDelete(order);
    }
  };

  const handleGarmentChange = (index: number, updates: Partial<GarmentInfo>) => {
    const updatedOrder = { ...localOrder };
    updatedOrder.garments[index].garmentInfo = {
      ...updatedOrder.garments[index].garmentInfo,
      ...updates
    };
    setLocalOrder(updatedOrder);
  };

  const handleClientInfoChange = (updates: Partial<typeof localOrder.clientInfo>) => {
    setLocalOrder({
      ...localOrder,
      clientInfo: {
        ...localOrder.clientInfo,
        ...updates
      }
    });
  };

  const handlePaymentInfoChange = (updates: Partial<typeof localOrder.paymentInfo>) => {
    setLocalOrder({
      ...localOrder,
      paymentInfo: {
        ...localOrder.paymentInfo,
        ...updates
      }
    });
  };

  const handleAccessoryChange = (garmentIndex: number, type: 'hanger' | 'bag', updates: { included?: boolean; description?: string }) => {
    const updatedOrder = { ...localOrder };
    const accessory = updatedOrder.garments[garmentIndex].accessories[type];
    updatedOrder.garments[garmentIndex].accessories[type] = {
      ...accessory,
      ...updates
    };
    setLocalOrder(updatedOrder);
  };

  const handleMeasurementsChange = (garmentIndex: number, measurements: any[]) => {
    const updatedOrder = { ...localOrder };
    updatedOrder.garments[garmentIndex].measurements = measurements;
    setLocalOrder(updatedOrder);
  };

  const handleBridalInfoChange = (garmentIndex: number, bridalInfo: any) => {
    const updatedOrder = { ...localOrder };
    if (updatedOrder.garments[garmentIndex].garmentInfo.bridalInfo) {
      updatedOrder.garments[garmentIndex].garmentInfo.bridalInfo = {
        ...updatedOrder.garments[garmentIndex].garmentInfo.bridalInfo,
        ...bridalInfo
      };
      setLocalOrder(updatedOrder);
    }
  };

  const handleDesignInfoChange = (garmentIndex: number, designInfo: any) => {
    const updatedOrder = { ...localOrder };
    if (updatedOrder.garments[garmentIndex].garmentInfo.designInfo) {
      updatedOrder.garments[garmentIndex].garmentInfo.designInfo = {
        ...updatedOrder.garments[garmentIndex].garmentInfo.designInfo,
        ...designInfo
      };
      setLocalOrder(updatedOrder);
    }
  };

  const selectedGarment = localOrder.garments[selectedGarmentIndex];
  const isBridalGarment = selectedGarment.garmentInfo.bridalInfo !== undefined;
  const isCustomDesign = selectedGarment.garmentInfo.designInfo !== undefined;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">Order #{localOrder.id}</p>
          </div>
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            ) : (
              <>
                {localOrder.status !== 'archived' && (
                  <button
                    onClick={handleArchive}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center"
                  >
                    <Archive className="w-5 h-5 mr-2" />
                    Archive
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100"
                >
                  Edit Order
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Garment Selector */}
        {localOrder.garments.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Garment
            </label>
            <select
              value={selectedGarmentIndex}
              onChange={(e) => setSelectedGarmentIndex(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {localOrder.garments.map((garment, index) => (
                <option key={index} value={index}>
                  {garment.garmentInfo.type}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto space-x-4 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'details'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'photos'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Photos & Notes
          </button>
          <button
            onClick={() => setActiveTab('accessories')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'accessories'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Accessories
          </button>
          <button
            onClick={() => setActiveTab('measurements')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'measurements'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Measurements
          </button>
          {isBridalGarment && (
            <button
              onClick={() => setActiveTab('bridal')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === 'bridal'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Bridal Details
            </button>
          )}
          {isCustomDesign && (
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === 'custom'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Custom Design
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={localOrder.clientInfo.name}
                      onChange={(e) => handleClientInfoChange({ name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={localOrder.clientInfo.phone}
                      onChange={(e) => handleClientInfoChange({ phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={localOrder.clientInfo.email}
                      onChange={(e) => handleClientInfoChange({ email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={localOrder.dueDate}
                      onChange={(e) => setLocalOrder({ ...localOrder, dueDate: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={localOrder.paymentInfo.totalAmount}
                      onChange={(e) => handlePaymentInfoChange({ totalAmount: parseFloat(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={localOrder.paymentInfo.depositAmount}
                      onChange={(e) => handlePaymentInfoChange({ depositAmount: parseFloat(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      value={localOrder.paymentInfo.paymentMethod}
                      onChange={(e) => handlePaymentInfoChange({ paymentMethod: e.target.value as any })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="venmo">Venmo</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Garment Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedGarment.garmentInfo.type} Details
                </h3>
                
                {/* Alterations Description Box */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alterations Description
                  </label>
                  <textarea
                    value={selectedGarment.garmentInfo.alterationsDescription || ''}
                    onChange={(e) => handleGarmentChange(selectedGarmentIndex, { alterationsDescription: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
                    placeholder="Enter detailed description of all alterations needed for this garment..."
                    disabled={!isEditing}
                  />
                </div>

                {/* Additional Garment Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={selectedGarment.garmentInfo.brand || ''}
                      onChange={(e) => handleGarmentChange(selectedGarmentIndex, { brand: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      value={selectedGarment.garmentInfo.color || ''}
                      onChange={(e) => handleGarmentChange(selectedGarmentIndex, { color: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <PhotoAnnotator
                photos={selectedGarment.garmentInfo.photos}
                annotations={selectedGarment.garmentInfo.annotations}
                alterationsDescription={selectedGarment.garmentInfo.alterationsDescription}
                onPhotosChange={(photos) => handleGarmentChange(selectedGarmentIndex, { photos })}
                onAnnotationsChange={(photoIndex, annotations) => {
                  const updatedAnnotations = {
                    ...selectedGarment.garmentInfo.annotations,
                    [photoIndex]: annotations
                  };
                  handleGarmentChange(selectedGarmentIndex, { annotations: updatedAnnotations });
                }}
                onNotesChange={(notes) => handleGarmentChange(selectedGarmentIndex, { notes })}
                onAlterationsDescriptionChange={(description) => 
                  handleGarmentChange(selectedGarmentIndex, { alterationsDescription: description })
                }
              />
            </div>
          )}

          {/* Accessories Tab */}
          {activeTab === 'accessories' && (
            <div className="space-y-6">
              {/* Hanger Section */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedGarment.accessories.hanger.included}
                      onChange={(e) => handleAccessoryChange(selectedGarmentIndex, 'hanger', { included: e.target.checked })}
                      disabled={!isEditing}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Hanger Included</span>
                  </label>
                </div>
                {selectedGarment.accessories.hanger.included && (
                  <div>
                    <textarea
                      value={selectedGarment.accessories.hanger.description}
                      onChange={(e) => handleAccessoryChange(selectedGarmentIndex, 'hanger', { description: e.target.value })}
                      placeholder="Describe the hanger (type, color, etc.)"
                      rows={2}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Bag Section */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedGarment.accessories.bag.included}
                      onChange={(e) => handleAccessoryChange(selectedGarmentIndex, 'bag', { included: e.target.checked })}
                      disabled={!isEditing}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Bag Included</span>
                  </label>
                </div>
                {selectedGarment.accessories.bag.included && (
                  <div>
                    <textarea
                      value={selectedGarment.accessories.bag.description}
                      onChange={(e) => handleAccessoryChange(selectedGarmentIndex, 'bag', { description: e.target.value })}
                      placeholder="Describe the bag (type, color, condition, etc.)"
                      rows={2}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Other Accessories */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Other Accessories</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedGarment.accessories.belt}
                      onChange={(e) => {
                        const updatedOrder = { ...localOrder };
                        updatedOrder.garments[selectedGarmentIndex].accessories.belt = e.target.checked;
                        setLocalOrder(updatedOrder);
                      }}
                      disabled={!isEditing}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Belt</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedGarment.accessories.clips}
                      onChange={(e) => {
                        const updatedOrder = { ...localOrder };
                        updatedOrder.garments[selectedGarmentIndex].accessories.clips = e.target.checked;
                        setLocalOrder(updatedOrder);
                      }}
                      disabled={!isEditing}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Clips</span>
                  </label>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Other</label>
                    <input
                      type="text"
                      value={selectedGarment.accessories.other}
                      onChange={(e) => {
                        const updatedOrder = { ...localOrder };
                        updatedOrder.garments[selectedGarmentIndex].accessories.other = e.target.value;
                        setLocalOrder(updatedOrder);
                      }}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="List any other accessories..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Measurements Tab */}
          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <MeasurementInput
                measurements={selectedGarment.measurements}
                onChange={(measurements) => handleMeasurementsChange(selectedGarmentIndex, measurements)}
              />
            </div>
          )}

          {/* Bridal Details Tab */}
          {activeTab === 'bridal' && selectedGarment.garmentInfo.bridalInfo && (
            <div className="space-y-4">
              <BridalForm
                bridalInfo={selectedGarment.garmentInfo.bridalInfo}
                onChange={(bridalInfo) => handleBridalInfoChange(selectedGarmentIndex, bridalInfo)}
              />
            </div>
          )}

          {/* Custom Design Tab */}
          {activeTab === 'custom' && selectedGarment.garmentInfo.designInfo && (
            <div className="space-y-4">
              <CustomDesignForm
                designInfo={selectedGarment.garmentInfo.designInfo}
                onChange={(designInfo) => handleDesignInfoChange(selectedGarmentIndex, designInfo)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;