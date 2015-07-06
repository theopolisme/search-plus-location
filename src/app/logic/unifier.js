import work from 'webworkify';

function unify(searches, locations) {
  return new Promise(function (resolve, reject) {
    let w = work(require('./unifier-worker.js'));

    w.addEventListener('message', function (ev) {
      resolve(ev.data);
    });

    w.addEventListener('error', reject);

    w.postMessage({
      searches: searches,
      locations: locations
    });
  }) 
}

export default {
  unify: unify
};
