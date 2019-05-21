const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
const slackMessage = require('./slack_message');
const actions = require('./slack_actions');

const token = process.env.SLACK_API_TOKEN_STATUS || '';

function answerBot(appData, message) {
  // If its from this bot with request for 'who' eg @status-bot who
  // console.log('Debug:', message);

  if (message.text.includes(appData.selfId)) {
    console.log('Received query to the bot: ', message.text);
    let matchQuestion = false;
    let questionDetail = {};

    actions.forEach((question) => {
      let matchAllPhrase = true;

      question.phrase.forEach((phrase) => {
        if (!message.text.includes(phrase)) {
          matchAllPhrase = false;
        }
      });

      if (matchAllPhrase && !matchQuestion) {
        matchQuestion = true;
        questionDetail = question;
      }
    });

    if (matchQuestion) {
      slackMessage.postReply(message.channel, questionDetail);
    } else {
      slackMessage.postUnknownStatus(message.channel);
    }
  }
}

function setupBot() {
  const appData = {};

  const rtm = new RtmClient(token, {
    dataStore: false,
    useRtmConnect: true,
  });

  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
    // Cache the data necessary for this app in memory
    appData.selfId = connectData.self.id;
    console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
  });

  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPEN, () => {
    console.log('Ready');
  });

  rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    if ((message.subtype && message.subtype === 'bot_message') ||
        (!message.subtype && message.user === appData.selfId)) {
      return;
    }

    // Log the message, this echos ALL channel messages
    // console.log('New message: ', message);

    if (message.text) {
      answerBot(appData, message);
    }
  });

  rtm.start();
}

module.exports.setupBot = setupBot;
