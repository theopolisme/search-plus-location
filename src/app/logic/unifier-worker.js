import groupBy from 'lodash/collection/groupBy';

const ACCEPTABLE_DIFFERENCE = 30 * 60 * 1000,
  LOCATION_ACCURACY_THRESHOLD = 500,
  HOUR_HASH_END_INDEX = 13;

export default function (self) {
  self.addEventListener('message', function (ev) {
    function toHourHash(d) {
      return d.toISOString().substring(0, HOUR_HASH_END_INDEX);
    }

    function closestLocationByDate(locations, testDate) {
      let bestDiff = -(new Date(0,0,0)).valueOf(),
        bestIndex = 0,
        currDiff = 0,
        i = 0;

      for (i=0; i<locations.length; ++i) {
        currDiff = Math.abs(locations[i].timestamp - testDate);
        if (currDiff < bestDiff) {
          bestIndex = i;
          bestDiff = currDiff;
        }
      }

      return locations[bestIndex];
    }

    let { searches, locations } = ev.data,
      accurateLocations = locations.filter(l => {return l.accuracy <= LOCATION_ACCURACY_THRESHOLD; }),
      locationless = 0;
    
    let locationsByHour = groupBy(accurateLocations, l => { return toHourHash(l.timestamp); });
    
    let points = searches.reduce((result, search) => {
      let locations = locationsByHour[toHourHash(search.timestamp)];

      if (locations) {
        let location = closestLocationByDate(locations);
        if (Math.abs(location.timestamp - search.timestamp) <= ACCEPTABLE_DIFFERENCE) {
          search.latLng = location.latLng;
          result.push(search);
        } else {
          locationless++;
        }
      } else {
        locationless++;
      }

      return result;

    }, []);

    self.postMessage({
      points: points,
      locationless: locationless
    });
  });
}
