import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Calendar, 
  Upload, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Search
} from 'lucide-react';
import { useTender } from '../context/TenderContext';
import { useReminder } from '../context/ReminderContext';
import { useDocument } from '../context/DocumentContext';

const Dashboard = () => {
  const { getTendersByStatus, getFilteredTenders } = useTender();
  const { getUpcomingReminders, getRemindersByStatus } = useReminder();
  const { getDocumentsByStatus, getTotalFileSize } = useDocument();

  const [stats, setStats] = useState({
    totalTenders: 0,
    openTenders: 0,
    totalReminders: 0,
    pendingReminders: 0,
    totalDocuments: 0,
    totalFileSize: 0,
  });

  useEffect(() => {
    // Calculate statistics with optimized data structures
    const tenders = getFilteredTenders();
    const openTenders = getTendersByStatus('open');
    const upcomingReminders = getUpcomingReminders(7); // Next 7 days
    const pendingReminders = getRemindersByStatus('pending');
    const completedDocuments = getDocumentsByStatus('completed');
    const totalFileSize = getTotalFileSize();

    setStats({
      totalTenders: tenders.length,
      openTenders: openTenders.length,
      totalReminders: pendingReminders.length,
      pendingReminders: upcomingReminders.length,
      totalDocuments: completedDocuments.length,
      totalFileSize,
    });
  }, [getFilteredTenders, getTendersByStatus, getUpcomingReminders, getRemindersByStatus, getDocumentsByStatus, getTotalFileSize]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ml-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, onClick }: {
    title: string;
    description: string;
    icon: any;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="card hover:shadow-md transition-all duration-200 hover:scale-105 text-left"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your tenders.</p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tenders, documents..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenders"
          value={stats.totalTenders}
          icon={FileText}
          color="bg-blue-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Open Tenders"
          value={stats.openTenders}
          icon={AlertCircle}
          color="bg-yellow-500"
        />
        <StatCard
          title="Pending Reminders"
          value={stats.pendingReminders}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={Upload}
          color="bg-green-500"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          title="Search Tenders"
          description="Find new opportunities"
          icon={FileText}
          onClick={() => {/* Navigate to tenders */}}
        />
        <QuickAction
          title="Upload Documents"
          description="Add new files"
          icon={Upload}
          onClick={() => {/* Navigate to documents */}}
        />
        <QuickAction
          title="Set Reminders"
          description="Schedule notifications"
          icon={Calendar}
          onClick={() => {/* Navigate to reminders */}}
        />
      </div>

      {/* Recent Activity and Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenders */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tenders</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Tender #{i}</p>
                    <p className="text-sm text-gray-500">Updated 2 hours ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Documents</span>
              <span className="text-sm font-medium text-gray-900">{formatFileSize(stats.totalFileSize)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available space</span>
              <span className="text-sm font-medium text-gray-900">100 MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ width: `${Math.min((stats.totalFileSize / (100 * 1024 * 1024)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 