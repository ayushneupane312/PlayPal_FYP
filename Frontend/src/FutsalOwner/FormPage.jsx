import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, User, Building2, FileText, Image as ImageIcon } from 'lucide-react';
import { useFutsalOwnerStore } from '../store/futsalOwnerFormStore.js';
import { showToast } from './components/Toast'; // ✅ Import toast utility

// Import components
import FormInput from './components/FormInput';
import FormSection from './components/FormSection';
import FileUpload from './components/FileUpload';
import ImageUpload from './components/ImageUpload';

export default function FutsalRegistration() {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.groundImages.length + files.length <= 10) {
      setFormData(prev => ({ 
        ...prev, 
        groundImages: [...prev.groundImages, ...files] 
      }));
    } else {
      showToast.warning('Maximum 10 images allowed'); // ✅ Toast warning
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      groundImages: prev.groundImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Manual validation for required files
    if (!formData.businessDoc) {
      showToast.error('Please upload Business Registration Document'); // ✅ Toast error
      return;
    }

    if (!formData.citizenshipDoc) {
      showToast.error('Please upload Citizenship/ID Document'); // ✅ Toast error
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

    // ✅ Use toast.promise for async operation
    showToast.promise(
      registerFutsalOwner(submitData),
      {
        loading: 'Submitting your registration...',
        success: "Registration submitted successfully! We'll review your application soon.",
        error: 'Failed to submit registration. Please try again.',
      }
    );
  };

  // ✅ Show toast on success/error from store
  useEffect(() => {
    if (success) {
      // Toast is already shown by promise, just reset form
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

      // Reset store state
      setTimeout(() => {
        resetState();
      }, 1000);
    }
  }, [success, resetState]);

  // ✅ Show error toast if error exists
  useEffect(() => {
    if (error) {
      showToast.error(error);
      // Auto-clear error after showing
      setTimeout(() => {
        resetState();
      }, 1000);
    }
  }, [error, resetState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Register Futsal Owner</h1>
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
            />

            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+977 9800000000"
              icon={Phone}
              required
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

            <FormInput
              label="Business Contact"
              name="businessContact"
              type="tel"
              value={formData.businessContact}
              onChange={handleInputChange}
              placeholder="+977 01-XXXXXXX"
              icon={Phone}
              required
            />
          </FormSection>

          {/* Business Documents */}
          <FormSection
            icon={FileText}
            title="Business Documents"
            description="Upload required business and identification documents"
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
            description="Upload photos of your futsal ground to showcase your facility"
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
                'Register Futsal Business'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}