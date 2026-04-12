import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, User, Building2, FileText, Image as ImageIcon } from 'lucide-react';
import { useFutsalOwnerStore } from '../store/futsalOwnerFormStore.js';
import { useAuthStore } from '../store/authStore.js';
import { showToast } from './components/Toast';

// Import components
import FormInput from './components/FormInput';
import FormSection from './components/FormSection';
import FileUpload from './components/FileUpload';
import ImageUpload from './components/ImageUpload';
import PhoneInput from '../components/PhoneInput';
import { getPhoneValidationError } from '../utils/phoneValidation';

export default function FormPage() {
  const navigate = useNavigate();
  
  // ✅ Get user from authStore
  const { user, isAuthenticated } = useAuthStore();
  
  const {
    registerFutsalOwner,
    resetState,
    isLoading,
    error,
    success
  } = useFutsalOwnerStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    futsalName: '',
    futsalLocation: '',
    googleMapLink: '',
    businessContact: '',
    businessDoc: null,
    citizenshipDoc: null,
    groundImages: []
  });

  // ✅ Check authentication on component mount
  useEffect(() => {
    console.log('🔍 Checking authentication...');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      showToast.error('Please login first');
      navigate('/login');
      return;
    }

    if (!user || user.role !== "futsalowner")  {
      console.log('❌ Wrong role:', user?.role);
      showToast.error('Only futsal owners can access this page');
      navigate('/');
      return;
    }

    if (!user?.isVerified) {
      console.log('❌ Email not verified');
      showToast.error('Please verify your email first');
      navigate('/verify-email');
      return;
    }

    if (user?.registrationCompleted) {
      console.log('✅ Already registered, redirecting to status');
      showToast.info('You have already submitted your registration');
      navigate('/applicationstatus');
      return;
    }

    console.log('✅ All checks passed, pre-filling form');
    // ✅ Pre-fill form with user data
    setFormData(prev => ({
      ...prev,
      fullName: user.name || '',
      email: user.email || ''
    }));
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('File size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.groundImages.length + files.length > 10) {
      showToast.warning('Maximum 10 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error(`${file.name} is too large. Max 5MB per image.`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({ 
      ...prev, 
      groundImages: [...prev.groundImages, ...validFiles] 
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      groundImages: prev.groundImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.email) {
      showToast.error('Please fill in all personal information');
      return;
    }
    const phoneErr = getPhoneValidationError(formData.phone);
    if (phoneErr) {
      showToast.error(phoneErr);
      return;
    }

    if (!formData.futsalName || !formData.futsalLocation) {
      showToast.error('Please fill in all futsal information');
      return;
    }
    const businessPhoneErr = getPhoneValidationError(formData.businessContact);
    if (businessPhoneErr) {
      showToast.error(businessPhoneErr);
      return;
    }

    if (!formData.businessDoc) {
      showToast.error('Please upload Business Registration Document');
      return;
    }

    if (!formData.citizenshipDoc) {
      showToast.error('Please upload Citizenship/ID Document');
      return;
    }

    const submitData = new FormData();
    
    // Append text fields
    Object.keys(formData).forEach(key => {
      if (key !== 'businessDoc' && key !== 'citizenshipDoc' && key !== 'groundImages') {
        submitData.append(key, formData[key]);
      }
    });
    
    // Append files
    if (formData.businessDoc) {
      submitData.append('businessDoc', formData.businessDoc);
    }
    if (formData.citizenshipDoc) {
      submitData.append('citizenshipDoc', formData.citizenshipDoc);
    }
    
    // Append multiple images
    formData.groundImages.forEach((image) => {
      submitData.append('groundImages', image);
    });

    try {

      await registerFutsalOwner(submitData);
      showToast.success('Registration submitted successfully!');
      
      // Clear form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        futsalName: '',
        futsalLocation: '',
        googleMapLink: '',
        businessContact: '',
        businessDoc: null,
        citizenshipDoc: null,
        groundImages: []
      });
      
      // Reset file inputs
      const businessDocInput = document.getElementById('businessDoc');
      const citizenshipDocInput = document.getElementById('citizenshipDoc');
      const groundImagesInput = document.getElementById('groundImages');
      
      if (businessDocInput) businessDocInput.value = '';
      if (citizenshipDocInput) citizenshipDocInput.value = '';
      if (groundImagesInput) groundImagesInput.value = '';

      // Redirect to application status
      setTimeout(() => {
        navigate('/applicationstatus');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      showToast.error(error.response?.data?.message || 'Failed to submit registration');
    }
  };

  // Show error toast if error exists
  useEffect(() => {
    if (error) {
      showToast.error(error);
      setTimeout(() => {
        resetState();
      }, 1000);
    }
  }, [error, resetState]);

  // Show success toast
  useEffect(() => {
    if (success) {
      showToast.success("Registration submitted successfully!");
      setTimeout(() => {
        resetState();
      }, 1000);
    }
  }, [success, resetState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Futsal Owner Registration</h1>
          <p className="text-gray-600">
            Complete the form below to register your futsal business. All fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner Information */}
          <FormSection
            icon={User}
            title="Owner Information"
            description="Personal details of the futsal owner"
          >
            <FormInput
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="owner@example.com"
              icon={Mail}
              required
              disabled
            />

            <PhoneInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="9841234567 or +9779841234567"
            />
          </FormSection>

          {/* Futsal Business Info */}
          <FormSection
            icon={Building2}
            title="Futsal Business Info"
            description="Details about your futsal business"
          >
            <FormInput
              label="Futsal Name"
              name="futsalName"
              value={formData.futsalName}
              onChange={handleInputChange}
              placeholder="Enter futsal name"
              required
            />

            <FormInput
              label="Futsal Location"
              name="futsalLocation"
              value={formData.futsalLocation}
              onChange={handleInputChange}
              placeholder="Address or area"
              icon={MapPin}
              required
            />

            <FormInput
              label="Google Map Link"
              name="googleMapLink"
              type="url"
              value={formData.googleMapLink}
              onChange={handleInputChange}
              placeholder="https://maps.google.com/..."
            />

            <PhoneInput
              label="Business Contact"
              name="businessContact"
              value={formData.businessContact}
              onChange={handleInputChange}
              required
              placeholder="9841234567 or +9779841234567"
            />
          </FormSection>

          {/* Business Documents */}
          <FormSection
            icon={FileText}
            title="Business Documents"
            description="Upload required business and identification documents (Max 5MB per file)"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <FileUpload
                id="businessDoc"
                label="Business Registration Document"
                selectedFile={formData.businessDoc}
                onChange={(e) => handleFileUpload(e, 'businessDoc')}
                required
              />

              <FileUpload
                id="citizenshipDoc"
                label="Citizenship / ID Document"
                selectedFile={formData.citizenshipDoc}
                onChange={(e) => handleFileUpload(e, 'citizenshipDoc')}
                required
              />
            </div>
          </FormSection>

          {/* Futsal Images */}
          <FormSection
            icon={ImageIcon}
            title="Futsal Images"
            description="Upload photos of your futsal ground (Max 10 images, 5MB each)"
          >
            <ImageUpload
              id="groundImages"
              label="Futsal Ground Images"
              selectedImages={formData.groundImages}
              onChange={handleImageUpload}
              onRemove={handleRemoveImage}
              maxImages={10}
            />
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

