import React, { useState } from 'react';
import { Search, Bell, Shield, AlertTriangle, DollarSign, CheckCircle, Activity, Eye, ChevronDown } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const FraudDetection = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('all');

  const stats = [
    {
      title: 'Pending Applicaions',
      value: '28',
      icon: AlertTriangle,
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-500',
  
      badgeColor: 'bg-red-500'
    },
   

  ];

  const riskDistribution = [
    { label: 'Critical', range: '(80-100)', count: 3, color: 'bg-red-500' },
    { label: 'High', range: '(60-79)', count: 5, color: 'bg-orange-500' },
    { label: 'Medium', range: '(40-59)', count: 8, color: 'bg-yellow-500' },
    { label: 'Low', range: '(0-39)', count: 12, color: 'bg-green-500' }
  ];

  const fraudCases = [
    {
      id: 'FRAUD-001',
      status: 'Open',
      title: 'Suspicious Payment',
      tags: ['Multiple cards', 'VPN detected', 'New account'],
      description: 'High-risk pattern detected: Multiple payment attempts from different cards within 5 minutes. Account created 2 hours ago.',
      riskScore: 92,
      amount: 450,
      timestamp: '12/8/2024, 10:30:00 AM',
      statusColor: 'bg-red-500/10 text-red-500 border-red-500/20'
    },
    {
      id: 'FRAUD-002',
      status: 'Under Review',
      title: 'Location Mismatch',
      tags: ['Geolocation', 'IP change', 'Unusual activity'],
      description: 'User logged in from different countries within 1 hour. Payment made from suspicious IP address.',
      riskScore: 78,
      amount: 320,
      timestamp: '12/8/2024, 09:15:00 AM',
      statusColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    },
    {
      id: 'FRAUD-003',
      status: 'Open',
      title: 'Chargeback Pattern',
      tags: ['Multiple chargebacks', 'Disputed transaction'],
      description: 'User has initiated 3 chargebacks in the last 30 days. Pattern suggests fraudulent behavior.',
      riskScore: 85,
      amount: 680,
      timestamp: '12/8/2024, 08:45:00 AM',
      statusColor: 'bg-red-500/10 text-red-500 border-red-500/20'
    },
    {
      id: 'FRAUD-004',
      status: 'Resolved',
      title: 'Verification Failed',
      tags: ['Identity verification', 'Document mismatch'],
      description: 'Identity verification documents do not match user profile information. Case resolved - account suspended.',
      riskScore: 71,
      amount: 250,
      timestamp: '12/7/2024, 05:20:00 PM',
      statusColor: 'bg-green-500/10 text-green-500 border-green-500/20'
    },
    {
      id: 'FRAUD-005',
      status: 'Open',
      title: 'Unusual Booking Pattern',
      tags: ['Bulk booking', 'Automated script'],
      description: 'Detected automated booking attempts. Multiple reservations made within seconds using different payment methods.',
      riskScore: 88,
      amount: 1200,
      timestamp: '12/7/2024, 03:10:00 PM',
      statusColor: 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  ];

  const filteredCases = fraudCases.filter(fraudCase => {
    const matchesSearch = fraudCase.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         fraudCase.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = caseFilter === 'all' || fraudCase.status.toLowerCase().replace(' ', '-') === caseFilter;
    return matchesSearch && matchesFilter;
  });

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

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
              placeholder="Search anything..."
              className="flex-1 outline-none text-gray-700"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="text-gray-600" size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
            </button>
            <span className="text-gray-600 text-sm">10:31 AM</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fraud Detection</h1>
            <p className="text-gray-500">AI-powered fraud monitoring and case management</p>
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
                    {stat.badge && (
                      <span className={`${stat.badgeColor} text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              );
            })}
          </div>



          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search case ID or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-700"
                />
              </div>
              
              <select
                value={caseFilter}
                onChange={(e) => setCaseFilter(e.target.value)}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors outline-none cursor-pointer appearance-none pr-10"
              >
                <option value="all">All Cases</option>
                <option value="open">Open</option>
                <option value="under-review">Under Review</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Fraud Cases List */}
          <div className="space-y-4">
            {filteredCases.map((fraudCase) => (
              <div key={fraudCase.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                <div className="bg-gradient-to-r from-red-500/5 to-transparent p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{fraudCase.id}</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${fraudCase.statusColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {fraudCase.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-4xl font-bold mb-1 ${getRiskScoreColor(fraudCase.riskScore)}`}>
                        {fraudCase.riskScore}
                      </div>
                      <p className="text-gray-500 text-xs">Risk Score</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{fraudCase.title}</h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {fraudCase.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 mb-4 bg-gray-50 p-4 rounded-lg">
                    <Shield size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">{fraudCase.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Amount</p>
                        <p className="text-gray-900 font-bold">${fraudCase.amount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Timestamp</p>
                        <p className="text-gray-900 text-sm">{fraudCase.timestamp}</p>
                      </div>
                    </div>

                    <button className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2 font-medium">
                      <Eye size={18} />
                      Investigate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredCases.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Fraud Cases Found</h3>
              <p className="text-gray-500">No cases match your current search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudDetection;