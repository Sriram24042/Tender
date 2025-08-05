import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Bell, Clock, Mail, Trash2, Edit, CheckCircle } from 'lucide-react';
import { useReminder, type ReminderHistoryRecord } from '../context/ReminderContext';
import { reminderAPI } from '../services/api';
import ReminderHistory from '../components/ReminderHistory';

const Reminders = () => {
  const { getFilteredReminders, addReminder, deleteReminder, getUpcomingReminders, addHistoryRecord, clearHistory, state, loadReminderHistory } = useReminder();
  const [deletingReminder, setDeletingReminder] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tender_id: '',
    reminder_type: '',
    due_date: '',
    email: '',
  });
  const [isTestMode, setIsTestMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reminders = getFilteredReminders();
  const upcomingReminders = getUpcomingReminders(7); // Next 7 days
  const reminderHistory = state.reminderHistory;

  // Load reminder history when the page is accessed
  useEffect(() => {
    loadReminderHistory();
  }, [loadReminderHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tender_id || !formData.reminder_type || !formData.due_date || !formData.email) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await reminderAPI.set(formData, isTestMode);
      
      // Add to context
      const newReminder = {
        id: Date.now().toString(),
        tender_id: formData.tender_id,
        reminder_type: formData.reminder_type,
        due_date: formData.due_date,
        email: formData.email,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };
      
      addReminder(newReminder);
      
      // Add to history
      const historyRecord: ReminderHistoryRecord = {
        id: Date.now().toString() + '_history',
        reminder_id: newReminder.id,
        action: 'created',
        timestamp: new Date().toISOString(),
        details: {
          tender_id: newReminder.tender_id,
          reminder_type: newReminder.reminder_type,
          due_date: newReminder.due_date,
          email: newReminder.email,
          status: newReminder.status,
        },
      };
      
      await addHistoryRecord(historyRecord);
      
      // Reset form
      setFormData({
        tender_id: '',
        reminder_type: '',
        due_date: '',
        email: '',
      });
      setShowForm(false);
      setIsTestMode(false);
      
      alert(`Reminder set successfully! ${isTestMode ? '(Test mode - emails in minutes)' : ''}`);
    } catch (error) {
      console.error('Reminder creation error:', error);
      alert('Failed to set reminder. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntil = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffTime < 0) return 'Overdue';
    if (diffDays === 0) {
      if (diffHours === 0) {
        if (diffMinutes <= 1) return 'Due now';
        return `${diffMinutes} minutes`;
      }
      return `${diffHours} hours`;
    }
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const simulateEmailSent = async (reminder: any) => {
    // Simulate email being sent
    const updatedReminder = {
      ...reminder,
      status: 'sent' as const,
    };
    
    // Update the reminder
    addReminder(updatedReminder);
    
    // Add to history
    const historyRecord: ReminderHistoryRecord = {
      id: Date.now().toString() + '_history',
      reminder_id: reminder.id,
      action: 'sent',
      timestamp: new Date().toISOString(),
      details: {
        tender_id: reminder.tender_id,
        reminder_type: reminder.reminder_type,
        due_date: reminder.due_date,
        email: reminder.email,
        status: 'sent',
      },
    };
    
    await addHistoryRecord(historyRecord);
  };

  const getReminderTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deadline':
        return 'bg-red-100 text-red-800';
      case 'submission':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-600 mt-2">Manage your tender deadlines and notifications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reminders</p>
              <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming (7 days)</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingReminders.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sent Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {reminders.filter(r => r.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Set New Reminder</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Tender ID</label>
                <input
                  type="text"
                  name="tender_id"
                  value={formData.tender_id}
                  onChange={handleInputChange}
                  placeholder="Enter tender ID"
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Reminder Type</label>
                <select
                  name="reminder_type"
                  value={formData.reminder_type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Submission">Submission</option>
                  <option value="Review">Review</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Test mode (send emails in minutes)</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Setting Reminder...' : 'Set Reminder'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">All Reminders</h2>
        
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Bell className="h-5 w-5 text-primary-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      Tender {reminder.tender_id}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReminderTypeColor(reminder.reminder_type)}`}>
                      {reminder.reminder_type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reminder.status)}`}>
                      {reminder.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Due: {formatDate(reminder.due_date)}</span>
                    <span>({getDaysUntil(reminder.due_date)})</span>
                    <span>Email: {reminder.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {reminder.status === 'pending' && (
                  <button 
                    onClick={async () => await simulateEmailSent(reminder)}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                    title="Simulate email sent"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={async () => {
                    if (deletingReminder === reminder.id) return; // Prevent double-click
                    setDeletingReminder(reminder.id);
                    
                    try {
                      // Add to history before deleting
                      const historyRecord: ReminderHistoryRecord = {
                        id: Date.now().toString() + '_history',
                        reminder_id: reminder.id,
                        action: 'cancelled',
                        timestamp: new Date().toISOString(),
                        details: {
                          tender_id: reminder.tender_id,
                          reminder_type: reminder.reminder_type,
                          due_date: reminder.due_date,
                          email: reminder.email,
                          status: reminder.status,
                        },
                      };
                      await addHistoryRecord(historyRecord);
                      
                      // Delete from backend
                      await reminderAPI.delete(reminder.id);
                      
                      // Remove from local state
                      deleteReminder(reminder.id);
                    } catch (error) {
                      console.error('Error deleting reminder:', error);
                      alert('Failed to delete reminder. Please try again.');
                    } finally {
                      setDeletingReminder(null);
                    }
                  }}
                  disabled={deletingReminder === reminder.id}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  title={deletingReminder === reminder.id ? "Deleting..." : "Delete reminder"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {reminders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders set</h3>
            <p className="text-gray-500">
              Set up your first reminder to stay on top of important tender deadlines.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reminders (Next 7 Days)</h2>
          
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Tender {reminder.tender_id} - {reminder.reminder_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    Due {formatDate(reminder.due_date)} ({getDaysUntil(reminder.due_date)})
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminder History */}
      <div className="card">
        <ReminderHistory history={reminderHistory} onClearHistory={clearHistory} />
      </div>
    </div>
  );
};

export default Reminders; 