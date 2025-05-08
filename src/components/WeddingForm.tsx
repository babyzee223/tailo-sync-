import React, { useState } from 'react';
import { Calendar, DollarSign, Users, MapPin, Clock, Plus, Trash2 } from 'lucide-react';
import type { WeddingFormData, WeddingPartyMember } from '../types';

type Props = {
  formData: WeddingFormData;
  onChange: (data: WeddingFormData) => void;
};

const WeddingForm: React.FC<Props> = ({ formData, onChange }) => {
  const [showPartyMember, setShowPartyMember] = useState(false);
  const [newMember, setNewMember] = useState<WeddingPartyMember>({
    name: '',
    role: '',
    measurements: {},
    dress_preferences: ''
  });

  const addPartyMember = () => {
    if (!newMember.name || !newMember.role) return;

    const updatedParty = [
      ...(formData.wedding_party_measurements || []),
      newMember
    ];

    onChange({
      ...formData,
      wedding_party_measurements: updatedParty,
      wedding_party_size: updatedParty.length
    });

    setNewMember({
      name: '',
      role: '',
      measurements: {},
      dress_preferences: ''
    });
    setShowPartyMember(false);
  };

  const removePartyMember = (index: number) => {
    const updatedParty = formData.wedding_party_measurements?.filter((_, i) => i !== index);
    onChange({
      ...formData,
      wedding_party_measurements: updatedParty,
      wedding_party_size: updatedParty?.length || 0
    });
  };

  return (
    <div className="space-y-6 bg-purple-50 rounded-lg p-6 border border-purple-100">
      <h3 className="text-lg font-medium text-purple-900">Wedding Details</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Wedding Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-purple-400 w-5 h-5" />
            <input
              type="date"
              required
              value={formData.wedding_date || ''}
              onChange={(e) => onChange({ ...formData, wedding_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Alterations Deadline <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 text-purple-400 w-5 h-5" />
            <input
              type="date"
              required
              value={formData.alterations_deadline || ''}
              onChange={(e) => onChange({ ...formData, alterations_deadline: e.target.value })}
              max={formData.wedding_date}
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Venue
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 text-purple-400 w-5 h-5" />
            <input
              type="text"
              value={formData.venue || ''}
              onChange={(e) => onChange({ ...formData, venue: e.target.value })}
              placeholder="Wedding venue"
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Dress Budget
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 text-purple-400 w-5 h-5" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.dress_budget || ''}
              onChange={(e) => onChange({ ...formData, dress_budget: parseFloat(e.target.value) })}
              placeholder="Budget for dress"
              className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Wedding Party Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-purple-900 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Wedding Party Members
          </h4>
          <button
            type="button"
            onClick={() => setShowPartyMember(true)}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Member
          </button>
        </div>

        {showPartyMember && (
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Name"
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                placeholder="Role (e.g., Bridesmaid)"
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={newMember.measurements?.bust || ''}
                onChange={(e) => setNewMember({
                  ...newMember,
                  measurements: {
                    ...newMember.measurements,
                    bust: parseFloat(e.target.value)
                  }
                })}
                placeholder="Bust measurement"
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                value={newMember.measurements?.waist || ''}
                onChange={(e) => setNewMember({
                  ...newMember,
                  measurements: {
                    ...newMember.measurements,
                    waist: parseFloat(e.target.value)
                  }
                })}
                placeholder="Waist measurement"
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <textarea
              value={newMember.dress_preferences || ''}
              onChange={(e) => setNewMember({ ...newMember, dress_preferences: e.target.value })}
              placeholder="Dress preferences or notes"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowPartyMember(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addPartyMember}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Member
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {formData.wedding_party_measurements?.map((member, index) => (
            <div key={index} className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-900">{member.name}</h5>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removePartyMember(index)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {member.measurements && Object.keys(member.measurements).length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Measurements: {
                    Object.entries(member.measurements)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')
                  }</p>
                </div>
              )}
              {member.dress_preferences && (
                <p className="mt-1 text-sm text-gray-600">
                  Preferences: {member.dress_preferences}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-purple-900 mb-1">
          Special Requirements or Notes
        </label>
        <textarea
          value={formData.special_requirements || ''}
          onChange={(e) => onChange({ ...formData, special_requirements: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Any special requirements, cultural considerations, or additional notes..."
        />
      </div>
    </div>
  );
};

export default WeddingForm;