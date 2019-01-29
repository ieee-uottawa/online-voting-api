const app = require('express').Router();

const voteController = require('../controllers/vote_controller');
const { verifyUser } = require('../auth');

app.get('/candidates', voteController.getCandidates);
app.post('/submit', verifyUser, voteController.submitVote);

module.exports = app;
