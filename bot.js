// rename to slack bot
const { App } = require('@slack/bolt');
const axios = require('axios');
const rooms = require('./models/rooms');
require('dotenv').config();

const URL_MESSAGE = 'https://slack.com/api/chat.postMessage';
const PORT = process.env.PORT || 4000;
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
    await ack();
    let allRooms = '';
    axios
      .get('http://localhost:3000/rooms/all')
      .then(response => {
        const { status, message, body } = response.data;
        //   console.log(status, message, body);
        if (status == 200) {
          //const roomsJSONArray = [];
          body.forEach(obj => {
            allRooms += `Room Name: ${obj.name}\n
            Location: ${obj.floor}\n
            Availability: ${obj.status}\n`;
          });
          say(allRooms);
        } else {
          allRooms = message;
          say(allRooms);
        }
      })
      .catch(err => {
        console.log('something went wrong');
        console.log(err);
      });
    //say(getRooms('http://localhost:3000/rooms/all'));
  } catch (err) {
    console.error(err);
  }
});

app.command('/roomsavailable', async ({ command, ack, say }) => {
  try {
    await ack();
    let allRooms = '';
    axios
      .get('http://localhost:3000/rooms/available')
      .then(response => {
        const { status, message, body } = response.data;
        if (status == 200) {
          body.forEach(obj => {
            allRooms += `Room Name: ${obj.name}\n
            Location: ${obj.floor}\n
            Availability: ${obj.status}\n`;
          });
          say(allRooms);
        } else {
          allRooms = message;
          say(allRooms);
        }
      })
      .catch(err => {
        console.log('something went wrong');
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
