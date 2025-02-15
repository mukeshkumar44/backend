const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // Check for Authorization Header
    if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(' ')[1];
        try {
            // Check if JWT_SECRET is defined
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: "Server error: JWT_SECRET is not defined" });
            }

            // Verify Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach decoded token to req.user
            req.user = decoded;
            next();

        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }
};

module.exports = authMiddleware;
