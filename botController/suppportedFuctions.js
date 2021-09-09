const axios = require('axios');
const { WebClient, ErrorCode } = require('@slack/web-api');
const { response } = require('express');
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
  if (finalValue) {
    return finalValue;
  } else {
    return [];
  }
};

exports.getCompleteMentionInfo = async mentions => {
  if (mentions) {
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
  } else {
    return [];
  }
};

exports.getAllRooms = async url => {
  let allRooms = [];
  await axios
    .get(url)
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

const makeJSONblock = (rooms, available) => {
  let roomsJSONBlock = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: available ? 'Available Rooms' : 'All Rooms',
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
            text: `*Room Status*:\n*${room.status.toUpperCase()}*`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Would you like to reserve the room?',
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Reserve',
            emoji: true,
          },
          style: 'primary',
          value: 'reserve_room',
          action_id: 'button-action',
        },
      },
      {
        type: 'divider',
      }
    );
  });

  return roomsJSONBlock;
};

exports.sendMessage = async (channelId, rooms, app, queryRoom) => {
  const result = await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    blocks: makeJSONblock(rooms, queryRoom),
  });
  // console.log(result);
};

exports.getTime = (regExpression, text) => {
  regExpression.exec(text);
  const foundAmPm = regExpression.lastIndex;
  if (foundAmPm) {
    const amPm = text[foundAmPm - 2] + text[foundAmPm - 1];
    let timeNumber = '',
      i = 3,
      character = text[foundAmPm - i];
    while (character !== ' ') {
      timeNumber += character;
      character = text[foundAmPm - ++i];
    }
    timeNumber = timeNumber.split('').reverse().join('');
    return { timeNumber, amPm };
  } else {
    return {};
  }
};

exports.getEmailNameOfMentions = mentioned => {
  //console.log(mentioned);
  let object = [];
  mentioned.forEach(mention => {
    const { id, name, real_name } = mention.user;
    const emailAddress = name + '@' + process.env.DOMAIN_NAME;
    object.push({ id, name, real_name, emailAddress });
  });
  if (object) {
    return object;
  } else {
    return [];
  }
};

const makeJSONblockRoomReserved = (room, mentioned, user) => {
  console.log(mentioned, user);
  let roomReserveBlockJSON = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Room Reserved',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Room Name*\n${room.name}`,
        },
        {
          type: 'mrkdwn',
          text: `*Room Location*\n${room.floor}`,
        },
      ],
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Room Capacity*\n${room.capacity}`,
        },
        {
          type: 'mrkdwn',
          text: `*Room Name*\n${'busy'.toUpperCase()}`,
        },
      ],
    },
    {
      type: 'divider',
    },

    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Reserved By',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Name*\n${user.real_name}`,
        },
        {
          type: 'mrkdwn',
          text: `*Email*\n${user.emailAddress}`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Reserved with',
        emoji: true,
      },
    },
  ];

  mentioned.forEach(mention => {
    roomReserveBlockJSON.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Name*\n${mention.real_name}`,
        },
        {
          type: 'mrkdwn',
          text: `*Email*\n${mention.emailAddress}`,
        },
      ],
    });
  });

  return roomReserveBlockJSON;
};

exports.sendMessageRoomReserved = async (
  channelId,
  room,
  mentioned,
  user,
  app
) => {
  const result = await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    blocks: makeJSONblockRoomReserved(room, mentioned, user),
  });
};
