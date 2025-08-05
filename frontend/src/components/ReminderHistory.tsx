import React, { useState } from 'react';
import { Bell, Calendar, Mail, X, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ReminderHistoryRecord {
  id: string;
  reminder_id: string;
  action: 'created' | 'sent' | 'cancelled' | 'updated';
  timestamp: string;
  details: {
    tender_id: string;
    reminder_type: string;
    due_date: string;
    email: string;
    status: string;
  };
}

interface ReminderHistoryProps {
  history: ReminderHistoryRecord[];
  onClearHistory?: () => void;
}

const ReminderHistory = ({ history, onClearHistory }: ReminderHistoryProps) => {
  const [selectedRecord, setSelectedRecord] = useState<ReminderHistoryRecord | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'sent':
        return <Mail className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'updated':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'updated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Created';
      case 'sent':
        return 'Sent';
      case 'cancelled':
        return 'Cancelled';
      case 'updated':
        return 'Updated';
      default:
        return action;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Reminder History</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">{history.length} activities</span>
          {history.length > 0 && onClearHistory && (
            <button
              onClick={onClearHistory}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reminder history</h3>
          <p className="text-gray-500">Reminder activities will appear here after you create or manage reminders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getActionIcon(record.action)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Tender {record.details.tender_id} - {record.details.reminder_type}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(record.action)}`}>
                        {getActionLabel(record.action)}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(record.timestamp)}</span>
                      </span>
                      <span>Email: {record.details.email}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setSelectedRecord(null)}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Reminder Activity Details</h3>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getActionIcon(selectedRecord.action)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getActionLabel(selectedRecord.action)} Reminder
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedRecord.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-700 mb-3">Reminder Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tender ID:</span>
                        <span className="font-medium">{selectedRecord.details.tender_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedRecord.details.reminder_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{formatDate(selectedRecord.details.due_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedRecord.details.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedRecord.details.status)}`}>
                          {selectedRecord.details.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderHistory; 