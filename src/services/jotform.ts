import axios from 'axios';
import type { Order, ClientInfo, GarmentInfo, Accessories } from '../types';

const JOTFORM_API_BASE = 'https://api.jotform.com';
let apiKey: string | null = null;

export const initJotform = (key: string) => {
  apiKey = key;
};

export type JotFormSubmission = {
  id: string;
  form_id: string;
  created_at: string;
  status: string;
  answers: Record<string, {
    name: string;
    answer: string | string[];
    type: string;
  }>;
};

export const getLatestSubmissions = async (): Promise<JotFormSubmission[]> => {
  if (!apiKey) {
    console.warn('JotForm API key not initialized');
    return [];
  }

  try {
    const response = await axios.get(`${JOTFORM_API_BASE}/user/submissions`, {
      params: {
        apiKey,
        limit: 100,
        orderby: 'created_at',
        direction: 'DESC',
        filter: {
          'status:ne': 'DELETED'
        }
      }
    });

    return Array.isArray(response.data.content) ? response.data.content : [];
  } catch (error) {
    console.error('Error fetching JotForm submissions:', error);
    return [];
  }
};

export const convertSubmissionToOrder = (submission: JotFormSubmission): Order => {
  const answers = submission.answers;
  
  // Extract client info
  const clientInfo: ClientInfo = {
    name: getAnswerByType(answers, 'fullName') || getAnswerByType(answers, 'name') || '',
    email: getAnswerByType(answers, 'email') || '',
    phone: getAnswerByType(answers, 'phone') || '',
  };

  // Extract garment info
  const garmentType = getAnswerByType(answers, 'garmentType') || 'Not specified';
  const garmentBrand = getAnswerByType(answers, 'brand') || '';
  const garmentColor = getAnswerByType(answers, 'color') || '';
  const alterationDetails = getAnswerByType(answers, 'alterationDetails') || '';
  
  const garmentInfo: GarmentInfo = {
    type: garmentType,
    brand: garmentBrand,
    color: garmentColor,
    quantity: 1,
    photos: [],
    notes: alterationDetails,
    annotations: {},
    notionsToFix: {
      buttons: false,
      zippers: false,
      other: '',
    },
  };

  // Default accessories
  const accessories: Accessories = {
    hanger: { included: false, description: '' },
    bag: { included: false, description: '' },
    belt: false,
    clips: false,
    other: '',
  };

  // Create the order
  const order: Order = {
    id: submission.id,
    clientInfo,
    garments: [{
      garmentInfo,
      accessories,
      measurements: []
    }],
    paymentInfo: {
      totalAmount: 0, // Set default or extract from form
      depositAmount: 0,
      paymentMethod: 'cash'
    },
    description: alterationDetails,
    status: 'pending',
    dueDate: calculateDueDate(7), // Default to 7 days from now
    createdAt: submission.created_at,
    updatedAt: submission.created_at,
    timeline: [{
      id: '1',
      type: 'status_change',
      timestamp: new Date().toISOString(),
      description: 'Order created from JotForm submission'
    }]
  };

  return order;
};

// Helper functions
function getAnswerByType(answers: JotFormSubmission['answers'], type: string): string {
  const answer = Object.values(answers).find(a => 
    a.name.toLowerCase().includes(type.toLowerCase()) ||
    a.type.toLowerCase().includes(type.toLowerCase())
  );
  return answer ? String(answer.answer) : '';
}

function calculateDueDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}