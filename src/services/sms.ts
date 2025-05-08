import type { Order } from '../types';

// Use localStorage to store SMS history
const SMS_STORAGE_KEY = 'alteration_sms';

type StoredSMS = {
  id: string;
  to: string;
  content: string;
  timestamp: string;
  status: 'in-progress' | 'completed';
  deliveryStatus: 'sent' | 'delivered' | 'failed';
  deliveredAt?: string;
};

const templates = {
  inProgress: (order: Order): { message: string } => {
    if (order.isFittingUpdate) {
      const fittingSessions = order.garments
        .flatMap(g => g.garmentInfo.bridalInfo?.fittingSessions || [])
        .filter(session => !session.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (fittingSessions.length === 0) return { message: '' };

      const nextFitting = fittingSessions[0];
      const fittingDate = new Date(nextFitting.date).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });

      return {
        message: `Hi ${order.clientInfo.name}, your ${nextFitting.type} fitting is scheduled for ${fittingDate}. Please arrive 5-10 mins early and bring your shoes/accessories. Questions? Call us at (913) 777-1233!`
      };
    }

    const dueDate = new Date(order.dueDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    return {
      message: `Hi ${order.clientInfo.name}, we've started work on your ${order.garments.map(g => g.garmentInfo.type).join(' & ')}. Expected completion: ${dueDate}. We'll notify you when ready! Questions? Call (913) 777-1233.`
    };
  },
  
  completed: (order: Order): { message: string } => {
    const balance = order.paymentInfo.totalAmount - order.paymentInfo.depositAmount;
    const paymentInfo = balance > 0 
      ? `Remaining balance: $${balance.toFixed(2)}. We accept cards, Venmo & Zelle.` 
      : 'Your balance is paid in full.';

    return {
      message: `Hi ${order.clientInfo.name}, great news! Your ${order.garments.map(g => g.garmentInfo.type).join(' & ')} ${order.garments.length > 1 ? 'are' : 'is'} ready for pickup. ${paymentInfo} Visit us Mon-Sat 10am-6pm. Questions? Call (913) 777-1233!`
    };
  }
};

const getStoredSMS = (): StoredSMS[] => {
  try {
    const stored = localStorage.getItem(SMS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeSMS = (sms: StoredSMS) => {
  const messages = getStoredSMS();
  messages.unshift(sms);
  localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(messages));
};

export const sendStatusUpdateSMS = async (order: Order) => {
  try {
    const template = order.status === 'in-progress' 
      ? templates.inProgress(order)
      : templates.completed(order);

    // Store SMS record
    const sms: StoredSMS = {
      id: Date.now().toString(),
      to: order.clientInfo.phone,
      content: template.message,
      timestamp: new Date().toISOString(),
      status: order.status as 'in-progress' | 'completed',
      deliveryStatus: 'sent'
    };
    
    storeSMS(sms);
    return { success: true, sms };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
};

export const getSentSMS = () => {
  return getStoredSMS();
};