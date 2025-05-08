import React from 'react';
import { Scissors, Calendar } from 'lucide-react';

type Props = {
  garmentDescription: string;
  garmentQuantity: number;
  garmentType: string;
  onChange: (updates: { 
    garmentDescription?: string; 
    garmentQuantity?: number;
    garmentType?: string;
    wedding_date?: string;
  }) => void;
};

const GarmentForm: React.FC<Props> = ({ 
  garmentDescription = '', 
  garmentQuantity = 1,
  garmentType = '',
  onChange 
}) => {
  const isWeddingDress = garmentType.toLowerCase() === 'wedding dress';

  return (
    <div className="space-y-6 bg-blue-50 rounded-lg p-6 border border-blue-100">
      <div className="flex items-center">
        <Scissors className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-blue-900">Garment Details</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Garment Type <span className="text-red-500">*</span>
          </label>
          <select
            value={garmentType}
            onChange={(e) => onChange({ garmentType: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type</option>
            <option value="Wedding Dress">Wedding Dress</option>
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
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={garmentQuantity}
            onChange={(e) => onChange({ garmentQuantity: parseInt(e.target.value) })}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isWeddingDress && (
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">
            Wedding Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-blue-400 w-5 h-5" />
            <input
              type="date"
              required
              onChange={(e) => onChange({ wedding_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={garmentDescription}
          onChange={(e) => onChange({ garmentDescription: e.target.value })}
          required
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the garment and alterations needed..."
        />
      </div>
    </div>
  );
};

export default GarmentForm;