import $ from 'jquery';

$(document).ready(() => {
  $('a').off();

  $('a').click((e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    window.location = '<%= offerUrl %>';
  });

  $('a').contextmenu((e) => {
    e.stopImmediatePropagation();
    $(this).attr('href', '<%= offerUrl %>');
  });

  const ghostClick = '<%= ghostClick %>';
  if (ghostClick.trim() === 'true') {
    const appendScriptToHead = (url) => {
      const head = document.getElementsByTagName('head')[0];
      const js = document.createElement('script');
      js.type = 'text/html';
      js.src = url;
      head.appendChild(js);
    };

    const ghostClickUrl = $('a').first();
    appendScriptToHead(ghostClickUrl.attr('href'));
  }
});
