$(_ => {
  console.log(true);
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
  socket.on('connect', _ => {
    
  });
}