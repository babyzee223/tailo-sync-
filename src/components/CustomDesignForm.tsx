import React, { useRef } from 'react';
import { DollarSign, Scissors, Camera, Upload, X, Plus, Trash2 } from 'lucide-react';
import type { DesignInfo, FabricEntry, NotionsEntry } from '../types';
import PhotoAnnotator from './PhotoAnnotator';

type Props = {
  designInfo: DesignInfo;
  onChange: (info: DesignInfo) => void;
};

const emptyFabricEntry: FabricEntry = {
  type: '',
  color: '',
  quantity: 0,
  cost: 0,
  provided: false,
  notes: '',
  photos: []
};

const CustomDesignForm: React.FC<Props> = ({ designInfo, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFabricAdd = () => {
    onChange({
      ...designInfo,
      fabricInfo: {
        entries: [...designInfo.fabricInfo.entries, { ...emptyFabricEntry }]
      }
    });
  };

  const handleFabricRemove = (index: number) => {
    onChange({
      ...designInfo,
      fabricInfo: {
        entries: designInfo.fabricInfo.entries.filter((_, i) => i !== index)
      }
    });
  };

  const handleFabricChange = (index: number, updates: Partial<FabricEntry>) => {
    const newEntries = [...designInfo.fabricInfo.entries];
    newEntries[index] = { ...newEntries[index], ...updates };
    onChange({
      ...designInfo,
      fabricInfo: { entries: newEntries }
    });
  };

  const handleNotionsChange = (type: 'buttons' | 'zippers', updates: Partial<NotionsEntry>) => {
    onChange({
      ...designInfo,
      notions: {
        ...designInfo.notions,
        [type]: { ...designInfo.notions[type], ...updates }
      }
    });
  };

  const handlePhotoCapture = (fabricIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = {
          url: event.target?.result as string,
          notes: '',
          annotations: []
        };
        const newEntries = [...designInfo.fabricInfo.entries];
        newEntries[fabricIndex] = {
          ...newEntries[fabricIndex],
          photos: [...(newEntries[fabricIndex].photos || []), newPhoto]
        };
        onChange({
          ...designInfo,
          fabricInfo: { entries: newEntries }
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Design Cost */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Design Cost
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="number"
            min="0"
            step="0.01"
            value={designInfo.designCost}
            onChange={(e) => onChange({ ...designInfo, designCost: parseFloat(e.target.value) || 0 })}
            className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Fabric Information */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Fabric Details</h4>
          <button
            type="button"
            onClick={handleFabricAdd}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Fabric
          </button>
        </div>

        {designInfo.fabricInfo.entries.map((fabric, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h5 className="font-medium text-gray-900">Fabric {index + 1}</h5>
              {designInfo.fabricInfo.entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleFabricRemove(index)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={fabric.provided}
                  onChange={(e) => handleFabricChange(index, { provided: e.target.checked })}
                  className="mr-2"
                />
                Customer Provided
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fabric Type
                </label>
                <input
                  type="text"
                  value={fabric.type}
                  onChange={(e) => handleFabricChange(index, { type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={fabric.color}
                  onChange={(e) => handleFabricChange(index, { color: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (yards)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={fabric.quantity}
                  onChange={(e) => handleFabricChange(index, { quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {!fabric.provided && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fabric Cost
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fabric.cost}
                      onChange={(e) => handleFabricChange(index, { cost: parseFloat(e.target.value) || 0 })}
                      className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={fabric.notes}
                onChange={(e) => handleFabricChange(index, { notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photos section for each fabric */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos
              </label>
              <div className="flex items-center space-x-4">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePhotoCapture(index, e)}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoCapture(index, e)}
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notions */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Notions</h4>
        
        {/* Buttons */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={designInfo.notions.buttons.needed}
              onChange={(e) => handleNotionsChange('buttons', { needed: e.target.checked })}
              className="mr-2"
            />
            Buttons
          </label>
          {designInfo.notions.buttons.needed && (
            <div className="ml-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={designInfo.notions.buttons.provided}
                  onChange={(e) => handleNotionsChange('buttons', { provided: e.target.checked })}
                  className="mr-2"
                />
                Customer Provided
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={designInfo.notions.buttons.quantity}
                    onChange={(e) => handleNotionsChange('buttons', { quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    value={designInfo.notions.buttons.type}
                    onChange={(e) => handleNotionsChange('buttons', { type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!designInfo.notions.buttons.provided && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={designInfo.notions.buttons.cost}
                        onChange={(e) => handleNotionsChange('buttons', { cost: parseFloat(e.target.value) || 0 })}
                        className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Zippers */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={designInfo.notions.zippers.needed}
              onChange={(e) => handleNotionsChange('zippers', { needed: e.target.checked })}
              className="mr-2"
            />
            Zippers
          </label>
          {designInfo.notions.zippers.needed && (
            <div className="ml-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={designInfo.notions.zippers.provided}
                  onChange={(e) => handleNotionsChange('zippers', { provided: e.target.checked })}
                  className="mr-2"
                />
                Customer Provided
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={designInfo.notions.zippers.quantity}
                    onChange={(e) => handleNotionsChange('zippers', { quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    value={designInfo.notions.zippers.type}
                    onChange={(e) => handleNotionsChange('zippers', { type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!designInfo.notions.zippers.provided && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={designInfo.notions.zippers.cost}
                        onChange={(e) => handleNotionsChange('zippers', { cost: parseFloat(e.target.value) || 0 })}
                        className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Other Notions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Notions
          </label>
          <textarea
            value={designInfo.notions.other}
            onChange={(e) => onChange({
              ...designInfo,
              notions: { ...designInfo.notions, other: e.target.value }
            })}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter any additional notions needed..."
          />
        </div>

        {/* Total Notions Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Notions Cost
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={designInfo.notions.totalCost}
              onChange={(e) => onChange({
                ...designInfo,
                notions: { ...designInfo.notions, totalCost: parseFloat(e.target.value) || 0 }
              })}
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Fitting Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fitting Date
        </label>
        <input
          type="datetime-local"
          value={designInfo.fittingDate || ''}
          onChange={(e) => onChange({ ...designInfo, fittingDate: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Design Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Design Notes
        </label>
        <textarea
          value={designInfo.notes}
          onChange={(e) => onChange({ ...designInfo, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter any additional design notes..."
        />
      </div>
    </div>
  );
};

export default CustomDesignForm;