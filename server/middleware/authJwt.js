const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    // Remove Bearer if present
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.userRole === 'admin') {
        next();
        return;
    }
    res.status(403).send({ message: "Require Admin Role!" });
};

module.exports = {
    verifyToken,
    isAdmin
};
