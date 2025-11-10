import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { analyticsAPI } from '../utils/api';
import { FiAlertCircle, FiMessageCircle } from 'react-icons/fi';

const Analytics = () => {
  const [staleContacts, setStaleContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState(3);

  useEffect(() => {
    fetchStaleContacts();
  }, [selectedMonths]);

  const fetchStaleContacts = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getStaleContacts(selectedMonths);
      setStaleContacts(response.data.stale_contacts);
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="analytics-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relationship Insights</h1>
        <p className="text-gray-600">Monitor and maintain your connections</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Contacts Needing Attention</h2>
            <p className="text-sm text-gray-600">People you haven't contacted recently</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              data-testid="months-filter"
              value={selectedMonths}
              onChange={(e) => setSelectedMonths(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="1">1 month</option>
              <option value="2">2 months</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">1 year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stale Contacts */}
      {staleContacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Great job!</h3>
          <p className="text-gray-600">
            You're staying connected with all your contacts within the last {selectedMonths} month{selectedMonths > 1 ? 's' : ''}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-orange-50">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {staleContacts.length} Contact{staleContacts.length > 1 ? 's' : ''} Need{staleContacts.length === 1 ? 's' : ''} Attention
                </h3>
                <p className="text-sm text-gray-600">
                  No contact in the last {selectedMonths} month{selectedMonths > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {staleContacts.map((contact) => (
              <div
                key={contact.contact_id}
                className="p-6 hover:bg-gray-50 transition-colors"
                data-testid={`stale-contact-${contact.contact_id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                      {contact.email && (
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      )}
                      {contact.relationship && (
                        <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {contact.relationship}
                        </span>
                      )}
                      {contact.last_contacted ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Last contacted: {new Date(contact.last_contacted).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Never contacted</p>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to={`/message/${contact.contact_id}`}
                    data-testid={`reach-out-${contact.contact_id}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span>Reach Out</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;