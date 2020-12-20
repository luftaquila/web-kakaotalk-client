const CM = require('./chatManager.js');
const Long = require('long');

const express = require('express');
const app = express();
app.use(express.json());

const jwt = require('jsonwebtoken');
const socketJWT = require('socketio-jwt');

const webserver = app.listen(9731, async _ => {
  console.log('Web server deployed. Listening on port 9731.');
});
const io = require('socket.io')(webserver);

/*
//https://github.com/storycraft/node-kakao/search?q=mark MARK READ

let target = await client.userManager.map.get('246786864').createDM()
let channel = await target.result.sendText('test'); // returns chat class

let targetChannel = await client.channelManager.map.get('293729341839798').sendText('hi')//.createDM()
*/

app.get('/', async (req, res) => { });

app.post('/login', (req, res) => {
  if(req.body.id === process.env.clientID && req.body.pw === process.env.clientPW) {
    let token = jwt.sign(req.body, process.env.JWTSecret, { expiresIn: 60 * 60 }); // 1hr
    res.send({ result: 'ok', token: token });
  }
  else res.send({ result: 'fail' });
});

app.post('/verify', (req, res) => {
  if(verifyJWT(req.body.token)) res.send('ok');
  else res.send(null);
});

const verifyJWT = token => {
  try { return jwt.verify(token, process.env.JWTSecret); }
  catch(e) { return null; }
}

io.use(socketJWT.authorize({
  secret: process.env.JWTSecret,
  handshake: true,
  //auth_header_required: true,
  callback: false
}));

io.on('connection', async socket => {
  const channelList = await CM.query('SELECT * FROM `chatChannelList`;');
  const friendsList = await CM.query('SELECT * FROM `friendsList`;');
  io.emit('init', {
    channelList: channelList,
    friendsList: friendsList,
    myInfo: {
      id: client.clientUser.id,
      serviceUserId: client.clientUser.mainUserInfo.settings.serviceUserId,
      nickName: client.clientUser.mainUserInfo.settings.nickName,
      statusMessage: client.clientUser.mainUserInfo.settings.statusMessage,
      profileImageUrl: client.clientUser.mainUserInfo.settings.profileImageUrl,
      fullProfileImageUrl: client.clientUser.mainUserInfo.settings.fullProfileImageUrl,
      originalProfileImageUrl: client.clientUser.mainUserInfo.settings.originalProfileImageUrl,
      uuid: client.clientUser.mainUserInfo.settings.uuid,
      pstnNumber: client.clientUser.mainUserInfo.settings.pstnNumber,
      formattedPstnNumber: client.clientUser.mainUserInfo.settings.formattedPstnNumber,
      nsnNumber: client.clientUser.mainUserInfo.settings.nsnNumber,
      formattedNsnNumber: client.clientUser.mainUserInfo.settings.formattedNsnNumber,
      accountDisplayId: client.clientUser.mainUserInfo.settings.accountDisplayId
    }
  });
  //socket.decoded_token
  // send all chat data(x)
  // send table chatList: chatList table must have unread message counts
  
  socket.on('requestChannelInfo', async (data, callback) => {
    const channelInfo = await CM.query('SELECT * FROM `chatChannelList` WHERE `channelId`=' + pool.escape(data.channelId) + ';');
    callback(channelInfo[0]);
  });
  
  socket.on('requestChatLog', async (data, callback) => {
    const chatLog = await CM.query('SELECT * FROM ' + pool.escapeId(String(data.channelId)) + ' ORDER BY `sendTime` DESC LIMIT 50;');
    callback(chatLog);
  });
});


this.chatManager = async chat => {
  // maybe sent from node-kakao client doesn't make chat event. self addition to DB required.
  console.log(chat.text);
  
  let isChannelSeenBefore = await CM.checkChannelSeenBefore(chat);
  let isSenderSeenBefore = await CM.checkSenderSeenBefore(chat);
  await CM.addChatLog(chat);
  
  io.emit('chat', { sender: chat.sender.id, channel: chat.channel.id, logId: chat.logId, sendTime: chat.sendTime , text: chat.text, unread: chat.channel.dataStruct.newMessageCount });
}

this.readManager = (channel, reader, readChatLogId) => {
  console.log('----------------channel-------------------');
  console.log(channel)
  console.log(reader)
  console.log(readChatLogId)
}

