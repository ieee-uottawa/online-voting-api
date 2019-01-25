const voteModel = require('../models/vote_model');

module.exports.getCandidates = async (req, res) => {
    const candidates = await voteModel.getCandidates();

    res.json(candidates);
};

module.exports.submitVote = async ({ auth: { email }, body: { candidates } }, res) => {
    try {
        await voteModel.submitVote(email, candidates);        
        res.status(201).send(null);
    } catch (e) {
        console.error('Failed to submit vote', e.stack);
        res.status(500).send(null);
    }
};