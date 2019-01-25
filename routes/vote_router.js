const app = require('express').Router();

const voteController = require('../controllers/vote_controller');
const { validateToken } = require('../auth');

app.get('/candidates', voteController.getCandidates);
app.post('/submit', validateToken, voteController.submitVote);

module.exports = app;
