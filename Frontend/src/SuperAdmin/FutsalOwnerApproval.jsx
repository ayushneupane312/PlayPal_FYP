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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
 
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
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
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
  
      bgColor: 'bg-amber-50',
    
      borderColor: 'border-l-amber-500'
    },
    {
      title: 'Approved',
      value: counts.approved,

      bgColor: 'bg-emerald-50',
     
      borderColor: 'border-l-emerald-500'
    },
    {
      title: 'Rejected',
      value: counts.rejected,
   
      bgColor: 'bg-red-50',
   
      borderColor: 'border-l-red-500'
    },
    {
      title: 'Total Registrations',
      value: counts.total,
  
      bgColor: 'bg-blue-50',
   
      borderColor: 'border-l-blue-500'
    }
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* Header */}
      

        {/* Main Content */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Futsal Owner Approvals</h1>
            <p className="text-gray-600">Review and approve futsal owner registration applications</p>
          </div>

          {/* Stats Cards - Updated with Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl border-l-4 ${stat.borderColor} border-t border-r border-b border-gray-100 shadow-sm p-6 hover:shadow-md transition-all`}
                >
                 
                  <p className="text-gray-600 text-sm mb-2 font-medium">{stat.title}</p>
                  <h3 className="text-4xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    currentFilter === status
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      currentFilter === status ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
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
              <RefreshCw className="animate-spin text-emerald-500" size={40} />
            </div>
          )}

          {/* Applications List */}
          {!isLoading && (
            <div className="space-y-4">
              {futsalOwners.map((owner) => (
                <div 
                  key={owner._id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="bg-gradient-to-r from-emerald-50 to-transparent p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
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
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="text-emerald-600" size={20} />
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
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Business Doc Uploaded</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Citizenship Doc Uploaded</span>
                      </div>
                      {owner.groundImages?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span>{owner.groundImages.length} Ground Images</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>Registered {Math.floor((Date.now() - new Date(owner.createdAt)) / (1000 * 60 * 60 * 24))} days ago</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewDetails(owner._id)}
                          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
                        >
                          <Eye size={18} />
                          View Details
                        </button>

                        {owner.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReject(owner._id, owner.fullName)}
                              className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
                            >
                              <X size={18} />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(owner._id, owner.fullName)}
                              className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium"
                            >
                              <Check size={18} />
                              Approve
                            </button>
                          </>
                        )}

                        {owner.status === 'approved' && (
                          <span className="px-6 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg font-medium flex items-center gap-2">
                            <Check size={18} />
                            Approved
                          </span>
                        )}

                        {owner.status === 'rejected' && (
                          <span className="px-6 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium flex items-center gap-2">
                            <X size={18} />
                            Rejected
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
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
                              ? 'bg-emerald-500 text-white'
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