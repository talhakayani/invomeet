const axios = require('axios');
const { WebClient, ErrorCode } = require('@slack/web-api');
require('dotenv').config();
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

exports.findMentions = text => {
  const exp = /<(.*?)>/;
  var test = text.match(exp);
  var finalValue = [];
  while (test) {
    finalValue.push(test[0].split('|')[0].replace('<@', ''));
    text = text.replace(exp, '');
    test = text.match(exp);
  }
  return finalValue;
};

exports.getCompleteMentionInfo = async mentions => {
  let details = [];
  for (let i = 0; i < mentions.length; i++) {
    await client.users
      .info({
        user: mentions[i],
      })
      .then(info => {
        details.push(info);
      });
  }
  return details;
};

exports.getAllRooms = async () => {
  let allRooms = [];
  await axios
    .get('http://localhost:3000/rooms/available')
    .then(response => {
      const { status, message, body } = response.data;
      if (status == 200) {
        allRooms = body;
      } else {
        return ['some thing went wrong here'];
      }
    })
    .catch(err => {
      return [err];
    });
  if (!allRooms) return [];
  else return allRooms;
};

const makeJSONblock = rooms => {
  let roomsJSONBlock = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Available Rooms',
        emoji: true,
      },
    },
  ];

  rooms.forEach(room => {
    roomsJSONBlock.push(
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Room Name*:\n${room.name}`,
          },
          {
            type: 'mrkdwn',
            text: `*Room location*:\n${room.floor}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Room Capacity*:\n${room.capacity}`,
          },
          {
            type: 'mrkdwn',
            text: `*Room Status*:\n${room.status}`,
          },
        ],
      },
      {
        type: 'divider',
      }
    );
  });

  return roomsJSONBlock;
};

exports.sendMessage = async (channelId, rooms, app) => {
  const result = await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    blocks: makeJSONblock(rooms),
  });
  console.log(result);
};
