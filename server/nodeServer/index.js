require('dotenv').config();
const request = require('request');
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
    if(chat.channel.id == 284687032997214) { // 미유미유 급식인증 event
      chat.markChatRead();
      if(chat.text.includes('인증') && chat.text.includes('코스') && ((chat.text.includes('월') && chat.text.includes('일')) || chat.text.includes('/'))) {
        let targetDate = chat.text.match(/\b(\d+)\/(\d+)\b/) || chat.text.match(/(\d+)월 (\d+)일/) || chat.text.match(/(\d+)월(\d+)일/);
        if(targetDate) {
          let targetMonth = targetDate[1];
          let targetDay = targetDate[2];
          let currentYear = new Date().getFullYear();
          let current = new Date();
          const dateList = [new Date(currentYear, Number(targetMonth) - 1, Number(targetDay)), new Date(Number(currentYear) - 1, Number(targetMonth) - 1, Number(targetDay)), new Date(Number(currentYear) + 1, Number(targetMonth) - 1, Number(targetDay))]
          dateList.sort((a, b) => { return Math.abs(current - a) - Math.abs(current - b); });
          targetDate = dateList[0];
          
          let targetCourses = chat.text.match(/\b(?=\w*[코스])\w+\b/g);
          let targetMembers = chat.text.match(/(?<![가-힣])[가-힣]{3}(?![가-힣])/g);
          if(targetCourses && targetMembers) {
            
            let score = { weekday: { solo: 1.5, dual: 1}, weekend: { solo: 2, dual: 1.5} }
            let isWeekEnd = targetDate.getDayNum() > 5 ? 'weekend' : 'weekday';
            let isSolo = targetMembers.length == 1 ? 'solo' : 'dual';
            
            for(let i in targetMembers) {
              let res = await postRequest('https://luftaquila.io/ajoumeow/api/getMemberIdByName', { name: targetMembers[i] });
              let id = JSON.parse(res)[0].ID;
              
              if(id > 0) targetMembers[i] = { name: targetMembers[i], id: JSON.parse(res)[0].ID };
              else if(!id) return chat.channel.sendText('자동 급식 인증 테스트 중입니다!\n\n' + targetMembers[i] + ' 회원님 사이트에 회원등록되지 않아 자동 인증이 불가능합니다.\nERR: NO_ENTRY_DETECTED');
              else if(id < 0) return chat.channel.sendText('자동 급식 인증 테스트 중입니다!\n\n' + targetMembers[i] + ' 회원님 동명이인이 존재하여 자동 인증이 불가능합니다.\nERR: MULTIPLE_ENTRY_DETECTED');
            }
              
            let payload = [];
            for(let course of targetCourses) {
              for(let member of targetMembers) {
                payload.push({
                  ID: member.id, name: member.name,
                  date: targetDate.format('yyyy-mm-dd'), course: course + '코스',
                  score: score[isWeekEnd][isSolo]
                });
              }
            }
            let res = await postRequest('https://luftaquila.io/ajoumeow/api/verify', { data: JSON.stringify(payload) });
            if(JSON.parse(res).result == true) {
              let resultString = payload[0].date + '일자 자동 급식 인증';
              for(let obj of payload) resultString += '\n' + obj.name + ' 회원님 ' + obj.course + ' 점수: ' + obj.score + '점';
              chat.channel.sendText('자동 급식 인증 테스트 중입니다!\n\n' + resultString);
            }
          }
        }
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
    //console.log(readChatLogId)
    
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
    //console.log(queryString)
    //console.log(result)
    return result;
  }
}

async function postRequest(url, data) {
  return new Promise(function(resolve, reject) {
    request.post({
      url: url,
      form: data,
    }, function(err, resp, body) {
      if (err) reject(err);
      else resolve(body);
    });
  });
}

var dateFormat = function () {
  var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
      pad = function (val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
      };
  return function (date, mask, utc) {
    var dF = dateFormat;
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
      mask = date;
      date = undefined;
    }
    date = date ? new Date(date) : new Date;
    var	_ = utc ? "getUTC" : "get",
      d = date[_ + "Date"](),
      m = date[_ + "Month"](),
      y = date[_ + "FullYear"](),
      flags = {
        d:    d,
        dd:   pad(d),
        m:    m + 1,
        mm:   pad(m + 1),
        yyyy: y,
      };
    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}();
Date.prototype.format = function (mask, utc) { return dateFormat(this, mask, utc); };
Date.prototype.getDayNum = function() { return this.getDay() ? this.getDay() : 7; }
  