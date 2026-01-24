import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Download,
  FileText,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  User,
  Clock,
  Bell
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFutsalOwnerStore } from '../store/futsalOwnerFormStore';
import { showToast } from '../FutsalOwner/components/Toast';
import AdminSidebar from './AdminSidebar';

const FutsalOwnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const {
    currentFutsalOwner,
    isLoading,
    getFutsalOwnerById,
    updateFutsalOwnerStatus,
    clearCurrentOwner
  } = useFutsalOwnerStore();

  useEffect(() => {
    if (id) {
      getFutsalOwnerById(id);
    }

   
  }, [id]);

  const handleApprove = async () => {
    try {
      await updateFutsalOwnerStatus(id, 'approved');
      showToast.success(`${currentFutsalOwner.fullName}'s application approved! Email sent.`);
      setTimeout(() => navigate('/admin/futsal-approvals'), 1500);
    } catch (error) {
      showToast.error('Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (window.confirm(`Are you sure you want to reject ${currentFutsalOwner.fullName}'s application?`)) {
      try {
        await updateFutsalOwnerStatus(id, 'rejected');
        showToast.success(`${currentFutsalOwner.fullName}'s application rejected. Email sent.`);
        setTimeout(() => navigate('/admin/futsal-approvals'), 1500);
      } catch (error) {
        showToast.error('Failed to reject application');
      }
    }
  };

  const downloadFile = (filePath) => {
  window.open(`http://localhost:5000/${filePath}`, '_self');
};




  if (isLoading || !currentFutsalOwner) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading application details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const owner = currentFutsalOwner;

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500 text-white',
      approved: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white',
    };
    return styles[status];
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/futsal-approvals')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Application Details</h1>
              <p className="text-sm text-gray-500">Review complete application information</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="text-gray-600" size={20} />
            </button>
            <span className="text-gray-600 text-sm">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 max-w-6xl mx-auto">
          {/* Status Banner */}
          <div className={`${getStatusBadge(owner.status)} rounded-xl p-6 mb-6 flex items-center justify-between`}>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Application Status: {owner.status.toUpperCase()}
              </h2>
              <p className="text-white/90">
                Submitted on {new Date(owner.createdAt).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            {owner.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 font-medium backdrop-blur-sm"
                >
                  <X size={18} />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                >
                  <Check size={18} />
                  Approve Application
                </button>
              </div>
            )}
          </div>

          {/* Owner Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                {owner.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{owner.fullName}</h3>
                <p className="text-gray-500">Futsal Owner Applicant</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard icon={Mail} label="Email Address" value={owner.email} />
              <InfoCard icon={Phone} label="Phone Number" value={owner.phone} />
              <InfoCard icon={Calendar} label="Registration Date" value={new Date(owner.createdAt).toLocaleString()} />
              <InfoCard icon={Clock} label="Days Since Registration" 
                value={`${Math.floor((Date.now() - new Date(owner.createdAt)) / (1000 * 60 * 60 * 24))} days`} 
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-cyan-600" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Business Information</h3>
                <p className="text-sm text-gray-500">Futsal facility details</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard icon={Building2} label="Futsal Name" value={owner.futsalName} />
              <InfoCard icon={MapPin} label="Location" value={owner.futsalLocation} />
              <InfoCard icon={Phone} label="Business Contact" value={owner.businessContact} />
              {owner.googleMapLink && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Google Maps</p>
                    
                      href={owner.googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                    
                      View Location <ExternalLink size={14} />
                 
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Uploaded Documents</h3>
                <p className="text-sm text-gray-500">Registration and identification documents</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <DocumentCard
                title="Business Registration"
                filePath={owner.businessDoc}
                onDownload={() => downloadFile(owner.businessDoc)}
              />
              <DocumentCard
                title="Citizenship / ID Document"
                filePath={owner.citizenshipDoc}
                onDownload={() => downloadFile(owner.citizenshipDoc)}
              />
            </div>
          </div>

          {/* Ground Images */}
          {owner.groundImages && owner.groundImages.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="text-purple-600" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ground Images</h3>
                  <p className="text-sm text-gray-500">{owner.groundImages.length} images uploaded</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {owner.groundImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`http://localhost:5000/${image}`}
                      alt={`Ground ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => setSelectedImage(`http://localhost:5000/${image}`)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => downloadFile(image, `ground-image-${index + 1}.jpg`)}
                        className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

// Helper Components
function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DocumentCard({ title, filePath, onDownload }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
  
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-cyan-500 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full" title="Uploaded"></div>
      </div>
      
      {isImage && (
        <img
          src={`http://localhost:5000/${filePath}`}
          alt={title}
          className="w-full h-32 object-cover rounded mb-3"
        />
      )}
      
      <button
        onClick={onDownload}
        className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <Download size={16} />
        Download
      </button>
    </div>
  );
}

export default FutsalOwnerDetails;