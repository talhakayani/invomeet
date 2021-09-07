const { App } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');
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

// const getRooms = url => {
//   let allRooms = '';
//   axios
//     .get(url.toString())
//     .then(response => {
//       const { status, message, body } = response.data;
//       console.log(status, message, body);
//       if (status == 200) {
//         body.forEach(obj => {
//           allRooms += `Room Name: ${obj.name}\n
//             Location: ${obj.floor}\n
//             Availability: ${obj.status}\n`;
//         });
//         return allRooms.toString();
//       } else {
//         allRooms = message;
//         return allRooms.toString();
//       }
//     })
//     .catch(err => {
//       return err.toString();
//     });
// };

const sendMessage = async roomsJSONArray => {
  //say(allRooms);
  await axios
    .post(
      URL_MESSAGE,
      {
        channel: '#random',
        // blocks: roomsJSONArray,
        blocks: [
          {
            type: 'plain_text',
            text: '*Red Room*',
            fields: [
              { type: 'mrkdwn', text: 'Location: 1st Floor' },
              { type: 'mrkdwn', text: 'Capacity: 13' },
              { type: 'mrkdwn', text: 'Availability: Available' },
            ],
          },
        ],
        username: 'Invomeet Rooms',
      },
      {
        headers: {
          authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      }
    )
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.log(err);
    });
};
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Commands //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.command('/rooms', async ({ command, ack, say }) => {
  try {
    await ack();
    // let allRooms = '';
    axios
      .get('http://localhost:3000/rooms/all')
      .then(response => {
        const { status, message, body } = response.data;
        //   console.log(status, message, body);
        if (status == 200) {
          /**
           * {
      type: 'section',
      text: { type: 'mrkdwn', text: 'New order!' },
      fields: [
        { type: 'mrkdwn', text: '*Name*\nJohn Smith' },
        { type: 'mrkdwn', text: '*Amount*\n$8.50' },
      ]
    },
           */
          const roomsJSONArray = [];
          body.forEach(obj => {
            // allRooms += `Room Name: ${obj.name}\n
            // Location: ${obj.floor}\n
            // Availability: ${obj.status}\n`;
            let objs = {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*' + obj.name + '*',
                fields: [
                  { type: 'mrkdwn', text: 'Location: ' + obj.floor },
                  { type: 'mrkdwn', text: 'Capacity: ' + obj.capacity },
                  { type: 'mrkdwn', text: 'Availability: ' + obj.status },
                ],
              },
            };
            roomsJSONArray.push(objs);
          });
          console.log(...roomsJSONArray);
          sendMessage(roomsJSONArray);
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
        console.log(status, message, body);
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
    // say(getRooms('http://localhost:3000/rooms/available'));
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
