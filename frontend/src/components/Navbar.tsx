import { Menu, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Left side - Logo and Brand (far left) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Chainfly</span>
          </Link>
        </div>

        {/* Right side - Notifications and User Profile (far right) */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <User className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 