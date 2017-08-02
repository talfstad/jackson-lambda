const ghostClick = '<%= ghostClick %>';

if (ghostClick === 'true') {
  console.log('ghostclicking');
  // const appendScriptToHead = (url) => {
  //   const head = document.getElementsByTagName('head')[0];
  //   const js = document.createElement('script');
  //   js.type = 'text/html';
  //   js.src = url;
  //   head.appendChild(js);
  // };

  const ghostClickUrl = document.getElementsByTagName('a')[0];
  console.log(ghostClickUrl);
  // appendScriptToHead(ghostClickUrl.getAttribute('href'));
}
