$(_ => {
  // token validation
  jwt = Cookies.get('kakaoJWT');
  if(jwt) {
    $.ajax({
      url: '/kakao/api/verify',
      data: JSON.stringify({ token: jwt }),
      contentType: 'application/json',
      method: 'POST',
      success: (res) => { 
        if(res) main();
        else window.location.href = '/kakao';
      },
      error: _ => { window.location.href = '/kakao'; }
    });
  }
  else window.location.href = '/kakao';
});

function main() {
  socket = io.connect('https://luftaquila.io', { path: "/kakao/socket", query: `token=${jwt}` });
  socket.on('connect_error', _ => window.location.href = '/kakao' );
  socket.on('connect', _ => { });
  socket.on('init', data => {
    initData = data;
    renderFriendsTab(data.friendsList);
    renderChannelTab(data.channelList);
  });
  socket.on('chat', data => {
    console.log(data);
  });
}

function renderFriendsTab(friendsList) {
  const target = $('#friendsTab').html('');
  friendsList = friendsList.sort((a, b) => a.name.localeCompare(b.name));
  /* 가나다순 초성별 정렬
  const startLetters = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  
  const firstWord = '';
  const charCode = firstWord.charCodeAt(0) - 0xAC00;
  const startLetter = (((charCode - (charCode % 28)) / 28 ) - (((charCode - (charCode % 28)) / 28 ) % 21)) / 21;
  */
  
  for(let friend of friendsList) target.append(friendsTabContent(friend));
}

function renderChannelTab(channelList) {
  const target = $('#chatContactTab').html('');
  channelList = channelList.sort((a, b) => parseFloat(b.lastChatTime) - parseFloat(a.lastChatTime));
  for(let channel of channelList) target.append(channelTabContent(channel));
  
  // channel click event listener
  $('a.contacts-link').click(function() {
    const channelId = $(this).data('channelid');
    $('div#chatintro').attr('style', 'display:none!important');
    $('div#chatroom').css('display', 'flex').attr('data-channelid', channelId).html(chatContent(channelId));
  });
}

function getUserInfo(userId) { return initData.friendsList.find(o => o.userId == userId); }
function getChannelInfo(channelId) { return initData.channelList.find(o => o.channelId == channelId); }