const app = require('express').Router();

const usersController = require('../controllers/users_controller');

app.post('/verify', usersController.verifyUser);

module.exports = app;
