const FutsalOwner = require('../models/FutsalOwnerForm.js');
const fs = require('fs').promises;
const path = require('path');

// @desc    Register Futsal Owner
// @route   POST /api/futsal-owners/register
// @access  Public
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
      groundImages
    });

    res.status(201).json({
      success: true,
      message: 'Futsal owner registered successfully',
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

// @desc    Get all futsal owners
// @route   GET /api/futsal-owners
// @access  Public
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

// @desc    Update futsal owner status
// @route   PATCH /api/futsal-owners/:id/status
// @access  Private/Admin
exports.updateFutsalOwnerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be: pending, approved, or rejected'
      });
    }

    // Find and update
    const futsalOwner = await FutsalOwner.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!futsalOwner) {
      return res.status(404).json({
        success: false,
        message: 'Futsal owner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status} successfully`,
      data: futsalOwner
    });

  } catch (error) {
    console.error('Update error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Futsal owner not found'
      });
    }
    
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