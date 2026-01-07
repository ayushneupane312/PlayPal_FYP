const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.CLOUD_API_SECRET,
});

console.log('🔧 Cloudinary Config:');
console.log('   Cloud Name:', process.env.CLOUD_NAME);
console.log('   API Key:', process.env.CLOUD_API ? 'Set ✓' : 'Missing ✗');
console.log('   API Secret:', process.env.CLOUD_API_SECRET ? 'Set ✓' : 'Missing ✗');

const uploadToCloudinary = async (filePath) => {
    try {
        console.log('📤 Starting Cloudinary upload...');
        console.log('   File path:', filePath);
        
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
            folder: 'playpal',
            timeout: 120000, // 2 minutes
            chunk_size: 6000000, // 6MB chunks for better upload
            eager_async: true // Process transformations asynchronously
        });
        
        console.log('✅ Cloudinary upload successful!');
        console.log('   URL:', result.secure_url);
        console.log('   Public ID:', result.public_id);
        
        return result;
    } catch (error) {
        console.error('❌ Cloudinary upload failed!');
        console.error('   Error:', error.message);
        console.error('   Error details:', error);
        throw new Error('Cloudinary upload failed: ' + error.message);
    }
};

module.exports = { cloudinary, uploadToCloudinary };