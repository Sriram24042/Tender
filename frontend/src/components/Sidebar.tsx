import { X, Home, FileText, Calendar, Upload, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Tenders', href: '/tenders', icon: FileText },
    { name: 'Documents', href: '/documents', icon: Upload },
    { name: 'Reminders', href: '/reminders', icon: Calendar },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
        style={{ top: '64px' }} // Account for fixed navbar height
      >
        {/* Header with hamburger menu - Fixed position on left */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          {/* Hamburger menu icon - Always on the left */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Mobile close button - Only show when sidebar is expanded and on mobile */}
          {!isCollapsed && (
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0 ${
                      isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 