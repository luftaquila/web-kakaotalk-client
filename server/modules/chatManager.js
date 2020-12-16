const chat_type = require("../node_modules/node-kakao/dist/talk/chat/chat-type.js");

module.exports = {
  checkChannelSeenBefore,
  checkSenderSeenBefore,
  addChatLog,
  query
}

async function checkChannelSeenBefore(chat) {
  let is = await query("SELECT * FROM `chatChannelList` WHERE `channelId`=" + pool.escape(chat.channel.id) + ";");
  if(!is.length) {
    await addNewChatChannel(chat);
    return false;
  }
  else return true;
}

async function checkSenderSeenBefore(chat) {
  let is = await query("SELECT * FROM `friendsList` WHERE `userId`=" + pool.escape(chat.sender.id) + ";");
  if(!is.length && chat.sender.id != 246786864) {
    await addNewFriend(chat);
    return false;
  }
  else return true;
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
  await query("UPDATE `chatChannelList` SET `lastChatText`=" + pool.escape(chat.text) + ", `lastChatTime`=" + pool.escape(chat.sendTime) + ", `newMessageCount`=" + pool.escape(chat.channel.dataStruct.newMessageCount) + " WHERE `channelId`=" + pool.escape(chat.channel.id) + ";");
}

async function addNewChatChannel(chat) {
  // !!!!!!!!!!!!!!!!!!!!!!!!!! name and roomImageUrl not working
  // maybe name must be friends name if DirectChat
  // insert channel info to `chatChannelList` table
  await query("INSERT INTO " +
    "`chatChannelList`(`channelId`, `name`, `type`, `userCount`, `lastChatText`, `lastChatTime`, `newMessageCount`, `roomImageUrl`)" +
    " VALUES(" + pool.escape(chat.channel.id) + ", " + pool.escape(chat.channel.Name) + ", " + pool.escape(chat.channel.Type) + ", " + pool.escape(chat.channel.UserCount) + ", " + pool.escape(chat.text) + ", " + pool.escape(chat.sendTime) + ", " + pool.escape(chat.channel.dataStruct.newMessageCount) + ", " + pool.escape(chat.channel.RoomImageURL) + ");"
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
  let member = chat.Channel.getUserInfo(chat.Sender).memberStruct;
  // insert user info to `friendsList` table
  await query("INSERT INTO " +
    "`friendsList`(`userId`, `name`, `statusMessage`, `profileImageUrl`)" +
    " VALUES(" + pool.escape(chat.sender.id) + ", " + pool.escape(member.nickname) + ", " + pool.escape(member.statusMessage) + ", " + pool.escape(member.profileImageUrl) + ");"
  );
  //let lastSeenAt = await client.service.requestProfile(chat.sender.id).lastSeenAt;
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
