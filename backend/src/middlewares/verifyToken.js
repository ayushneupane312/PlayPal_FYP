const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Check for token in Authorization header (Bearer token) or cookies
    let token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!decoded) {
            return res.status(401).json({ success: false, message: "Not authorized invalid token" });
        }
        
        req.userId = decoded.id;
        next();

    } catch (error) {
        console.log("error in verifyToken ", error);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = verifyToken;