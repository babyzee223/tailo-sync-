import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { 
  Ruler, 
  Scissors, 
  DollarSign, 
  Image as ImageIcon, 
  PenTool, 
  Video, 
  Trophy,
  Search,
  Info,
  ArrowRight,
  Shirt,
  Trash2
} from 'lucide-react';

type FabricCare = {
  fabric: string;
  washing: string;
  drying: string;
  ironing: string;
  notes: string;
};

type Measurement = {
  name: string;
  value: number;
  unit: 'inches' | 'cm';
};

type AlterationEstimate = {
  garmentType: string;
  alterationType: string;
  complexity: 'simple' | 'medium' | 'complex';
  basePrice: number;
};

function Tools() {
  // Fabric Care Guide State
  const [fabricType, setFabricType] = useState('');
  const [careInstructions, setCareInstructions] = useState<FabricCare | null>(null);

  // Custom Fit Calculator State
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedGarment, setSelectedGarment] = useState('');

  // Cost Estimator State
  const [estimateDetails, setEstimateDetails] = useState({
    garmentType: '',
    alterationType: '',
    complexity: 'simple' as const
  });
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  // Before/After Photo State
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  // Fabric Care Guide Data
  const fabricCareGuide: Record<string, FabricCare> = {
    'silk': {
      fabric: 'Silk',
      washing: 'Dry clean only or hand wash in cold water',
      drying: 'Lay flat to dry away from direct sunlight',
      ironing: 'Iron on low heat with pressing cloth',
      notes: 'Never use bleach or harsh detergents'
    },
    'cotton': {
      fabric: 'Cotton',
      washing: 'Machine wash in warm water',
      drying: 'Tumble dry on medium',
      ironing: 'Iron on medium to high heat',
      notes: 'Pre-wash to prevent shrinkage'
    },
    'wool': {
      fabric: 'Wool',
      washing: 'Dry clean or hand wash in cold water',
      drying: 'Lay flat to dry',
      ironing: 'Steam or press with damp cloth',
      notes: 'Avoid hanging when wet'
    },
    'polyester': {
      fabric: 'Polyester',
      washing: 'Machine wash in warm water',
      drying: 'Tumble dry on low',
      ironing: 'Iron on low heat if needed',
      notes: 'Resistant to wrinkles and shrinkage'
    },
    'linen': {
      fabric: 'Linen',
      washing: 'Machine wash in warm water',
      drying: 'Tumble dry on low or line dry',
      ironing: 'Iron while damp on high heat',
      notes: 'Will soften with washing'
    }
  };

  // Alteration Cost Base Prices
  const alterationPrices: Record<string, AlterationEstimate[]> = {
    'dress': [
      { garmentType: 'dress', alterationType: 'hem', complexity: 'simple', basePrice: 20 },
      { garmentType: 'dress', alterationType: 'take-in', complexity: 'medium', basePrice: 35 },
      { garmentType: 'dress', alterationType: 'zipper', complexity: 'medium', basePrice: 25 }
    ],
    'pants': [
      { garmentType: 'pants', alterationType: 'hem', complexity: 'simple', basePrice: 15 },
      { garmentType: 'pants', alterationType: 'waist', complexity: 'medium', basePrice: 25 },
      { garmentType: 'pants', alterationType: 'taper', complexity: 'complex', basePrice: 35 }
    ],
    'shirt': [
      { garmentType: 'shirt', alterationType: 'shorten-sleeves', complexity: 'simple', basePrice: 20 },
      { garmentType: 'shirt', alterationType: 'take-in-sides', complexity: 'medium', basePrice: 30 },
      { garmentType: 'shirt', alterationType: 'adjust-collar', complexity: 'complex', basePrice: 25 }
    ]
  };

  // Handle fabric care guide search
  const handleFabricSearch = (fabric: string) => {
    const normalizedFabric = fabric.toLowerCase();
    const care = fabricCareGuide[normalizedFabric];
    setCareInstructions(care || null);
  };

  // Handle measurement updates
  const handleAddMeasurement = () => {
    setMeasurements([
      ...measurements,
      { name: '', value: 0, unit: 'inches' }
    ]);
  };

  const handleMeasurementChange = (index: number, updates: Partial<Measurement>) => {
    const updatedMeasurements = measurements.map((m, i) => {
      if (i !== index) return m;
      
      // Handle numeric value specifically
      if ('value' in updates) {
        const numValue = parseFloat(updates.value as any);
        return {
          ...m,
          ...updates,
          value: isNaN(numValue) ? 0 : numValue
        };
      }
      
      return { ...m, ...updates };
    });
    setMeasurements(updatedMeasurements);
  };

  const handleRemoveMeasurement = (index: number) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  // Handle cost estimation
  const calculateEstimate = () => {
    const { garmentType, alterationType, complexity } = estimateDetails;
    const estimate = alterationPrices[garmentType]?.find(
      e => e.alterationType === alterationType
    );

    if (!estimate) {
      setEstimatedCost(null);
      return;
    }

    let multiplier = 1;
    switch (complexity) {
      case 'medium':
        multiplier = 1.5;
        break;
      case 'complex':
        multiplier = 2;
        break;
    }

    setEstimatedCost(estimate.basePrice * multiplier);
  };

  // Handle image upload
  const handleImageUpload = (type: 'before' | 'after', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'before') {
        setBeforeImage(e.target?.result as string);
      } else {
        setAfterImage(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Quick Tools</h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Fabric Care Guide */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Shirt className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium">Fabric Care Guide</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFabricSearch(fabricType)}
                  placeholder="Enter fabric type (e.g., silk, cotton)"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>

              <button
                onClick={() => handleFabricSearch(fabricType)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Get Care Instructions
              </button>

              {careInstructions && (
                <div className="mt-4 space-y-3 bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900">{careInstructions.fabric} Care Instructions</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>Washing:</strong> {careInstructions.washing}</p>
                    <p><strong>Drying:</strong> {careInstructions.drying}</p>
                    <p><strong>Ironing:</strong> {careInstructions.ironing}</p>
                    <p><strong>Notes:</strong> {careInstructions.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Fit Calculator */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Ruler className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-medium">Custom Fit Calculator</h2>
            </div>

            <div className="space-y-4">
              <select
                value={selectedGarment}
                onChange={(e) => setSelectedGarment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Garment Type</option>
                <option value="dress">Dress</option>
                <option value="shirt">Shirt</option>
                <option value="pants">Pants</option>
                <option value="skirt">Skirt</option>
              </select>

              <div className="space-y-3">
                {measurements.map((measurement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={measurement.name}
                      onChange={(e) => handleMeasurementChange(index, { name: e.target.value })}
                      placeholder="Measurement name"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      value={measurement.value}
                      onChange={(e) => handleMeasurementChange(index, { value: parseFloat(e.target.value) })}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={measurement.unit}
                      onChange={(e) => handleMeasurementChange(index, { unit: e.target.value as 'inches' | 'cm' })}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="inches">in</option>
                      <option value="cm">cm</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMeasurement(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddMeasurement}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Add Measurement
              </button>

              {measurements.length > 0 && selectedGarment && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">Fit Recommendations</h3>
                  <div className="space-y-2 text-sm text-purple-800">
                    <p>Based on your measurements for a {selectedGarment}:</p>
                    <ul className="list-disc list-inside">
                      <li>Consider taking in the waist by 1-2 inches</li>
                      <li>Hem length should be adjusted to maintain proportion</li>
                      <li>Check shoulder fit for proper alignment</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cost Estimator */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-medium">Cost Estimator</h2>
            </div>

            <div className="space-y-4">
              <select
                value={estimateDetails.garmentType}
                onChange={(e) => setEstimateDetails({ ...estimateDetails, garmentType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Garment Type</option>
                <option value="dress">Dress</option>
                <option value="pants">Pants</option>
                <option value="shirt">Shirt</option>
              </select>

              {estimateDetails.garmentType && (
                <select
                  value={estimateDetails.alterationType}
                  onChange={(e) => setEstimateDetails({ ...estimateDetails, alterationType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Alteration Type</option>
                  {alterationPrices[estimateDetails.garmentType]?.map(({ alterationType }) => (
                    <option key={alterationType} value={alterationType}>
                      {alterationType.split('-').join(' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={estimateDetails.complexity}
                onChange={(e) => setEstimateDetails({ 
                  ...estimateDetails, 
                  complexity: e.target.value as 'simple' | 'medium' | 'complex'
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>

              <button
                onClick={calculateEstimate}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Calculate Estimate
              </button>

              {estimatedCost !== null && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900">Estimated Cost</h3>
                  <p className="text-2xl font-bold text-green-700">${estimatedCost.toFixed(2)}</p>
                  <p className="text-sm text-green-600 mt-1">
                    This is an estimate. Final cost may vary based on specific requirements.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Before/After Photo Comparison */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <ImageIcon className="w-5 h-5 text-amber-600 mr-2" />
              <h2 className="text-lg font-medium">Before/After Comparison</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="file"
                    ref={beforeInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('before', file);
                    }}
                  />
                  <div
                    onClick={() => beforeInputRef.current?.click()}
                    className={`
                      h-48 rounded-lg border-2 border-dashed cursor-pointer
                      flex items-center justify-center
                      ${beforeImage ? 'border-transparent' : 'border-gray-300 hover:border-amber-500'}
                    `}
                  >
                    {beforeImage ? (
                      <img
                        src={beforeImage}
                        alt="Before"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Upload Before Photo</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    ref={afterInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('after', file);
                    }}
                  />
                  <div
                    onClick={() => afterInputRef.current?.click()}
                    className={`
                      h-48 rounded-lg border-2 border-dashed cursor-pointer
                      flex items-center justify-center
                      ${afterImage ? 'border-transparent' : 'border-gray-300 hover:border-amber-500'}
                    `}
                  >
                    {afterImage ? (
                      <img
                        src={afterImage}
                        alt="After"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Upload After Photo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(beforeImage || afterImage) && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setBeforeImage(null);
                      setAfterImage(null);
                      if (beforeInputRef.current) beforeInputRef.current.value = '';
                      if (afterInputRef.current) afterInputRef.current.value = '';
                    }}
                    className="px-4 py-2 text-red-600 hover:text-red-700"
                  >
                    Clear Photos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Tools;