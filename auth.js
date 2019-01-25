const jwt = require('jsonwebtoken');

const authRegex = /Bearer (.+)/;

const extractToken = (authHeader) => authRegex.exec(authHeader)[1];

module.exports.generateToken = (email) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
            if (!err) resolve(token);
            else reject(err);
        });
    });
};

module.exports.validateToken = (req, res, next) => {
    const { headers: { authorization } } = req;
    const token = extractToken(authorization);
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (!err) {
            req.auth = decoded
            next();
        }
        else {
            console.error('Invalid token', err);
            res.status(401).send(null);
        };
    });
};

module.exports.extractToken = extractToken;