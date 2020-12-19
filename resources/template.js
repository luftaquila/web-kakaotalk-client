function friendsTabContent(friend) {
  return `
    <!-- friends Item Start -->
      <li class="contacts-item" data-userId="${friend.userId}">
        <a class="contacts-link" href="#">
          <div class="avatar bg-info text-light">
            ${friend.profileImageUrl ? '<img src="/kakao/data/user/' + friend.userId + '/profile.jpg" alt="">' : '<span><i class="fad fa-user"></i></span>'}
          </div>
          <div class="contacts-content">
            <div class="contacts-info">
              <h6 class="chat-name text-truncate">${friend.name}</h6>
            </div>
            <div class="contacts-texts">
              <p class="text-muted mb-0">${friend.statusMessage ? friend.statusMessage : ''}</p>
            </div>
          </div>
        </a>
      </li>
      <!-- friends Item End -->
  `;
}

function channelTabContent(channel) {
  const chatTime = new Date(channel.lastChatTime * 1000);
  const isChatTimeToday = chatTime.toDateString() == new Date().toDateString();
  const profileImg = channel.roomImageUrl ? '<img src="/kakao/data/channel/' + channel.channelId + '/profile.jpg" alt="">' : (channel.userCount == 2 ? (getUserInfo(JSON.parse(channel.userList)[0].userId).profileImageUrl ? '<img src="/kakao/data/user/' + JSON.parse(channel.userList)[0].userId + '/profile.jpg" alt="" >' : '<span><i class="fad fa-user"></i></span>') : '<span><i class="fad fa-user-friends"></i></span>');
  return `
    <!-- Chat Item Start -->
    <li class="contacts-item">
      <a class="contacts-link" data-channelid="${channel.channelId}">
        <div class="avatar avatar-online bg-info text-light"> ${profileImg} </div>
        <div class="contacts-content">
          <div class="contacts-info">
            <h6 class="chat-name text-truncate">${channel.name}</h6>
            <div class="chat-time">${isChatTimeToday ? chatTime.format('HH:MM') : chatTime.format('m월 d일')}</div>
          </div>
          <div class="contacts-texts">
            <p class="text-truncate">${channel.lastChatText}</p>
          </div>
        </div>
      </a>
    </li>
    <!-- Chat Item End -->
  `;
}

function chatContent(channelId) {
  const channel = getChannelInfo(channelId);
  const userList = JSON.parse(channel.userList);
  channel.isDirectChat = channel.userCount == 2;
  const chatTime = new Date(channel.lastChatTime * 1000);
  const isChatTimeToday = chatTime.toDateString() == new Date().toDateString();
  const profileImg = channel.roomImageUrl ? '<img src="/kakao/data/channel/' + channel.channelId + '/profile.jpg" alt="">' : (channel.userCount == 2 ? (getUserInfo(userList[0].userId).profileImageUrl ? '<img src="/kakao/data/user/' + userList[0].userId + '/profile.jpg" alt="" >' : '<span><i class="fad fa-user"></i></span>') : '<span><i class="fad fa-user-friends"></i></span>');

  const header = `
    <!-- Chat Header Start-->
    <div class="chat-header">
      <!-- Chat Back Button (Visible only in Small Devices) -->
      <button class="btn btn-secondary btn-icon btn-minimal btn-sm text-muted d-xl-none" type="button" data-close="">
        <svg class="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
      </button>
      <!-- Chat participant's Name -->
      <div class="media chat-name align-items-center text-truncate">
        <div class="avatar avatar-online bg-info text-light d-none d-sm-inline-block mr-3"> ${profileImg} </div>
        <div class="media-body align-self-center ">
          <h6 class="text-truncate mb-0">${channel.name}</h6>
          <small class="text-muted">${channel.isDirectChat ? (getUserInfo(userList[0].userId).statusMessage ? getUserInfo(userList[0].userId).statusMessage : '') : channel.userCount + '명' }</small>
        </div>
      </div>
      <!-- Chat Options -->
      <ul class="nav flex-nowrap">
        <li class="nav-item list-inline-item d-none d-sm-block mr-1">
          <a class="nav-link text-muted px-1" data-toggle="collapse" data-target="#searchCollapse" href="#" aria-expanded="false">
            <svg class="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </a>
        </li>
        <li class="nav-item list-inline-item d-none d-sm-block mr-0">
          <div class="dropdown">
            <a class="nav-link text-muted px-1" href="#" role="button" title="Details" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <svg class="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </a>
            <div class="dropdown-menu dropdown-menu-right">
              <a class="dropdown-item align-items-center d-flex" href="#" data-chat-info-toggle="">
                <svg class="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>View Info</span>
              </a>
              <a class="dropdown-item align-items-center d-flex" href="#">
                <svg class="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                </svg>
                <span>Mute Notifications</span> 
              </a> <!--
              <a class="dropdown-item align-items-center d-flex" href="#">
                <svg class="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                <span>Archive</span>
              </a>
              <a class="dropdown-item align-items-center d-flex" href="#">
                <svg class="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span>Delete</span>
              </a> -->
              <a class="dropdown-item align-items-center d-flex text-danger" href="#">
                <svg class="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
                <span>Leave</span>
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!-- Chat Header End-->
    <!-- Search Start -->
    <div class="collapse border-bottom px-3" id="searchCollapse">
      <div class="container-xl py-2 px-0 px-md-3">
        <div class="input-group bg-light ">
          <input type="text" class="form-control form-control-md border-right-0 transparent-bg pr-0" placeholder="Search">
          <div class="input-group-append">
            <span class="input-group-text transparent-bg border-left-0">
              <svg class="hw-20 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- Search End -->
  `;
  
  const body = `

  `;
  return header + body;
}