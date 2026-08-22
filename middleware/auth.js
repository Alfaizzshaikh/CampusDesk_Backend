const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        console.log("Middleware Hit");

        const authHead = req.headers.authorization;

        if (!authHead) {
            return res.status(401).json({
                success: false,
                message: "Token not found"
            });
        }

        const token = authHead.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        console.log("Auth Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

exports.auth = auth;