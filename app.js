/*
This is a sample bot application for RingCentral. Learn more about this 
app by following the instructions found at the URL below:
https://developers.ringcentral.com/guide/team-messaging/bots/walkthrough/

Copyright: 2021 - RingCentral, Inc.
License: MIT
*/
require('dotenv').config();

const { extendApp }      = require('ringcentral-chatbot-core');
const express            = require('express');
const axios              = require('axios');
const crypto             = require('crypto');

// load handlers for the bot and interactive messaging
const { botHandler }     = require('./botHandler');
const { messageHandler } = require('./messageHandler');

const PORT       = process.env.PORT || 3000
const skills     = [];
const botOptions = {
    adminRoute: '/admin', // optional
    botRoute:   '/bot',   // optional
    models:     {}        // optional
}

const app = express();
extendApp(app, skills, botHandler, botOptions);
app.listen(PORT)

console.log(`Server is running on port ${PORT}`);
console.log(`Bot OAuth URI: ${process.env.RINGCENTRAL_CHATBOT_SERVER}${botOptions.botRoute}/oauth`);

app.post('/interactive-messages', async (req, res) => {
    try {
        // Shared secret can be found on RingCentral developer portal, under your app Settings
        const SHARED_SECRET = process.env.IM_SHARED_SECRET;
        if (SHARED_SECRET) {
            const signature = req.get('X-Glip-Signature', 'sha1=');
            const encryptedBody =
                  crypto.createHmac('sha1', SHARED_SECRET).update(JSON.stringify(req.body)).digest('hex');
            if (encryptedBody !== signature) {
                res.status(401).send('Incorrect SHARED_SECRET.');
                return;
            }
            await messageHandler(req,res);
        } else {
	    console.log("ERROR: Cannot process webhooks from RingCentral. Please set IM_SHARED_SECRET.")
	}
    } catch (e) {
        console.log(e);
    }
    
    if (res.headersSent) {
	console.log("headers have been sent, this must be a dialog")
	// do nothing as response is concluded
    } else {
	console.log("headers not sent, then all we need to do is acknowledge")
	res.status(200);
	res.json('OK');
    }
});

// This handles some routine maintenance. Let's not worry about this right now. 
setInterval(() => {
    axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`, undefined, {
        auth: {
            username: process.env.RINGCENTRAL_CHATBOT_ADMIN_USERNAME,
            password: process.env.RINGCENTRAL_CHATBOT_ADMIN_PASSWORD
        }
    })
    axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/ringcentral/refresh-tokens`)
}, 86400000)

exports.app = app;
