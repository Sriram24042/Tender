import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Calendar, MapPin, DollarSign, FileText } from 'lucide-react';
import { useTender } from '../context/TenderContext';
import { tenderAPI } from '../services/api';

const Tenders = () => {
  const { getFilteredTenders, setFilters, state } = useTender();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Mock data for demonstration
  const mockTenders = [
    {
      id: '1',
      title: 'Infrastructure Development Project',
      description: 'Large-scale infrastructure development for urban areas',
      deadline: '2024-02-15',
      value: 5000000,
      location: 'Mumbai',
      sector: 'Infrastructure',
      status: 'open' as const,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'IT Services Contract',
      description: 'Comprehensive IT services for government department',
      deadline: '2024-03-01',
      value: 2500000,
      location: 'Delhi',
      sector: 'Technology',
      status: 'open' as const,
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      title: 'Healthcare Equipment Supply',
      description: 'Supply of medical equipment for hospitals',
      deadline: '2024-01-30',
      value: 1500000,
      location: 'Bangalore',
      sector: 'Healthcare',
      status: 'closed' as const,
      createdAt: '2024-01-10',
    },
  ];

  useEffect(() => {
    // Load mock data into context
    // In real app, this would be an API call
    console.log('Loading tenders...');
  }, []);

  const tenders = getFilteredTenders();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ search: value });
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setFilters({ status });
  };

  const handleSectorFilter = (sector: string) => {
    setSelectedSector(sector);
    setFilters({ sector });
  };

  const handleLocationFilter = (location: string) => {
    setSelectedLocation(location);
    setFilters({ location });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedSector('');
    setSelectedLocation('');
    setFilters({ search: '', status: '', sector: '', location: '' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'awarded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenders</h1>
          <p className="text-gray-600 mt-2">Search and manage tender opportunities</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Tender</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => handleSectorFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Sectors</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => handleLocationFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Locations</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedStatus || selectedSector || selectedLocation) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {tenders.length} tender{tenders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tenders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tenders.map((tender) => (
          <div key={tender.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {tender.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tender.status)}`}>
                {tender.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {tender.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{tender.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>{formatCurrency(tender.value)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Sector: {tender.sector}
              </span>
              <div className="flex space-x-2">
                <button className="p-1 text-gray-400 hover:text-blue-600">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tenders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenders found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default Tenders; 