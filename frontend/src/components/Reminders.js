import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reminderAPI, contactAPI } from '../utils/api';
import { FiCalendar, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  const [formData, setFormData] = useState({
    contact_id: '',
    occasion_type: 'birthday',
    occasion_date: '',
    reminder_days_before: 3,
    custom_message: '',
    is_recurring: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [remindersRes, contactsRes] = await Promise.all([
        reminderAPI.getAll(),
        contactAPI.getAll()
      ]);
      setReminders(remindersRes.data.reminders);
      setContacts(contactsRes.data.contacts);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      await reminderAPI.create(formData);
      toast.success('Reminder created successfully!');
      setShowAddModal(false);
      setFormData({
        contact_id: '',
        occasion_type: 'birthday',
        occasion_date: '',
        reminder_days_before: 3,
        custom_message: '',
        is_recurring: true
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create reminder');
      console.error(error);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
      await reminderAPI.delete(reminderId);
      toast.success('Reminder deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete reminder');
      console.error(error);
    }
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.contact_id === contactId);
    return contact ? contact.name : 'Unknown';
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const dayReminders = reminders.filter(r => {
        const occasionDate = new Date(r.occasion_date);
        return occasionDate.toISOString().split('T')[0] === dateStr;
      });

      if (dayReminders.length > 0) {
        return (
          <div className="text-xs mt-1">
            <div className="w-2 h-2 bg-indigo-600 rounded-full mx-auto"></div>
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="reminders-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reminders</h1>
        <p className="text-gray-600">Manage your occasions and reminders</p>
      </div>

      {/* View Toggle & Add Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              data-testid="view-list-button"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                view === 'list' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              data-testid="view-calendar-button"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                view === 'calendar' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'
              }`}
            >
              Calendar View
            </button>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-reminder-button"
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {reminders.length === 0 ? (
            <div className="p-12 text-center">
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reminders yet</h3>
              <p className="text-gray-600 mb-6">Create your first reminder to stay connected</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                <span>Create Reminder</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reminders.map((reminder) => (
                <div
                  key={reminder.reminder_id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                  data-testid={`reminder-item-${reminder.reminder_id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {getContactName(reminder.contact_id)}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Occasion:</span>{' '}
                          {reminder.occasion_type.charAt(0).toUpperCase() + reminder.occasion_type.slice(1)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(reminder.occasion_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Remind me:</span>{' '}
                          {reminder.reminder_days_before} day(s) before
                        </p>
                        {reminder.is_recurring && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(reminder.reminder_id)}
                      data-testid={`delete-reminder-${reminder.reminder_id}`}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="calendar-container">
            <Calendar
              tileContent={getTileContent}
              className="w-full border-none"
            />
          </div>
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-900">
              <span className="font-semibold">Tip:</span> Days with dots have scheduled occasions
            </p>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full" data-testid="add-reminder-modal">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add Reminder</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact *</label>
                <select
                  data-testid="reminder-contact-select"
                  value={formData.contact_id}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.contact_id} value={contact.contact_id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occasion Type *</label>
                <select
                  data-testid="reminder-occasion-select"
                  value={formData.occasion_type}
                  onChange={(e) => setFormData({ ...formData, occasion_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occasion Date *</label>
                <input
                  type="date"
                  data-testid="reminder-date-input"
                  value={formData.occasion_date}
                  onChange={(e) => setFormData({ ...formData, occasion_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remind me (days before)</label>
                <input
                  type="number"
                  data-testid="reminder-days-input"
                  value={formData.reminder_days_before}
                  onChange={(e) => setFormData({ ...formData, reminder_days_before: parseInt(e.target.value) })}
                  min="0"
                  max="365"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  data-testid="reminder-recurring-checkbox"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Recurring (repeat every year)
                </label>
              </div>

              <button
                type="submit"
                data-testid="submit-reminder-button"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Create Reminder
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container :global(.react-calendar) {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .calendar-container :global(.react-calendar__tile--active) {
          background: #6366f1;
          color: white;
        }
        .calendar-container :global(.react-calendar__tile--now) {
          background: #e0e7ff;
        }
      `}</style>
    </div>
  );
};

export default Reminders;