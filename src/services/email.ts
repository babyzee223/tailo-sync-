import emailjs from '@emailjs/browser';
import type { Order } from '../types';

// EmailJS configuration
const EMAIL_SERVICE_ID = 'service_flwukum';
const EMAIL_TEMPLATE_ID = 'template_09jn6m7';

type EmailTemplate = {
  subject: string;
  body: string;
};

type EmailStatus = 'sent' | 'delivered' | 'opened' | 'bounced';

interface TrackedEmail {
  id: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  status: EmailStatus;
  deliveredAt?: string;
  openedAt?: string;
  bouncedAt?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const getCustomGarmentDetails = (order: Order) => {
  const customGarments = order.garments.filter(g => g.garmentInfo.designInfo);
  if (customGarments.length === 0) return '';

  return customGarments.map(garment => {
    const designInfo = garment.garmentInfo.designInfo!;
    const fabricDetails = designInfo.fabricInfo.entries
      .map(fabric => `• ${fabric.type} ${fabric.color} (${fabric.quantity} yards)`)
      .join('\n');

    return `
Custom Design Details for ${garment.garmentInfo.type}:
${fabricDetails}

${designInfo.notions.buttons.needed ? 
  `Buttons: ${designInfo.notions.buttons.quantity} ${designInfo.notions.buttons.type}\n` : ''}
${designInfo.notions.zippers.needed ? 
  `Zippers: ${designInfo.notions.zippers.quantity} ${designInfo.notions.zippers.type}\n` : ''}
${designInfo.notions.other ? `Additional Notions: ${designInfo.notions.other}\n` : ''}
${designInfo.notes ? `Design Notes: ${designInfo.notes}` : ''}
    `.trim();
  }).join('\n\n');
};

const getFittingDetails = (order: Order) => {
  const fittingSessions = order.garments
    .flatMap(g => g.garmentInfo.bridalInfo?.fittingSessions || [])
    .filter(session => !session.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (fittingSessions.length === 0) return '';

  const nextFitting = fittingSessions[0];
  return `
Your next fitting is scheduled for: ${new Date(nextFitting.date).toLocaleString()}
Type: ${nextFitting.type} Fitting
${nextFitting.notes ? `\nNotes: ${nextFitting.notes}` : ''}
  `.trim();
};

const templates = {
  inProgress: (order: Order): EmailTemplate => {
    const isCustom = order.garments.some(g => g.garmentInfo.designInfo);
    const customDetails = getCustomGarmentDetails(order);
    const isFitting = order.isFittingUpdate;
    const fittingDetails = getFittingDetails(order);

    return {
      subject: isFitting 
        ? 'Your Fitting Appointment Details'
        : isCustom 
          ? 'Your Custom Design is Now in Progress' 
          : 'Your Alterations Order is Now in Progress',
      body: `
Dear ${order.clientInfo.name},

${isFitting 
  ? 'We are writing to confirm your upcoming fitting appointment.'
  : `Thank you for choosing GK Alterations and Tailoring. We're pleased to inform you that we have begun work on your ${isCustom ? 'custom design' : 'order'}.`
}

${isFitting ? fittingDetails : `
Order Details:
${order.garments.map(g => `• ${g.garmentInfo.quantity}x ${g.garmentInfo.type}`).join('\n')}

${customDetails ? `\n${customDetails}\n` : ''}

Expected Completion Date: ${new Date(order.dueDate).toLocaleDateString()}
Remaining Balance: ${formatCurrency(order.paymentInfo.totalAmount - order.paymentInfo.depositAmount)}
`}

${isFitting ? `
Please arrive 5-10 minutes before your scheduled time. If you need to reschedule, please contact us at least 24 hours in advance.

What to Bring:
• The shoes you plan to wear with the garment
• Any undergarments that will be worn
• Any accessories you'd like to try with the outfit
` : ''}

We will keep you updated on the progress of your ${isCustom ? 'custom design' : 'alterations'}. If you have any questions in the meantime, please don't hesitate to reach out to us.

Thank you for your business.

Best regards,
GK Alterations and Tailoring
      `.trim()
    };
  },
  
  completed: (order: Order): EmailTemplate => {
    const isCustom = order.garments.some(g => g.garmentInfo.designInfo);
    
    return {
      subject: isCustom ? 
        'Your Custom Design is Ready for Pickup' : 
        'Your Alterations are Ready for Pickup',
      body: `
Dear ${order.clientInfo.name},

We're excited to inform you that your ${isCustom ? 'custom design' : 'alterations'} ${order.garments.length > 1 ? 'are' : 'is'} now complete and ready for pickup.

Order Details:
${order.garments.map(g => `• ${g.garmentInfo.quantity}x ${g.garmentInfo.type}`).join('\n')}

Remaining Balance: ${formatCurrency(order.paymentInfo.totalAmount - order.paymentInfo.depositAmount)}

Please bring your remaining balance of ${formatCurrency(order.paymentInfo.totalAmount - order.paymentInfo.depositAmount)} at the time of pickup.

We accept the following payment methods:
• Card
• Venmo
• Zelle

Please feel free to contact us to schedule your pickup time.

Thank you for choosing GK Alterations and Tailoring for your ${isCustom ? 'custom design' : 'alterations'} needs.

Best regards,
GK Alterations and Tailoring
      `.trim()
    };
  }
};

// Store sent emails in localStorage for the Messages page
const EMAILS_STORAGE_KEY = 'alteration_emails';

const storeEmail = (email: TrackedEmail) => {
  try {
    const stored = localStorage.getItem(EMAILS_STORAGE_KEY);
    const emails = stored ? JSON.parse(stored) : [];
    emails.unshift(email);
    localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(emails));
  } catch (error) {
    console.error('Failed to store email:', error);
  }
};

// Generate a unique ID for each email
const generateEmailId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const sendStatusUpdateEmail = async (order: Order) => {
  const template = order.status === 'in-progress' 
    ? templates.inProgress(order)
    : templates.completed(order);

  const emailId = generateEmailId();

  try {
    // Send email using EmailJS
    const result = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      {
        to_email: order.clientInfo.email,
        to_name: order.clientInfo.name,
        from_name: "GK Alterations and Tailoring",
        subject: template.subject,
        message: template.body,
        reply_to: "support@gkalterations.com"
      }
    );

    if (result.status !== 200) {
      throw new Error('Failed to send email');
    }

    // Store the sent email with initial status
    const email: TrackedEmail = {
      id: emailId,
      to: order.clientInfo.email,
      subject: template.subject,
      content: template.body,
      timestamp: new Date().toISOString(),
      status: 'sent',
      deliveredAt: new Date().toISOString() // Mark as delivered immediately for demo
    };

    storeEmail(email);

    // Simulate email tracking updates
    setTimeout(() => {
      const storedEmails = localStorage.getItem(EMAILS_STORAGE_KEY);
      if (storedEmails) {
        const emails = JSON.parse(storedEmails);
        const updatedEmails = emails.map((e: TrackedEmail) => 
          e.id === emailId ? { 
            ...e, 
            status: 'delivered',
            deliveredAt: new Date().toISOString()
          } : e
        );
        localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updatedEmails));
      }
    }, 2000);

    // Simulate email open after 5 seconds
    setTimeout(() => {
      const storedEmails = localStorage.getItem(EMAILS_STORAGE_KEY);
      if (storedEmails) {
        const emails = JSON.parse(storedEmails);
        const updatedEmails = emails.map((e: TrackedEmail) => 
          e.id === emailId ? { 
            ...e, 
            status: 'opened',
            openedAt: new Date().toISOString()
          } : e
        );
        localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updatedEmails));
      }
    }, 5000);

    return { success: true, email };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    
    // Store the failed email attempt
    const failedEmail: TrackedEmail = {
      id: emailId,
      to: order.clientInfo.email,
      subject: template.subject,
      content: template.body,
      timestamp: new Date().toISOString(),
      status: 'bounced',
      bouncedAt: new Date().toISOString()
    };
    
    storeEmail(failedEmail);
    throw error;
  }
};

export const getSentEmails = () => {
  try {
    const stored = localStorage.getItem(EMAILS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};