const { Template }  = require('adaptivecards-templating');
const Bot           = require('ringcentral-chatbot-core/dist/models/Bot');
const welcomeCard   = require('./cards/welcomeCard.json');
const helpCard      = require('./cards/helpCard.json');
const promptCard    = require('./cards/promptCard.json');
const helloCard     = require('./cards/helloCard.json');

const botHandler = async event => {
    switch (event.type) {
    case 'Message4Bot':
	console.log("Processing Message4Bot event")
        await handleMessage4Bot(event)
        break
/*
    case 'BotJoinGroup': // bot user joined a new group
	console.log("Processing BotJoinGroup event to say hello")
        await handleBotJoinGroup(event)
        break
*/
/*
    case 'Delete': // bot has been uninstalled, do cleanup
	console.log("Processing Delete event for garbage collecting")
        await handleBotDelete(event)
        break
*/
    default:
	console.log('Unknown event type: ' + event.type)
        break
    }
}

const handleMessage4Bot = async event => {
    const { group, bot, text, userId } = event
    if (text === "ping") {
	bot.sendMessage(group.id, { text: `pong` })

    } else if (text === "help") {
	const template = new Template(helpCard);
	const cardData = {
	    'botId': bot.id,
	    'groupId': group.id
	};
	const card = template.expand({ $root: cardData });
	await bot.sendAdaptiveCard( group.id, card);
        return
    }
}

/*
const handleBotJoinGroup = async event => {
    const { bot, group } = event
    if (group.type != "Everyone") {
	const template = new Template(welcomeCard);
	const cardData = {
	    botId: bot.id,
	    groupId: event.group.id
	};
	const card = template.expand({ $root: cardData });
	await bot.sendAdaptiveCard( group.id, card);
    } else {
	console.log("Skipping Everyone group")
	// sometimes you may want to send a message to the Everyone group
	// to introduce your bot to the entire company. 
    }
}
*/
/*
const handleBotDelete = async event => {
    console.log("DEBUG: received BotDelete event: ", event)
    const { type, message } = event
    let botId = message.body.extensionId
    console.log("DEBUG: cleaning up for bot:", botId)
    // do any garbage collection here if necessary
}
*/
exports.botHandler = botHandler;
