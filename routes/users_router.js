const app = require('express').Router();

const usersController = require('../controllers/users_controller');
const { verifyUser } = require('../auth');

app.post('/verify', verifyUser, usersController.verifyUser);

module.exports = app;
