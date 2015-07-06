const KML_DATA_REGEXP = /<when>(.*?)<\/when>\s*<gx:coord>(\S*)\s(\S*)\s(\S*)<\/gx:coord>/g,
  LATLNG_SCALAR = 0.0000001;

export default function (self) {
  self.addEventListener('message', function (ev) {
    let locations = JSON.parse(ev.data).locations;

    self.postMessage(locations.map(location => {
      return {
        latLng: [location.latitudeE7 * LATLNG_SCALAR, location.longitudeE7 * LATLNG_SCALAR],
        timestamp: new Date(+location.timestampMs),
        accuracy: +location.accuracy
      };
    }));
  });
}
