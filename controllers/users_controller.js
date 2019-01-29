const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');

const { generateToken, extractToken } = require('../auth');
const userModel = require('../models/user_model');

const readFileAsync = promisify(fs.readFile);

module.exports.verifyUser = async ({ headers: { authorization } }, res) => {
    console.log('verifying user');
    const idToken = extractToken(authorization);
    let token = null;

    if (idToken === 'undefined') {
        console.log('token is undefined');
        return res.status(400).send(null);
    } else {
        const { client_id: clientID } = await getCredentials();
        const { data: { aud, email, hd } } = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo', { params: { 'id_token': idToken } });

        if (aud === clientID) {
            if (!email.endsWith('@uottawa.ca') || hd !== 'uottawa.ca') {
                console.log(`User ${email} logged in with an invalid email`);
                return res.status(401).send(null);
            } else {
                token = await generateToken(email);
            }
        } else {
            console.log('Invalid Google credentials');
            return res.status(500).send(null);
        }

        const canVote = await userModel.canUserVote(email);
        if (!canVote) {
            console.log(`User ${email} is not allowed to vote!`);
            return res.status(401).send(null);
        }

        const hasVoted = await userModel.hasUserVoted(email);
        if (hasVoted) {
            console.log(`User ${email} has already voted!`);
            return res.status(409).send(null);
        }
    }

    return res.status(200).send(token);
};

async function getCredentials() {
    return JSON.parse(await readFileAsync('./credentials.json')).web;
}
