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
    renderFriendsTab(data.friendsList);
    renderChannelTab(data.channelList);
  });
  socket.on('chat', data => {
    console.log(data);
  });
}

function renderFriendsTab(friendsList) {
  const target = $('#friendsTab');
  friendsList = friendsList.sort((a, b) => a.name.localeCompare(b.name));
  
  /* 가나다순 초성별 정렬
  const startLetters = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  
  const firstWord = '';
  const charCode = firstWord.charCodeAt(0) - 0xAC00;
  const startLetter = (((charCode - (charCode % 28)) / 28 ) - (((charCode - (charCode % 28)) / 28 ) % 21)) / 21;
  */
  
  for(let friend of friendsList) {
    const htmlStr = `
      <!-- friends Item Start -->
      <li class="contacts-item active" data-userId="${friend.userId}">
        <a class="contacts-link" href="#">
          <div class="avatar">
            <img src="../data/profileImage/${friend.userId}.jpg" alt="">
          </div>
          <div class="contacts-content">
            <div class="contacts-info">
              <h6 class="chat-name text-truncate">${friend.name}</h6>
            </div>
            <div class="contacts-texts">
              <p class="text-muted mb-0">${friend.statusMessage}</p>
            </div>
          </div>
        </a>
      </li>
      <!-- friends Item End -->`;
    target.append(htmlStr);
  }
}

function renderChannelTab(channelList) {
  const target = $('#chatContactsList');
  console.log(channelList);
  channelList = channelList.sort((a, b) => parseFloat(b.lastChatTime) - parseFloat(a.lastChatTime));
  
  console.log(channelList);
  for(let channel of channelList) {
    const htmlStr = `
      <!-- Chat Item Start -->
      <li class="contacts-item friends" data-channelId="${channel.channelId}">
        <a class="contacts-link" href="./chat-1.html">
          <div class="avatar avatar-online">
            <img src="./../assets/media/avatar/2.png" alt="">
          </div>
          <div class="contacts-content">
            <div class="contacts-info">
              <h6 class="chat-name text-truncate">${channel.name}</h6>
              <div class="chat-time">Just now</div>
            </div>
            <div class="contacts-texts">
              <p class="text-truncate">${channel.lastChatText}</p>
            </div>
          </div>
        </a>
      </li>
      <!-- Chat Item End -->`;
    target.append(htmlStr);
  }
}