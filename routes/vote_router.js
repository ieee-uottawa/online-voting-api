const app = require('express').Router();

const voteController = require('../controllers/vote_controller');
const { verifyUser } = require('../auth');

app.get('/candidates', require('../canVote'), voteController.getCandidates);
app.post('/submit', require('../canVote'), verifyUser, voteController.submitVote);

module.exports = app;
