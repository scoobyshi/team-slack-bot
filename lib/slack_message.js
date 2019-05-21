const { WebClient } = require('@slack/client');
const actions = require('./slack_actions');

const token = process.env.SLACK_API_TOKEN_STATUS || '';
const web = new WebClient(token);

function getChannels() {
  let channellist = '';
  if (process.env.CHANNELS) {
    channellist = process.env.CHANNELS.split(',');
    channellist.forEach((chlist) => {
      console.log(chlist);
    });
  } else {
    console.log('The list of target channels is empty!');
  }
  return channellist;
}

async function postReply(channelBot, questionDetail) {
  let channelList = [];

  if (channelBot) {
    channelList.push(channelBot);
  } else {
    channelList = getChannels();
  }

  if (channelList) {
    channelList.forEach(async (channel) => {
      let userList = {};
      try {
        userList = await web.users.list();
      } catch (err) {
        console.log(err);
        throw (err);
      }

      const userRemoteList = [];
      userList.members.forEach((member) => {
        let matchAllStatus = true;

        questionDetail.status.forEach((status) => {
          if (!member.profile.status_text.toLowerCase().includes(status)) {
            matchAllStatus = false;
          }
        });

        if (matchAllStatus) {
          userRemoteList.push(member.profile);
        }
      });

      // console.log("Remote Users: ", userRemoteList);

      let fieldUserRemoteList = userRemoteList.map((user) => {
        const tempUser = {};

        tempUser.title = user.real_name;
        tempUser.value = user.status_text;
        tempUser.short = true;

        return tempUser;
      });

      if (fieldUserRemoteList.length === 0) {
        fieldUserRemoteList = [
          {
            title: 'No one currently',
            short: true,
          },
        ];
      }

      const chatOptions = {
        attachments: [
          {
            // "color": "good",
            // "text": "Check Members",
            fields: fieldUserRemoteList,
          },
        ],
        as_user: 'true',
      };

      try {
        const postList = await web.chat.postMessage(channel, 'Team Status', chatOptions);
        console.log(postList.ok);
      } catch (err) {
        throw (err);
      }
    });
  } else {
    console.log('Please provide a Channel to post to using an env CHANNELS.');
  }
}

function actionExamples() {
  return actions.map((action) => {
    const tempField = {};

    tempField.value = action.example;
    tempField.short = true;

    return tempField;
  });
}

async function postUnknownStatus(channelBot) {
  let channelList = [];
  const fieldExamples = actionExamples();

  if (channelBot) {
    channelList.push(channelBot);
  } else {
    channelList = getChannels();
  }

  if (channelList) {
    channelList.forEach(async (channel) => {
      const chatOptions = {
        attachments: [
          {
            // "color": "good",
            // text: '',
            fields: fieldExamples,
          },
        ],
        as_user: 'true',
      };

      try {
        const postList = await web.chat.postMessage(channel, 'Unknown query, please try one of the following:', chatOptions);
        console.log(postList.ok);
      } catch (err) {
        throw (err);
      }
    });
  } else {
    console.log('Please provide a Channel to post to using an env CHANNELS.');
  }
}

module.exports.actionExamples = actionExamples;
module.exports.postReply = postReply;
module.exports.postUnknownStatus = postUnknownStatus;
