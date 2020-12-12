require('dotenv').config();
const request = require('request');
const express = require('express');
const mariadb = require('mariadb');
const winston = require('winston');
const dateformat = require('dateformat');
const bodyParser = require('body-parser');

global.pool = mariadb.createPool({
  host: 'localhost', 
  user: process.env.DB_User,
  password: process.env.DB_PW,
  database: 'kakao',
  idleTimeout: 0
});

const nodeKakao = require('node-kakao');
global.client = new nodeKakao.TalkClient(process.env.TalkClientName, process.env.TalkClientUUID);

client.login(process.env.TalkClientLoginID, process.env.TalkClientLoginPW, true)
  .then(main)
  //.catch(err => { console.error(`Login Attempt failed. status: ${err.status}, msg: ${err.message}`); });

function main() {
  console.log('Login successful. Main client is in startup.');
  /*
  // Update friends list
  console.log(client.Auth.getLatestAccessData())
  //client.service.requestFriendList(['normal'], [], client.auth.accessData.accessToken)
  client.service.requestBlockedFriendList()
    .then((res) => { console.log(res) })
    .catch(err => { console.error(err); });
  //client.service.requestProfile().then(res => console.log(res));
  */
  
  // Incoming message event handler
  client.on('message', async chat => {
    require('./modules/ajoumeowBot.js').autoVerify(chat);
    require('./modules/webClient.js').chatManager(chat);
  });
  
  // Message read event handler
  client.on('message_read', (channel, reader, readChatLogId) => {

  });
}

if (process.env.NODE_ENV !== "production") {
  const chokidar = require("chokidar");
  const watcher = chokidar.watch("./modules");
  watcher.on("change", (path, stats) => {
    let relative_path = './' + path;
    delete require.cache[require.resolve(relative_path)];
    console.log(relative_path + ' reloaded.');
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
  