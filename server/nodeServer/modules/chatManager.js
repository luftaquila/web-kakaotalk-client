const chat_type = require("../node_modules/node-kakao/dist/talk/chat/chat-type.js");
this.chatManager = async (chat) => {
  console.log(chat.text);
  // if target channel is never seen before
  let isChannelSeenBefore = await query("SELECT * FROM `chatChannelList` WHERE `channelId`=" + pool.escape(chat.channel.id) + ";");
  if(!isChannelSeenBefore.length) await addNewChatChannel(chat);

  // if target sender is never seen before
  let isFriendSeenBefore = await query("SELECT * FROM `friendsList` WHERE `userId`=" + pool.escape(chat.sender.id) + ";");
  if(!isFriendSeenBefore.length && chat.sender.id != 246786864) await addNewFriend(chat);

  // add chat log
  await addChatLog(chat);
  
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

async function addChatLog(chat) {
  let chatText, chatType = chat_type.ChatType[chat.Type];
  if(chatType === 'Text') chatText = chat.text;
  else chatText = '';
  
  await query("INSERT INTO " +
    "`" + chat.channel.id + "`(`logId`, `messageId`, `senderId`, `sendTime`, `chatType`, `text`)" +
    " VALUES(" + pool.escape(chat.logId) + ", " + pool.escape(chat.messageId) + ", " + pool.escape(chat.sender.id) + ", " + pool.escape(chat.sendTime) + ", " + pool.escape(chatType) + ", " + pool.escape(chatText) + ");"
  );
  // update lastchat info
  await query("UPDATE `chatChannelList` SET `lastChatText`=" + pool.escape(chat.text) + ", `lastChatTime`=" + pool.escape(chat.sendTime) + " WHERE `channelId`=" + pool.escape(chat.channel.id) + ";");
}

async function addNewChatChannel(chat) {
  // insert channel info to `chatChannelList` table
  await query("INSERT INTO " +
    "`chatChannelList`(`channelId`, `type`, `activeMemberCount`, `lastChatText`, `lastChatTime`)" +
    " VALUES(" + pool.escape(chat.channel.id) + ", " + pool.escape(chat.channel.dataStruct.type) + ", " + pool.escape(chat.channel.dataStruct.activeMemberCount) + ", " + pool.escape(chat.text) + ", " + pool.escape(chat.sendTime) + ");"
  );

  // create channel table
  await query("CREATE TABLE " + pool.escapeId(String(chat.channel.id)) + "(" +
    "`logId` bigint(20) PRIMARY KEY," + 
    "`messageId` bigint(20)," + 
    "`senderId` bigint(20)," +
    "`sendTime` int(11)," +
    "`chatType` varchar(20)," +
    "`text` text);"
  );
}

async function addNewFriend(chat) {
  // request friend info
  let member = chat.channel.userInfoMap.get(String(chat.sender.id)).memberStruct;
  let profile = await client.service.requestProfile(chat.sender.id);

  // insert user info to `friendsList` table
  await query("INSERT INTO " +
    "`friendsList`(`userId`, `name`, `profileImageurl`, `lastSeenAt`)" +
    " VALUES(" + pool.escape(chat.sender.id) + ", " + pool.escape(member.nickname) + ", " + pool.escape(member.profileImageUrl) + ", " + pool.escape(profile.lastSeenAt) + ");"
  );
}

async function query(queryString) {
  let db, result;
  try {
    db = await pool.getConnection();
    result = await db.query(queryString);
  }
  catch(err) { console.log(err); }
  finally {
    if(db) db.end();
    return result;
  }
}