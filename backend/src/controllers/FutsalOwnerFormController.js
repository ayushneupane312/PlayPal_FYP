const FutsalOwner = require('../models/FutsalOwnerForm.js');
const fs = require('fs').promises;
const path = require('path');

const { sendFutsalOwnerApprovalEmail, sendFutsalOwnerPendingEmail, sendFutsalOwnerRejectionEmail, sendAdminNewRegistrationNotification} = require ("../mailtrap/emails")

exports.registerFutsalOwner = async (req, res) => {
  try {
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

    // Check if email already exists
    const existingOwner = await FutsalOwner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
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
      data: futsalOwner
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

exports.getAllFutsalOwners = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = status ? { status } : {};
    
    // Execute query with pagination
    const futsalOwners = await FutsalOwner.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Get total count
    const total = await FutsalOwner.countDocuments(query);

    res.status(200).json({
      success: true,
      data: futsalOwners,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
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

// @desc    Get single futsal owner by ID
// @route   GET /api/futsal-owners/:id
// @access  Public
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
    
    // Handle invalid MongoDB ID
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

exports.updateFutsalOwnerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, approved, or rejected'
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

    // Update status
    futsalOwner.status = status;
    futsalOwner.statusUpdatedAt = new Date();
    await futsalOwner.save();

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

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// @desc    Delete futsal owner
// @route   DELETE /api/futsal-owners/:id
// @access  Private/Admin
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

    // Delete files asynchronously
    for (const filePath of filesToDelete) {
      if (filePath) {
        try {
          await fs.unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err.message);
          // Continue even if file deletion fails
        }
      }
    }

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