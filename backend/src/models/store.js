const mongoose = require( "mongoose");

var storeSchema = new mongoose.Schema({
    file_urls: {
        type: [String],
        required: true,
        default: []
    },
    user_id: {
        type: String,
        required: true
    }
});

exports.Store = mongoose.model('Store', storeSchema);