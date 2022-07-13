const { Template }   = require('adaptivecards-templating');
const Bot            = require('ringcentral-chatbot-core/dist/models/Bot').default;
const helloCard      = require('./cards/helloCard.json');
const promptCard     = require('./cards/promptCard.json');
const helpCard       = require('./cards/helpCard.json');

const handleHelpAction = (cardData) => {
    const promise = new Promise( (resolve, reject) => {
	const template = new Template(helpCard);
	const card = template.expand({ $root: cardData });
	resolve( card )
    })
    return promise
}

const handlePromptAction = (cardData) => {
    const promise = new Promise( (resolve, reject) => {
	const template = new Template(promptCard);
	const card = template.expand({ $root: cardData });
	resolve( card )
    })
    return promise
}

const handleHelloAction = (cardData) => {
    const promise = new Promise( (resolve, reject) => {
	const template = new Template(helloCard);
	const card = template.expand({ $root: cardData });
	resolve( card )
    })
    return promise
}

const messageHandler = async (req,res) => {
    console.log("=====incomingCardSubmit=====")
    console.log(`${JSON.stringify(req.body, null, 2)}`);

    const submitData = req.body.data;
    const cardId     = req.body.card.id;
    const bot        = await Bot.findByPk(submitData.botId); 

    let cardData = {
        'botId':   submitData.botId,
        'groupId': submitData.groupId,
	'userId':  req.body.user.id
    }

    switch (submitData.actionType) {
    case 'help': {
	console.log(`Prompting user with a help message`);
	handleHelpAction( cardData ).then( card => {
	    console.log(`DEBUG: sending help card: `, card)
	    bot.sendAdaptiveCard( submitData.groupId, card);
	})
	break;
    }
    case 'prompt': {
	console.log(`Prompting user with a hello world form`);
	handlePromptAction( cardData ).then( card => {
	    console.log(`DEBUG: opening prompt dialog with card: `, card)
	    bot.sendAdaptiveCard( submitData.groupId, card);
	})
	break;
    }
    case 'prompt_with_dialog': {
	console.log(`Prompting user with a hello world form`);
	handlePromptAction( cardData ).then( card => {
	    let dialog = buildDialog('Hello world','small', card)
	    res.status(200);
	    res.setHeader('Content-Type', 'application/json');
	    res.end( JSON.stringify(dialog) )
	})
	break;
    }
    case 'hello': {
	console.log(`Saying hello to user`);
	cardData['name'] = submitData.helloText
	handleHelloAction( cardData ).then( card => {
	    console.log(`DEBUG: saying hello with card: `, card)
	    bot.sendAdaptiveCard( submitData.groupId, card);
	})
	break;
    }
    }
}

const buildDialog = function( title, size, card ) {
    let dialog = {
	"type": "dialog",
	"dialog": {
	    "title": title,
	    "size": size,
	    "iconUrl": "https://netstorage.ringcentral.com/appext/logo/TFQ9Uh2rTbiYGu9M_R7pAw~yV0_eNqeT6-sWPXFJev-6A/c448bc9c-339e-4d73-b962-59b2c3a96350.png",
	    "card": card
	}
    }
    return dialog
}

exports.messageHandler = messageHandler;
