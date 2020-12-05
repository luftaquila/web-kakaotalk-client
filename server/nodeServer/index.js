const nodeKakao = require('node-kakao');
let client = new nodeKakao.TalkClient('SERVER', 'c2VydmVyMQ==');

client.login('luftaquila@protonmail.ch', 'rokaFKAk512#', true)
  .then(main)
  .catch(err => { console.error(`Login Attempt failed. status: ${err.status}, msg: ${err.message}`); });

function main() {
  console.log('Kakao login success. Main client is on startup.');
  client.on('message', (chat) => {
    console.log(chat)
    console.log(chat.channel.dataStruct.channelId)
    if(chat.channel.dataStruct.channelId == 174726625044834) {
      chat.channel.sendText('Kakao login success. Main client is on startup.');
    }
    else if(chat.channel.dataStruct.channelId == 205241728180694) {
      chat.channel.sendText('Incoming message detected. content: ' + chat.text);
    }
  });
}