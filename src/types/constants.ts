import type { DesignInfo, BridalInfo, BustleInfo } from './index';

export const emptyDesignInfo: DesignInfo = {
  isCustomDesign: true,
  designCost: 0,
  fabricInfo: {
    entries: [{  // Initialize with one empty fabric entry
      type: '',
      color: '',
      quantity: 0,
      cost: 0,
      provided: false,
      notes: '',
      photos: []
    }]
  },
  notions: {
    buttons: {
      needed: false,
      quantity: 0,
      type: '',
      cost: 0,
      provided: false
    },
    zippers: {
      needed: false,
      quantity: 0,
      type: '',
      cost: 0,
      provided: false
    },
    other: '',
    totalCost: 0
  },
  notes: ''
};

export const emptyBridalInfo: BridalInfo = {
  weddingDate: '',
  bustleInfo: {
    needed: false,
    type: 'American',
    points: 0,
    cost: 0,
    notes: ''
  },
  fittingSessions: [],
  notes: ''
};