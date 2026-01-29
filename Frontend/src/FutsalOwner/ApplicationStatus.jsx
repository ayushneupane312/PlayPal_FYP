import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useFutsalOwnerStore } from '../store/futsalOwnerFormStore';
import { useAuthStore } from '../store/authStore';
import { showToast } from './components/Toast';

const ApplicationStatus = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const { getMyApplication, isLoading } = useFutsalOwnerStore();
    const [applicationData, setApplicationData] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            showToast.error('Please login first');
            navigate('/login');
            return;
        }

        if (user?.role !== 'futsalowner') {
            showToast.error('Access denied');
            navigate('/');
            return;
        }

        fetchApplicationStatus();
    }, []);

    const fetchApplicationStatus = async () => {
        try {
            const response = await getMyApplication();
            setApplicationData(response.data);
        } catch (error) {
            showToast.error('Failed to fetch application status');
        }
    };

    const getStatusIcon = () => {
        const status = applicationData?.applicationStatus;
        if (status === 'pending') {
            return <Clock className="w-16 h-16 text-amber-500" />;
        } else if (status === 'approved') {
            return <CheckCircle className="w-16 h-16 text-emerald-500" />;
        } else if (status === 'rejected') {
            return <XCircle className="w-16 h-16 text-red-500" />;
        }
        return <Building2 className="w-16 h-16 text-gray-400" />;
    };

    const getStatusMessage = () => {
        const status = applicationData?.applicationStatus;
        if (status === 'pending') {
            return {
                title: 'Application Under Review',
                message: 'Your futsal registration is being reviewed by our admin team. You will receive an email once the review is complete.',
                color: 'amber'
            };
        } else if (status === 'approved') {
            return {
                title: 'Application Approved! 🎉',
                message: 'Congratulations! Your futsal has been approved. You can now login and access your dashboard.',
                color: 'emerald'
            };
        } else if (status === 'rejected') {
            return {
                title: 'Application Rejected',
                message: 'Unfortunately, your application has been rejected. Please contact support for more information.',
                color: 'red'
            };
        }
        return {
            title: 'No Application Found',
            message: 'You have not submitted a registration form yet.',
            color: 'gray'
        };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const statusInfo = getStatusMessage();
    const futsalOwner = applicationData?.futsalOwner;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            {getStatusIcon()}
                        </div>
                        <h1 className={`text-3xl font-bold mb-2 text-${statusInfo.color}-600`}>
                            {statusInfo.title}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {statusInfo.message}
                        </p>
                    </div>

                    {/* Application Details */}
                    {futsalOwner && (
                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Application Details</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-600" />
                                        Futsal Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Name: </span>
                                            <span className="font-medium">{futsalOwner.futsalName}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <span className="font-medium">{futsalOwner.futsalLocation}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-900 mb-3">Contact Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{futsalOwner.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{futsalOwner.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center text-sm text-gray-500">
                                Submitted on {new Date(futsalOwner.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex justify-center gap-4">
                        {applicationData?.applicationStatus === 'approved' && (
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all"
                            >
                                Go to Login
                            </button>
                        )}
                        {applicationData?.applicationStatus === 'pending' && (
                            <button
                                onClick={fetchApplicationStatus}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                            >
                                Refresh Status
                            </button>
                        )}
                        {!applicationData?.registrationCompleted && (
                            <button
                                onClick={() => navigate('/futsal-registration')}
                                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all"
                            >
                                Complete Registration
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationStatus;