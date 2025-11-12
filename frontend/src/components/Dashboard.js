import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { analyticsAPI, reminderAPI } from '../utils/api';
import { FiUsers, FiBell, FiAlertCircle, FiPlus, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import LoadingSkeleton from './LoadingSkeleton';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  const statCards = [
    {
      icon: FiUsers,
      value: stats?.total_contacts || 0,
      label: 'Total Contacts',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600'
    },
    {
      icon: FiBell,
      value: stats?.total_reminders || 0,
      label: 'Active Reminders',
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-100',
      iconColor: 'text-accent-600'
    },
    {
      icon: FiCalendar,
      value: stats?.upcoming_events_count || 0,
      label: 'Upcoming This Week',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      icon: FiAlertCircle,
      value: stats?.stale_contacts_count || 0,
      label: 'Need Attention',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-lg text-neutral-600">Here's what's happening with your connections</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.02, y: -4 }}
              className="card-interactive p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                {index === 3 && stat.value > 0 && (
                  <span className="badge-accent">Action needed</span>
                )}
              </div>
              <h3 className="text-3xl font-display font-bold text-neutral-900 mb-1">{stat.value}</h3>
              <p className="text-neutral-600 text-sm font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 rounded-3xl shadow-soft-lg p-8 mb-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <h2 className="text-2xl font-display font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/contacts"
                data-testid="quick-action-add-contact"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 block transition-all duration-200 border border-white/20"
              >
                <FiPlus className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Add Contact</h3>
                <p className="text-sm text-white/90">Create a new contact</p>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/reminders"
                data-testid="quick-action-set-reminder"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 block transition-all duration-200 border border-white/20"
              >
                <FiBell className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Set Reminder</h3>
                <p className="text-sm text-white/90">Schedule a new reminder</p>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/analytics"
                data-testid="quick-action-view-analytics"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 block transition-all duration-200 border border-white/20"
              >
                <FiTrendingUp className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">View Insights</h3>
                <p className="text-sm text-white/90">Check relationship health</p>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-neutral-100 bg-neutral-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-900">Upcoming This Week</h2>
            </div>
            <Link
              to="/reminders"
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-neutral-100">
          {upcomingReminders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500 mb-3">No upcoming reminders this week</p>
              <Link
                to="/reminders"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
              >
                Create a reminder →
              </Link>
            </div>
          ) : (
            upcomingReminders.slice(0, 5).map((reminder, index) => (
              <motion.div
                key={reminder.reminder_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6 hover:bg-neutral-50 transition-colors"
                data-testid={`reminder-${reminder.reminder_id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {reminder.contact_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 text-lg mb-1">
                        {reminder.contact_name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        {reminder.occasion_type.charAt(0).toUpperCase() + reminder.occasion_type.slice(1)} 
                        {' • '}
                        {new Date(reminder.occasion_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${
                          reminder.days_until === 0 ? 'bg-red-100 text-red-800' :
                          reminder.days_until <= 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {reminder.days_until === 0 ? '🔥 Today' : 
                           reminder.days_until === 1 ? 'Tomorrow' :
                           `In ${reminder.days_until} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={`/message/${reminder.contact_id}`}
                      data-testid={`send-message-${reminder.contact_id}`}
                      className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap"
                    >
                      Send Message
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
