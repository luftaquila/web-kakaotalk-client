require('dotenv').config();
const express = require('express');
const mariadb = require('mariadb');
const winston = require('winston');
const dateformat = require('dateformat');
const bodyParser = require('body-parser');

const pool = mariadb.createPool({
  host: 'localhost', 
  user: process.env.DB_User,
  password: process.env.DB_PW,
  database: 'kakao',
  idleTimeout: 0
});

const nodeKakao = require('node-kakao');
let client = new nodeKakao.TalkClient(process.env.TalkClientName, process.env.TalkClientUUID);

client.login(process.env.TalkClientLoginID, process.env.TalkClientLoginPW, true)
  .then(main)
  .catch(err => { console.error(`Login Attempt failed. status: ${err.status}, msg: ${err.message}`); });

function main() {
  console.log('Login successful. Main client is in startup.');
  
  /*
  // Update friends list
  console.log(client.Auth.getLatestAccessData())
  client.service.requestFriendList(['normal'], ['create'], client.auth.accessData.accessToken + '-' + client.auth.deviceUUID)
    .then((res) => { console.log(res) })
    .catch(err => { console.error(`Login Attempt failed. status: ${err.status}, msg: ${err.message}`); });
  //client.service.requestProfile().then(res => console.log(res));
  
  throw err;
  */
  
  // Incoming message event handler
  client.on('message', async chat => {

    // if target channel is never seen before
    
    let isChannelSeenBefore = await query("SELECT * FROM `chatChannelList` WHERE `channelId`=" + chat.channel.id + ";");
    if(!isChannelSeenBefore.length) {
      
      // insert channel info to `chatChannelList` table
      await query("INSERT INTO " +
        "`chatChannelList`(`channelId`, `type`, `activeMemberCount`, `newMessageCount`, `lastChatText`, `lastChatTime`)" +
        " VALUES(" + chat.channel.id + ", '" + chat.channel.dataStruct.type + "', " + chat.channel.dataStruct.activeMemberCount + ", " + chat.channel.dataStruct.newMessageCount + ", '" + chat.text + "', " + chat.sendTime + ");"
      );
      
      // create channel table
      await query("CREATE TABLE `" + chat.channel.id + "`(" +
        "`logId` bigint(20) PRIMARY KEY," + 
        "`messageId` bigint(20)," + 
        "`senderId` bigint(20)," +
        "`sendTime` int(11)," +
        "`text` text);"
      );
    }
    
    // if target sender is never seen before
    if(chat.sender.id != 246786864 && !await query("SELECT * FROM `friendsList` WHERE `userId`=" + chat.sender.id + ";").length) {
      console.log('new user detected');
      // request friend info
      let profile = await client.service.requestProfile(chat.sender.id);
      let info = await client.service.findFriendById(chat.sender.id);
      
      // insert user info to `friendsList` table
      await query("INSERT INTO " +
        "`friendsList`(`userId`, `name`, `profileImageurl`, `lastSeenAt`, `directChatChannelId`)" +
        " VALUES(" + chat.sender.id + ", '" + info.friend.nickName + "', '" + info.friend.profileImageUrl + "', " + profile.lastSeenAt + ", 0);"
      );
    }
    
    // add chat log
    await query("INSERT INTO " +
      "`" + chat.channel.id + "`(`logId`, `messageId`, `senderId`, `sendTime`, `text`)" +
      " VALUES(" + chat.logId + ", '" + chat.messageId + "', " + chat.sender.id + ", " + chat.sendTime + ", '" + chat.text + "');"
    );
    
    // update lastchat info
    await query("UPDATE `chatChannelList` SET `lastChatText`='" + chat.text + "', `lastChatTime`='" + chat.sendTime + "' WHERE `channelId`=" + chat.channel.id + ";");
    
    
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
  });
  
  
  // Message read event handler
  client.on('message_read', (channel, reader, readChatLogId) => {
    /*
    console.log('----------------channel-------------------');
    console.log(channel)
    */
    //console.log(reader)
    console.log(readChatLogId)
    
  });
  
}

async function query(queryString) {
  let db, result;
  try {
    db = await pool.getConnection();
    result = await db.query(queryString);
  }
  catch(err) { throw err; }
  finally {
    if(db) db.end();
    console.log(queryString)
    console.log(result)
    return result;
  }
}
  