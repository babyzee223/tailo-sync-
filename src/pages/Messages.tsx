import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Mail, MessageSquare, CheckCircle2, XCircle, Eye, Clock, Search, Filter, Download, BarChart2, Calendar, AlertCircle, FileText, User, Phone, Maximize2, Minimize2, X } from 'lucide-react';
import { getSentEmails } from '../services/email';
import { getSentSMS } from '../services/sms';
import { getStoredForms } from '../services/forms';
import type { FormData } from '../types';
import FormView from '../components/FormView';

type EmailStatus = 'sent' | 'delivered' | 'opened' | 'bounced';
type MessageType = 'email' | 'sms' | 'all';

function Messages() {
  const [activeTab, setActiveTab] = useState<'tracking' | 'analytics' | 'form'>('form');
  const [messageType, setMessageType] = useState<MessageType>('all');
  const [statusFilter, setStatusFilter] = useState<EmailStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get messages from storage
  const emails = getSentEmails();
  const sms = getSentSMS();

  // Combine and format messages for display
  const allMessages = [
    ...emails.map(email => ({
      ...email,
      type: 'email' as const,
      recipient: email.to,
      openedAt: email.openedAt || null,
      deliveredAt: email.deliveredAt || null,
      bouncedAt: email.bouncedAt || null
    })),
    ...sms.map(message => ({
      ...message,
      type: 'sms' as const,
      recipient: message.to,
      subject: 'SMS Notification',
      deliveredAt: message.deliveredAt || null
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Calculate analytics
  const analytics = {
    total: allMessages.length,
    emails: allMessages.filter(m => m.type === 'email').length,
    sms: allMessages.filter(m => m.type === 'sms').length,
    delivered: allMessages.filter(m => m.type === 'email' && m.status === 'delivered').length,
    opened: allMessages.filter(m => m.type === 'email' && m.status === 'opened').length,
    bounced: allMessages.filter(m => m.type === 'email' && m.status === 'bounced').length,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === 'tracking'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            <Mail className="w-4 h-4 mr-2" />
            Message Tracking
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === 'form'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Forms
          </button>
        </div>

        {/* Forms View */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            <FormView />
          </div>
        )}

        {/* Message List */}
        {activeTab === 'tracking' && (
          <div className="space-y-4">
            {allMessages.length > 0 ? (
              allMessages.map((message) => (
                <div key={message.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className={`bg-${message.type === 'email' ? 'blue' : 'green'}-50 rounded-lg p-2`}>
                        {message.type === 'email' ? (
                          <Mail className="w-6 h-6 text-blue-600" />
                        ) : (
                          <MessageSquare className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{message.subject}</h3>
                        <p className="text-sm text-gray-500">{message.recipient}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Sent: {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {message.type === 'email' ? (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          message.status === 'opened' ? 'bg-blue-100 text-blue-800' :
                          message.status === 'bounced' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Delivered
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No messages found</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Total Messages</h3>
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{analytics.total}</p>
              <div className="mt-2 flex gap-4">
                <span className="text-sm text-gray-500">
                  Emails: {analytics.emails}
                </span>
                <span className="text-sm text-gray-500">
                  SMS: {analytics.sms}
                </span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Delivery Rate</h3>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {analytics.emails > 0 ? Math.round((analytics.delivered / analytics.emails) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.delivered} delivered
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Open Rate</h3>
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {analytics.emails > 0 ? Math.round((analytics.opened / analytics.emails) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.opened} opened
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Messages;