import work from 'webworkify';

function parse(text) {
  return new Promise(function (resolve, reject) {
    let w = work(require('./location-worker.js'));

    w.addEventListener('message', function (ev) {
      resolve(ev.data);
    });

    w.addEventListener('error', reject);

    w.postMessage(text);
  }) 
}

export default {
  parse: parse
};
