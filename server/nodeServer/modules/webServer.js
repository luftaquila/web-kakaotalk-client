const express = require('express');
const app = express();
app.use(express.json());
const webserver = app.listen(9731);
const io = require('socket.io')(webserver);

const jwt = require('jsonwebtoken');
const socketJWT = require('socketio-jwt');


  
  //https://github.com/storycraft/node-kakao/search?q=mark MARK READ
  
  let target = await client.userManager.map.get('246786864').createDM()
  let channel = await target.result.sendText('test');
  
  let targetChannel = await client.channelManager.map.get('293729341839798').sendText('hi')//.createDM()


app.get('/', async function(req, res) {
  
});

app.post('/login', function (req, res) {
  if(req.body.id === process.env.clientID && req.body.pw === process.env.clientPW) {
    let token = jwt.sign(req.body, process.env.JWTSecret, { expiresIn: 60 * 60 }); // 1hr
    res.send({ result: 'ok', token: token });
  }
  else res.send({ result: 'fail' });
});

//const io


this.init = (server) => {
  console.log(false);
}
/*
io.sockets
  .on('connection', socketJWT.authorize({
    secret: process.env.JWTSecret,
    handshake: true,
    auth_header_required: true
  }))
  .on('authenticated', (socket) => {
    console.log(`hello! ${socket.decoded_token.name}`);
  });
*/