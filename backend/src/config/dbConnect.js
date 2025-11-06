const { default: mongoose } = require("mongoose");
const dbConnect = () => {
  try {
    const conn = mongoose.connect('mongodb://localhost:27017/PlayPal');
    console.log("database connection successful");
  } catch (error) {
    console.log("database error");
  }
};

module.exports = dbConnect;