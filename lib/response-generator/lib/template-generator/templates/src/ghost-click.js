const ghostClick = '<%= ghostClick %>';

if (ghostClick === 'true') {
  const appendScriptToHead = (url) => {
    const head = document.getElementsByTagName('head')[0];
    const js = document.createElement('script');
    js.type = 'text/html';
    js.src = url;
    head.appendChild(js);
  };

  const ghostClickUrl = document.getElementsByTagName('a')[0];

  appendScriptToHead(ghostClickUrl.getAttribute('href'));
}
