const { App } = require('@slack/bolt');
const { WebClient, ErrorCode } = require('@slack/web-api');
const axios = require('axios');
const rooms = require('./models/rooms');
require('dotenv').config();
const botController = require('./botController/suppportedFuctions');

const URL_MESSAGE = 'https://slack.com/api/chat.postMessage';
const PORT = process.env.PORT || 4000;
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNIN_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Commands //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.command('/rooms', async ({ command, ack, say }) => {
  console.log(command);
  try {
    await Promise.all([
      ack(),
      botController.getAllRooms('http://localhost:3000/rooms/all'),
    ]).then(([ackResult, allRoomsAvailable]) => {
      botController.sendMessage(
        command.channel_id,
        allRoomsAvailable,
        app,
        false
      );
    });
  } catch (err) {
    console.error(err);
  }
});

app.command('/roomsavailable', async ({ command, ack, say }) => {
  try {
    console.log(command);
    const mentions = botController.findMentions(command.text);
    console.log(mentions);
    await Promise.all([
      ack(),
      botController.getAllRooms('http://localhost:3000/rooms/available'),
      botController.getCompleteMentionInfo(mentions),
    ])
      .then(([ackResult, allRoomsAvailable, allMentionedUserInfo]) => {
        botController.sendMessage(
          command.channel_id,
          allRoomsAvailable,
          app,
          true
        );
        // console.log(allRoomsAvailable, allMentionedUserInfo);
      })
      .catch(err => {
        console.log(err);
      });
  } catch (err) {
    console.error(err);
  }
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Executing App /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

(async () => {
  // Start your app
  await app.start(PORT);
  console.log(`⚡️ Slack Bolt app is running on port ${PORT}!`);
})();
