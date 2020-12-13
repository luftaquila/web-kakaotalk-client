require('dotenv').config();
require('../../../../res/dateFormat.js');
const request = require('request');
const nodeKakao = require('node-kakao');
const client = new nodeKakao.TalkClient(process.env.TalkClientName, process.env.TalkClientUUID);

client.login(process.env.TalkClientLoginID, process.env.TalkClientLoginPW, true).then(main)

async function main() {
  console.log('Login successful. Main client is in startup.');
  
  let target = await client.userManager.map.get('246786864').createDM()
  let channel = await target.result.sendText('test');
  
  let targetChannel = await client.channelManager.map.get('293729341839798').sendText('hi')//.createDM()

  
  //https://github.com/storycraft/node-kakao/search?q=mark
  
  client.on('message', async chat => {
    
    /*
    if(chat.channel.id == 284687032997214 || chat.channel.id == 184830542711986) { // 미유미유 급식인증 event
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
              chat.channel.sendText(resultString);
            }
          }
        }
      }
    } 
    */
  });
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