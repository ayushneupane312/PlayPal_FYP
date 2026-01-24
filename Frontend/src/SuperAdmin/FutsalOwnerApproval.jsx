import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Eye, 
  Check, 
  X, 
  Clock,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useFutsalOwnerStore } from '../store/futsalOwnerFormStore';
import { showToast } from '../FutsalOwner/components/Toast';
import AdminSidebar from './AdminSidebar';
import { useNavigate } from 'react-router-dom';

const FutsalOwnerApprovals = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    futsalOwners,
    counts,
    pagination,
    isLoading,
    currentFilter,
    searchTerm,
    getAllFutsalOwners,
    setFilter,
    setPage,
    searchFutsalOwners,
    updateFutsalOwnerStatus,
    refreshData
  } = useFutsalOwnerStore();

  // Fetch data on mount
  useEffect(() => {
    getAllFutsalOwners({ status: 'pending', page: 1, limit: 10 });
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== searchTerm) {
        searchFutsalOwners(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFilterChange = async (status) => {
    await setFilter(status);
  };

  const handleApprove = async (id, ownerName) => {
    try {
      await updateFutsalOwnerStatus(id, 'approved');
      showToast.success(`${ownerName}'s application approved successfully! Email sent.`);
      refreshData();
    } catch (error) {
      showToast.error('Failed to approve application');
    }
  };

  const handleReject = async (id, ownerName) => {
    if (window.confirm(`Are you sure you want to reject ${ownerName}'s application?`)) {
      try {
        await updateFutsalOwnerStatus(id, 'rejected');
        showToast.success(`${ownerName}'s application rejected. Email sent.`);
        refreshData();
      } catch (error) {
        showToast.error('Failed to reject application');
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/futsalownerdetails/${id}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-600 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    
    const icons = {
      pending: Clock,
      approved: Check,
      rejected: X,
    };
    
    const Icon = icons[status];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = [
    {
      title: 'Pending Applications',
      value: counts.pending,
      icon: Clock,
      bgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      badgeColor: 'bg-yellow-500'
    },
    {
      title: 'Approved',
      value: counts.approved,
      icon: Check,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      badgeColor: 'bg-green-500'
    },
    {
      title: 'Rejected',
      value: counts.rejected,
      icon: X,
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-500',
      badgeColor: 'bg-red-500'
    },
    {
      title: 'Total Registrations',
      value: counts.total,
      icon: Building2,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      badgeColor: 'bg-blue-500'
    }
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or futsal name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-gray-700"
            />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={refreshData}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} size={20} />
            </button>
            <button className="relative">
              <Bell className="text-gray-600" size={20} />
              {counts.pending > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {counts.pending}
                </span>
              )}
            </button>
            <span className="text-gray-600 text-sm">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Futsal Owner Approvals</h1>
            <p className="text-gray-500">Review and approve futsal owner registration applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={stat.iconColor} size={24} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentFilter === status
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {counts[status]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="animate-spin text-cyan-500" size={40} />
            </div>
          )}

          {/* Applications List */}
          {!isLoading && (
            <div className="space-y-4">
              {futsalOwners.map((owner) => (
                <div 
                  key={owner._id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="bg-gradient-to-r from-cyan-500/5 to-transparent p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                          {owner.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {owner.fullName}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(owner.status)}
                            <span className="text-gray-500 text-sm flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(owner.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Futsal Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="text-cyan-500" size={18} />
                        <h4 className="font-bold text-gray-900 text-lg">{owner.futsalName}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={16} className="text-gray-400" />
                          <span>{owner.futsalLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} className="text-gray-400" />
                          <span>{owner.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} className="text-gray-400" />
                          <span>{owner.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Documents Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Business Doc Uploaded</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Citizenship Doc Uploaded</span>
                      </div>
                      {owner.groundImages?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{owner.groundImages.length} Ground Images</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>Registered {Math.floor((Date.now() - new Date(owner.createdAt)) / (1000 * 60 * 60 * 24))} days ago</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewDetails(owner._id)}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
                        >
                          <Eye size={18} />
                          View Details
                        </button>

                        {owner.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReject(owner._id, owner.fullName)}
                              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
                            >
                              <X size={18} />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(owner._id, owner.fullName)}
                              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
                            >
                              <Check size={18} />
                              Approve
                            </button>
                          </>
                        )}

                        {owner.status === 'approved' && (
                          <span className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
                            ✓ Approved
                          </span>
                        )}

                        {owner.status === 'rejected' && (
                          <span className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium">
                            ✗ Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && futsalOwners.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'No applications match your search criteria.' 
                  : `No ${currentFilter === 'all' ? '' : currentFilter} applications at the moment.`
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && futsalOwners.length > 0 && pagination.pages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {[...Array(pagination.pages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.pages ||
                      (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            pagination.page === pageNumber
                              ? 'bg-cyan-500 text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === pagination.page - 2 ||
                      pageNumber === pagination.page + 2
                    ) {
                      return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FutsalOwnerApprovals;