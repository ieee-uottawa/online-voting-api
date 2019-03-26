const jwt = require('jsonwebtoken');

const userModel = require('./models/user_model');

const authRegex = /Bearer (.+)/;

const extractToken = (authHeader) => authRegex.exec(authHeader)[1];

module.exports.extractToken = extractToken;

module.exports.generateToken = (email) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
            if (!err) resolve(token);
            else reject(err);
        });
    });
};

const validateToken = (req, res, next) => {
    const { headers: { authorization } } = req;
    const token = extractToken(authorization);
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (!err) {
            req.auth = decoded;
            next();
        }
        else {
            console.error('Invalid token', err);
            res.status(401).send(null);
        }
    });
};

module.exports.validateToken = validateToken;

const validateUser = async (email, res, next) => {
    const hasVoted = await userModel.hasUserVoted(email);
    if (hasVoted) {
        console.log(`User ${email} has already voted!`);
        return res.status(409).send(null);
    }

    next();
};

module.exports.verifyUser = async (req, res, next) => {
    const { body: { email } } = req;

    if (!email) {
        validateToken(req, res, async () => {
            const { auth: { email } } = req;
            await validateUser(email, res, next);
        });
    } else {
        await validateUser(email, res, next);
    }
};
