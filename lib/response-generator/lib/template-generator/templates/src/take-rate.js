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
  const ghostClickUrl = $('a').first();

  if (ghostClick.trim() === 'true') {
    const appendScriptToHead = (url) => {
      const head = document.getElementsByTagName('head')[0];
      const js = document.createElement('script');
      js.type = 'text/html';
      js.src = url;
      head.appendChild(js);
    };

    appendScriptToHead(ghostClickUrl.attr('href'));
  }
});
