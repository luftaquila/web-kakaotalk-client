require('./chatManager.js');

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
let channel = await target.result.sendText('test');

let targetChannel = await client.channelManager.map.get('293729341839798').sendText('hi')//.createDM()
*/

app.get('/', async (req, res) => {
  
});

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

const verifyJWT = (token) => {
  try { return jwt.verify(token, process.env.JWTSecret); }
  catch(e) { return null; }
}

io.use(socketJWT.authorize({
  secret: process.env.JWTSecret,
  handshake: true,
  //auth_header_required: true,
  callback: false
}));

io.on('connection', (socket) => {
  //socket.decoded_token
  // send all chat data(x)
  // send table chatList: chatList table must have unread message counts
});

this.chatManager = async chat => {
  console.log(chat.text);
  
  let isChannelSeenBefore = await checkChannelSeenBefore(chat);
  let isSenderSeenBefore = await checkSenderSeenBefore(chat);
  await addChatLog(chat);
  
  io.emit('chat');
  
  // other chat handlers

  /*
  if(chat.sender.id != 246786864 && chat.channel.dataStruct.type == 'DirectChat') {
    //chat.channel.sendText('Incoming message detected. content: ' + chat.text);
    if(chat.channel.dataStruct.channelId == 174726625044834) { } // 최서원
    //else if(chat.channel.dataStruct.channelId == 205241728180694) { } // 박세진
    else {
      chat.markChatRead();
      let delay = Math.random();
      setTimeout(() => {
        chat.channel.sendText('Incoming message detected.\nContent: ' + chat.text + '\nReply delay: ' + Math.round(delay * 1000) + 'ms');
      }, delay * 1000);
    }
  }
  */
}          

this.readManager = (channel, reader, readChatLogId) => {
  console.log('----------------channel-------------------');
  console.log(channel)
  console.log(reader)
  console.log(readChatLogId)
}

