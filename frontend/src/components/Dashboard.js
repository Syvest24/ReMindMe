import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { analyticsAPI, reminderAPI } from '../utils/api';
import { FiUsers, FiBell, FiAlertCircle, FiPlus, FiCalendar } from 'react-icons/fi';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, remindersRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        reminderAPI.getUpcoming(7)
      ]);
      
      setStats(statsRes.data);
      setUpcomingReminders(remindersRes.data.upcoming_reminders || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">Here's what's happening with your connections</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.total_contacts || 0}</h3>
          <p className="text-gray-600 text-sm">Total Contacts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiBell className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.total_reminders || 0}</h3>
          <p className="text-gray-600 text-sm">Active Reminders</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.upcoming_events_count || 0}</h3>
          <p className="text-gray-600 text-sm">Upcoming This Week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.stale_contacts_count || 0}</h3>
          <p className="text-gray-600 text-sm">Need Attention</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/contacts"
            data-testid="quick-action-add-contact"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all"
          >
            <FiPlus className="w-6 h-6 mb-2" />
            <h3 className="font-semibold">Add Contact</h3>
            <p className="text-sm text-white text-opacity-90">Create a new contact</p>
          </Link>
          
          <Link
            to="/reminders"
            data-testid="quick-action-set-reminder"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all"
          >
            <FiBell className="w-6 h-6 mb-2" />
            <h3 className="font-semibold">Set Reminder</h3>
            <p className="text-sm text-white text-opacity-90">Schedule a new reminder</p>
          </Link>
          
          <Link
            to="/analytics"
            data-testid="quick-action-view-analytics"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all"
          >
            <FiAlertCircle className="w-6 h-6 mb-2" />
            <h3 className="font-semibold">View Insights</h3>
            <p className="text-sm text-white text-opacity-90">Check relationship health</p>
          </Link>
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Upcoming This Week</h2>
            <Link
              to="/reminders"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {upcomingReminders.length === 0 ? (
            <div className="p-8 text-center">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming reminders this week</p>
              <Link
                to="/reminders"
                className="inline-block mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create a reminder
              </Link>
            </div>
          ) : (
            upcomingReminders.slice(0, 5).map((reminder) => (
              <div
                key={reminder.reminder_id}
                className="p-6 hover:bg-gray-50 transition-colors"
                data-testid={`reminder-${reminder.reminder_id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {reminder.contact_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {reminder.occasion_type.charAt(0).toUpperCase() + reminder.occasion_type.slice(1)} 
                      {' - '}
                      {new Date(reminder.occasion_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reminder.days_until === 0 ? 'bg-red-100 text-red-800' :
                        reminder.days_until <= 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {reminder.days_until === 0 ? 'Today' : 
                         reminder.days_until === 1 ? 'Tomorrow' :
                         `In ${reminder.days_until} days`}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/message/${reminder.contact_id}`}
                    data-testid={`send-message-${reminder.contact_id}`}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Send Message
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
