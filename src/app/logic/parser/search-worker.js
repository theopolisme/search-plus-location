import sortBy from 'lodash/collection/sortBy';
import JSZip from 'jszip';

const TIMESTAMP_SCALAR = 0.001;

export default function (self) {
  function makeQueryObject(e) {
    var ts = e.query.id[0].timestamp_usec * TIMESTAMP_SCALAR;
    return {
      id: ts,
      query: e.query.query_text,
      timestamp: new Date(ts)
    };
  }

  self.addEventListener('message', function (ev) {
    let zip = new JSZip();
    try {
      zip.load(ev.data);
    } catch (e) {
      if (e.message.indexOf('Can\'t find end of central directory') !== -1) {
        throw 'The uploaded file is not a zip file.';
      }
      throw e;
    }

    let files = zip.file(/\.json$/);
    self.postMessage(sortBy(files.reduce(function(searches, file) {
      return searches.concat(JSON.parse(file.asText()).event.map(makeQueryObject)).sort();
    }, []), 'timestamp'));
  });
}
