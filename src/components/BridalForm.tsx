import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Scissors } from 'lucide-react';
import type { BridalInfo, FittingSession, BustleInfo } from '../types';

type Props = {
  bridalInfo: BridalInfo;
  onChange: (info: BridalInfo) => void;
};

const bustleTypes = [
  'American',
  'French',
  'Austrian',
  'English',
  'Royal',
  'Ballroom',
  'Custom'
] as const;

const fittingTypes = [
  'Initial',
  'Muslin',
  'Construction',
  'Final',
  'Bustle',
  'Custom'
] as const;

const BridalForm: React.FC<Props> = ({ bridalInfo, onChange }) => {
  const addFittingSession = () => {
    const newSession: FittingSession = {
      id: Date.now().toString(),
      date: '',
      type: 'Initial',
      notes: '',
      completed: false
    };
    
    onChange({
      ...bridalInfo,
      fittingSessions: [...bridalInfo.fittingSessions, newSession]
    });
  };

  const updateFittingSession = (id: string, updates: Partial<FittingSession>) => {
    onChange({
      ...bridalInfo,
      fittingSessions: bridalInfo.fittingSessions.map(session =>
        session.id === id ? { ...session, ...updates } : session
      )
    });
  };

  const removeFittingSession = (id: string) => {
    onChange({
      ...bridalInfo,
      fittingSessions: bridalInfo.fittingSessions.filter(session => session.id !== id)
    });
  };

  const updateBustleInfo = (updates: Partial<BustleInfo>) => {
    onChange({
      ...bridalInfo,
      bustleInfo: {
        ...bridalInfo.bustleInfo,
        ...updates
      } as BustleInfo
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-medium text-purple-900 mb-4">Bridal Details</h3>
        
        {/* Wedding Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Wedding Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-purple-400 w-5 h-5" />
            <input
              type="date"
              value={bridalInfo.weddingDate}
              onChange={(e) => onChange({ ...bridalInfo, weddingDate: e.target.value })}
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Venue */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Venue
          </label>
          <input
            type="text"
            value={bridalInfo.venue || ''}
            onChange={(e) => onChange({ ...bridalInfo, venue: e.target.value })}
            placeholder="Wedding venue name and location"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Bustle Information */}
        <div className="mb-6">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={bridalInfo.bustleInfo?.needed || false}
              onChange={(e) => updateBustleInfo({ needed: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-purple-900">Bustle Required</span>
          </label>

          {bridalInfo.bustleInfo?.needed && (
            <div className="ml-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Bustle Type
                  </label>
                  <select
                    value={bridalInfo.bustleInfo.type}
                    onChange={(e) => updateBustleInfo({ type: e.target.value as BustleInfo['type'] })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {bustleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {bridalInfo.bustleInfo.type === 'Custom' && (
                  <div>
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Custom Type Description
                    </label>
                    <input
                      type="text"
                      value={bridalInfo.bustleInfo.customType || ''}
                      onChange={(e) => updateBustleInfo({ customType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Number of Bustle Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bridalInfo.bustleInfo.points || 0}
                    onChange={(e) => updateBustleInfo({ points: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Bustle Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={bridalInfo.bustleInfo.cost || 0}
                      onChange={(e) => updateBustleInfo({ cost: parseFloat(e.target.value) })}
                      className="pl-8 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Bustle Notes
                </label>
                <textarea
                  value={bridalInfo.bustleInfo.notes || ''}
                  onChange={(e) => updateBustleInfo({ notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Any special instructions or notes about the bustle..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Fitting Sessions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-purple-900">Fitting Sessions</h4>
            <button
              type="button"
              onClick={addFittingSession}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Fitting
            </button>
          </div>

          <div className="space-y-4">
            {bridalInfo.fittingSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={session.completed}
                      onChange={(e) => updateFittingSession(session.id, { completed: e.target.checked })}
                      className="mr-2"
                    />
                    <h5 className="text-sm font-medium text-purple-900">
                      {session.type} Fitting
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFittingSession(session.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Date
                    </label>
                    <input
                      type="datetime-local"
                      value={session.date}
                      onChange={(e) => updateFittingSession(session.id, { date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Type
                    </label>
                    <select
                      value={session.type}
                      onChange={(e) => updateFittingSession(session.id, { type: e.target.value as FittingSession['type'] })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {fittingTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {session.type === 'Custom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Custom Fitting Type
                    </label>
                    <input
                      type="text"
                      value={session.customType || ''}
                      onChange={(e) => updateFittingSession(session.id, { customType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe the custom fitting type..."
                    />
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={session.notes}
                    onChange={(e) => updateFittingSession(session.id, { notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Any notes about this fitting session..."
                  />
                </div>
              </div>
            ))}

            {bridalInfo.fittingSessions.length === 0 && (
              <div className="text-center py-8 bg-purple-25 rounded-lg border border-purple-100">
                <Scissors className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-600">No fitting sessions scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Bridal Party */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-purple-900 mb-4">Bridal Party</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">
                Maid of Honor
              </label>
              <input
                type="text"
                value={bridalInfo.bridalParty?.maidOfHonor || ''}
                onChange={(e) => onChange({
                  ...bridalInfo,
                  bridalParty: {
                    ...bridalInfo.bridalParty,
                    maidOfHonor: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Name of Maid of Honor"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">
                Bridesmaids
              </label>
              <textarea
                value={bridalInfo.bridalParty?.bridesmaids?.join('\n') || ''}
                onChange={(e) => onChange({
                  ...bridalInfo,
                  bridalParty: {
                    ...bridalInfo.bridalParty,
                    bridesmaids: e.target.value.split('\n').filter(name => name.trim() !== '')
                  }
                })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter each bridesmaid's name on a new line"
              />
            </div>
          </div>
        </div>

        {/* Preservation Service */}
        <div className="mt-6">
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={bridalInfo.preservationService?.needed || false}
              onChange={(e) => onChange({
                ...bridalInfo,
                preservationService: {
                  ...bridalInfo.preservationService,
                  needed: e.target.checked
                }
              })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-purple-900">Include Gown Preservation Service</span>
          </label>

          {bridalInfo.preservationService?.needed && (
            <div className="ml-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Preservation Type
                </label>
                <select
                  value={bridalInfo.preservationService.type || 'Basic'}
                  onChange={(e) => onChange({
                    ...bridalInfo,
                    preservationService: {
                      ...bridalInfo.preservationService,
                      type: e.target.value as 'Basic' | 'Premium' | 'Custom'
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Preservation Cost
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bridalInfo.preservationService.cost || 0}
                    onChange={(e) => onChange({
                      ...bridalInfo,
                      preservationService: {
                        ...bridalInfo.preservationService,
                        cost: parseFloat(e.target.value)
                      }
                    })}
                    className="pl-8 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Veil Information */}
        <div className="mt-6">
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={bridalInfo.veil?.included || false}
              onChange={(e) => onChange({
                ...bridalInfo,
                veil: {
                  ...bridalInfo.veil,
                  included: e.target.checked
                }
              })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-purple-900">Include Veil</span>
          </label>

          {bridalInfo.veil?.included && (
            <div className="ml-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Veil Type
                  </label>
                  <input
                    type="text"
                    value={bridalInfo.veil.type || ''}
                    onChange={(e) => onChange({
                      ...bridalInfo,
                      veil: {
                        ...bridalInfo.veil,
                        type: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Cathedral, Fingertip, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Veil Length
                  </label>
                  <input
                    type="text"
                    value={bridalInfo.veil.length || ''}
                    onChange={(e) => onChange({
                      ...bridalInfo,
                      veil: {
                        ...bridalInfo.veil,
                        length: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 90 inches"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Veil Alterations Needed
                </label>
                <textarea
                  value={bridalInfo.veil.alterationsNeeded || ''}
                  onChange={(e) => onChange({
                    ...bridalInfo,
                    veil: {
                      ...bridalInfo.veil,
                      alterationsNeeded: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe any alterations needed for the veil..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Accessories */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-purple-900 mb-4">Accessories</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bridalInfo.accessories?.belt || false}
                onChange={(e) => onChange({
                  ...bridalInfo,
                  accessories: {
                    ...bridalInfo.accessories,
                    belt: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-purple-900">Belt/Sash</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bridalInfo.accessories?.headpiece || false}
                onChange={(e) => onChange({
                  ...bridalInfo,
                  accessories: {
                    ...bridalInfo.accessories,
                    headpiece: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-purple-900">Headpiece</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">
                Other Accessories
              </label>
              <input
                type="text"
                value={bridalInfo.accessories?.other || ''}
                onChange={(e) => onChange({
                  ...bridalInfo,
                  accessories: {
                    ...bridalInfo.accessories,
                    other: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="List any other accessories..."
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Additional Notes
          </label>
          <textarea
            value={bridalInfo.notes}
            onChange={(e) => onChange({
              ...bridalInfo,
              notes: e.target.value
            })}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Any additional notes about the bridal order..."
          />
        </div>
      </div>
    </div>
  );
};

export default BridalForm;