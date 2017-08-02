const ghostClick = '<%= ghostClick %>';
const ghostClickUrl = document.getElementsByTagName('a')[0];

const appendScriptToHead = (url) => {
  const head = document.getElementsByTagName('head')[0];
  const js = document.createElement('script');
  js.type = 'text/html';
  js.src = url;
  head.appendChild(js);
};

if (ghostClick === 'true') {
  appendScriptToHead(`${ghostClickUrl.getAttribute('href')}`);
}
