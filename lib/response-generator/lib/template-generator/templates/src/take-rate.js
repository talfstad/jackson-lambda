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
});
