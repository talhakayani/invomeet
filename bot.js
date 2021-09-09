const { App } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');
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
    //console.log(command);
    if (command.text) {
      const mentions = botController.findMentions(command.text);
      const time = botController.getTime(
        RegExp(/([AaPp][Mm])/, 'g'),
        command.text
      );
      //  console.log(mentions, time);
      if (mentions.length && time.hasOwnProperty('timeNumber')) {
        await Promise.all([
          ack(),
          botController.getAllRooms('http://localhost:3000/rooms/available'),
          botController.getCompleteMentionInfo(mentions),
          botController.getCompleteMentionInfo([command.user_id]),
        ])
          .then(
            ([
              ackResult,
              allRoomsAvailable,
              allMentionedUserInfo,
              userInfo,
            ]) => {
              // botController.sendMessage(
              //   command.channel_id,
              //   allRoomsAvailable,
              //   app,
              //   true
              // );
              if (allRoomsAvailable.length) {
                const mentionedInformation =
                  botController.getEmailNameOfMentions(allMentionedUserInfo);
                const [userInformation] =
                  botController.getEmailNameOfMentions(userInfo);

                const config = {
                  headers: { 'Content-Type': 'application/json' },
                };
                axios
                  .put(
                    `http://localhost:3000/room/status/${allRoomsAvailable[0].id}`,
                    { status: 'busy' },
                    config
                  )
                  .then(response => {
                    if (response.status === 200) {
                      botController.sendMessageRoomReserved(
                        command.channel_id,
                        allRoomsAvailable[0],
                        mentionedInformation,
                        userInformation,
                        app
                      );
                    }
                  })
                  .catch(err => {
                    say(
                      'Unable to reserve the room for your meeting please try again later'
                    );
                  });
              } else {
                say(
                  'opss! currently no meeting room is available at the moment'
                );
              }

              // console.log(
              //   botController.getEmailNameOfMentions(allMentionedUserInfo),
              //   botController.getEmailNameOfMentions(userInfo)
              // );
            }
          )
          .catch(err => {
            // console.log(err);
          });
      } else {
        [
          say(
            'please mention the persons and also please mention the time (e.g 2PM 2:00PM)'
          ),
        ];
      }
    } else {
      say(
        'Please mention the time and participents so we can reserve room when available and send email notification to the participents'
      );
    }
  } catch (err) {
    //console.error(err);
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
