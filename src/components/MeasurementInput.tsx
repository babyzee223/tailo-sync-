import React from 'react';
import { Plus, Trash2, Ruler, ChevronDown } from 'lucide-react';
import type { Measurement } from '../types';

type Props = {
  measurements: Measurement[];
  onChange: (measurements: Measurement[]) => void;
};

const commonMeasurements = [
  { name: 'Bust', unit: 'inches' },
  { name: 'Waist', unit: 'inches' },
  { name: 'Hip', unit: 'inches' },
  { name: 'Shoulder', unit: 'inches' },
  { name: 'Sleeve Length', unit: 'inches' },
  { name: 'Inseam', unit: 'inches' },
  { name: 'Length', unit: 'inches' },
  { name: 'Neck', unit: 'inches' },
  { name: 'Chest', unit: 'inches' },
  { name: 'Back Width', unit: 'inches' },
  { name: 'Armhole', unit: 'inches' },
  { name: 'Bicep', unit: 'inches' },
  { name: 'Wrist', unit: 'inches' },
  { name: 'Rise', unit: 'inches' },
  { name: 'Thigh', unit: 'inches' },
  { name: 'Knee', unit: 'inches' },
  { name: 'Ankle', unit: 'inches' },
];

const MeasurementInput: React.FC<Props> = ({ measurements, onChange }) => {
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);

  const handleAddMeasurement = (name?: string, unit: 'inches' | 'cm' = 'inches') => {
    const newMeasurement: Measurement = {
      name: name || '',
      value: 0,
      unit,
      date: new Date().toISOString().split('T')[0],
      type: 'before'
    };
    onChange([...measurements, newMeasurement]);
  };

  const handleRemoveMeasurement = (index: number) => {
    const newMeasurements = measurements.filter((_, i) => i !== index);
    onChange(newMeasurements);
  };

  const handleMeasurementChange = (index: number, updates: Partial<Measurement>) => {
    const newMeasurements = measurements.map((measurement, i) => 
      i === index ? { ...measurement, ...updates } : measurement
    );
    onChange(newMeasurements);
  };

  const existingMeasurements = new Set(measurements.map(m => m.name));
  const availableQuickAdd = commonMeasurements.filter(m => !existingMeasurements.has(m.name));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Ruler className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Measurements</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              Quick Add
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            
            {showQuickAdd && availableQuickAdd.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {availableQuickAdd.map((measurement) => (
                  <button
                    key={measurement.name}
                    onClick={() => {
                      handleAddMeasurement(measurement.name, measurement.unit);
                      setShowQuickAdd(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {measurement.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => handleAddMeasurement()}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Custom
          </button>
        </div>
      </div>

      {measurements.length > 0 ? (
        <div className="space-y-4">
          {measurements.map((measurement, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Measurement
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list={`measurements-${index}`}
                      value={measurement.name}
                      onChange={(e) => handleMeasurementChange(index, { name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bust, Waist"
                    />
                    <datalist id={`measurements-${index}`}>
                      {commonMeasurements.map(({ name }) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={measurement.value}
                    onChange={(e) => handleMeasurementChange(index, { value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={measurement.unit}
                    onChange={(e) => handleMeasurementChange(index, { unit: e.target.value as 'inches' | 'cm' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="inches">inches</option>
                    <option value="cm">cm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={measurement.type}
                    onChange={(e) => handleMeasurementChange(index, { type: e.target.value as 'before' | 'after' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={measurement.date}
                    onChange={(e) => handleMeasurementChange(index, { date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveMeasurement(index)}
                    className="text-red-500 hover:text-red-700 p-2 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={measurement.notes || ''}
                  onChange={(e) => handleMeasurementChange(index, { notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes about this measurement"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Ruler className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No measurements added yet</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleAddMeasurement()}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Custom
            </button>
            <button
              type="button"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              Quick Add
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementInput;