const FutsalOwner = require('../models/futsalOwnerForm.js');
const User = require('../models/UserModel.js');
const fs = require('fs').promises;
const path = require('path');

const { 
    sendFutsalOwnerApprovalEmail, 
    sendFutsalOwnerPendingEmail, 
    sendFutsalOwnerRejectionEmail, 
    sendAdminNewRegistrationNotification
} = require("../mailtrap/emails");

// ✅ Register Futsal Owner (Protected - requires authentication)
exports.registerFutsalOwner = async (req, res) => {
    try {
        const userId = req.userId; // ✅ From verifyToken middleware

        // Check if user exists and is a futsal owner
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please login first.'
            });
        }

        if (user.role !== 'futsalowner') {
            return res.status(403).json({
                success: false,
                message: 'Only futsal owners can submit this form'
            });
        }

        // Check if user verified email
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        // Check if already registered
        if (user.registrationCompleted) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted your registration form'
            });
        }

        const {
            fullName,
            email,
            phone,
            futsalName,
            futsalLocation,
            googleMapLink,
            businessContact
        } = req.body;

        // Validate required fields
        if (!fullName || !email || !phone || !futsalName || !futsalLocation || !businessContact) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Handle file uploads
        const businessDoc = req.files?.businessDoc?.[0]?.path;
        const citizenshipDoc = req.files?.citizenshipDoc?.[0]?.path;
        const groundImages = req.files?.groundImages?.map(file => file.path) || [];

        // Validate required documents
        if (!businessDoc || !citizenshipDoc) {
            return res.status(400).json({
                success: false,
                message: 'Business registration and citizenship documents are required'
            });
        }

        // Create new futsal owner
        const futsalOwner = await FutsalOwner.create({
            fullName,
            email,
            phone,
            futsalName,
            futsalLocation,
            googleMapLink: googleMapLink || '',
            businessContact,
            businessDoc,
            citizenshipDoc,
            groundImages,
            status: 'pending'
        });

        // ✅ Update user record
        user.futsalOwnerRef = futsalOwner._id;
        user.registrationCompleted = true;
        user.applicationStatus = 'pending';
        await user.save();

        // ✅ Send confirmation email to owner
        try {
            await sendFutsalOwnerPendingEmail(futsalOwner);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        // ✅ Send notification to admin
        try {
            await sendAdminNewRegistrationNotification(futsalOwner);
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully! You will receive an email once reviewed.',
            data: {
                applicationId: futsalOwner._id,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register futsal owner',
            error: error.message
        });
    }
};

// ✅ Get user's own application status
exports.getMyApplication = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).populate('futsalOwnerRef');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                registrationCompleted: user.registrationCompleted,
                applicationStatus: user.applicationStatus,
                futsalOwner: user.futsalOwnerRef
            }
        });

    } catch (error) {
        console.error('Get my application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch application status'
        });
    }
};

// ✅ Get all futsal owners (Admin only)
exports.getAllFutsalOwners = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, search } = req.query;
        
        // Build query
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { futsalName: { $regex: search, $options: 'i' } },
                { futsalLocation: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Execute query with pagination
        const futsalOwners = await FutsalOwner.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        // Get total count
        const total = await FutsalOwner.countDocuments(query);

        // Get status counts
        const counts = await FutsalOwner.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusCounts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: total
        };

        counts.forEach(item => {
            statusCounts[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            data: futsalOwners,
            counts: statusCounts,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch futsal owners',
            error: error.message
        });
    }
};

// ✅ Get single futsal owner by ID (Admin only)
exports.getFutsalOwnerById = async (req, res) => {
    try {
        const futsalOwner = await FutsalOwner.findById(req.params.id).select('-__v');
        
        if (!futsalOwner) {
            return res.status(404).json({
                success: false,
                message: 'Futsal owner not found'
            });
        }

        res.status(200).json({
            success: true,
            data: futsalOwner
        });

    } catch (error) {
        console.error('Fetch error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Futsal owner not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch futsal owner',
            error: error.message
        });
    }
};

// ✅ Update futsal owner status (Admin only)
exports.updateFutsalOwnerStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const adminId = req.userId;
        
        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: approved or rejected'
            });
        }

        // Find futsal owner
        const futsalOwner = await FutsalOwner.findById(req.params.id);

        if (!futsalOwner) {
            return res.status(404).json({
                success: false,
                message: 'Futsal owner not found'
            });
        }

        // Update futsal owner status
        futsalOwner.status = status;
        futsalOwner.statusUpdatedAt = new Date();
        futsalOwner.statusUpdatedBy = adminId;
        futsalOwner.adminNotes = adminNotes || '';
        await futsalOwner.save();

        // ✅ Update user record
        const user = await User.findOne({ futsalOwnerRef: futsalOwner._id });
        if (user) {
            user.applicationStatus = status;
            if (status === 'approved') {
                user.status = 'active'; // ✅ Activate user
            }
            await user.save();

            // ✅ Send appropriate email
            let emailSent = false;
            try {
                if (status === 'approved') {
                    await sendFutsalOwnerApprovalEmail(futsalOwner);
                    emailSent = true;
                } else if (status === 'rejected') {
                    await sendFutsalOwnerRejectionEmail(futsalOwner);
                    emailSent = true;
                }
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
            }

            res.status(200).json({
                success: true,
                message: `Status updated to ${status}${emailSent ? '. Email notification sent.' : ''}`,
                data: futsalOwner
            });
        } else {
            res.status(200).json({
                success: true,
                message: `Status updated to ${status}`,
                data: futsalOwner
            });
        }

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};

// ✅ Delete futsal owner (Admin only)
exports.deleteFutsalOwner = async (req, res) => {
    try {
        const futsalOwner = await FutsalOwner.findById(req.params.id);
        
        if (!futsalOwner) {
            return res.status(404).json({
                success: false,
                message: 'Futsal owner not found'
            });
        }

        // Delete associated files from filesystem
        const filesToDelete = [
            futsalOwner.businessDoc,
            futsalOwner.citizenshipDoc,
            ...futsalOwner.groundImages
        ];

        for (const filePath of filesToDelete) {
            if (filePath) {
                try {
                    await fs.unlink(filePath);
                    console.log(`Deleted file: ${filePath}`);
                } catch (err) {
                    console.error(`Failed to delete file: ${filePath}`, err.message);
                }
            }
        }

        // ✅ Update user record
        await User.findOneAndUpdate(
            { futsalOwnerRef: futsalOwner._id },
            { 
                $unset: { futsalOwnerRef: 1 },
                registrationCompleted: false,
                applicationStatus: 'none'
            }
        );

        // Delete from database
        await FutsalOwner.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Futsal owner deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Futsal owner not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to delete futsal owner',
            error: error.message
        });
    }
};