import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { contactAPI, reminderAPI } from '../utils/api';
import { FiArrowLeft, FiEdit2, FiTrash2, FiMail, FiPhone, FiCalendar, FiBell } from 'react-icons/fi';

const ContactDetail = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  const fetchContact = async () => {
    try {
      const response = await contactAPI.getOne(contactId);
      setContact(response.data);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load contact');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await contactAPI.update(contactId, formData);
      toast.success('Contact updated successfully!');
      setEditing(false);
      fetchContact();
    } catch (error) {
      toast.error('Failed to update contact');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await contactAPI.delete(contactId);
      toast.success('Contact deleted successfully!');
      navigate('/contacts');
    } catch (error) {
      toast.error('Failed to delete contact');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact not found</h2>
          <Link to="/contacts" className="text-indigo-600 hover:text-indigo-700">
            Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="contact-detail">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/contacts"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Contacts
        </Link>
      </div>

      {/* Contact Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-12">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                <span className="text-4xl font-bold text-indigo-600">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
                {contact.relationship && (
                  <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                    {contact.relationship}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => setEditing(!editing)}
                data-testid="edit-contact-button"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiEdit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                data-testid="delete-contact-button"
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                  <input
                    type="date"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              {contact.email && (
                <div className="flex items-center text-gray-700">
                  <FiMail className="w-5 h-5 mr-3 text-gray-400" />
                  <a href={`mailto:${contact.email}`} className="hover:text-indigo-600">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center text-gray-700">
                  <FiPhone className="w-5 h-5 mr-3 text-gray-400" />
                  <a href={`tel:${contact.phone}`} className="hover:text-indigo-600">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.birthday && (
                <div className="flex items-center text-gray-700">
                  <FiCalendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span>
                    Birthday: {new Date(contact.birthday).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {contact.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to={`/message/${contactId}`}
          data-testid="generate-message-button"
          className="flex items-center justify-center space-x-3 bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <FiMail className="w-5 h-5" />
          <span className="font-medium">Generate Message</span>
        </Link>
        <button
          onClick={() => navigate('/reminders')}
          data-testid="set-reminder-button"
          className="flex items-center justify-center space-x-3 bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-colors"
        >
          <FiBell className="w-5 h-5" />
          <span className="font-medium">Set Reminder</span>
        </button>
      </div>
    </div>
  );
};

export default ContactDetail;