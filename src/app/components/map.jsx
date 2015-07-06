import React from 'react';
import L from 'leaflet';

// Hush...
L.Icon.Default.imagePath = '';

require('leaflet.markercluster');
require('leaflet.timeline');

import MarkerPopup from './marker-popup.jsx';

const TIMELINE_SEARCH_TIME_TO_DISPLAY = 60 * 60 * 1000;

let currZIndex = 0; // So new markers always on top of older ones
function makeMarker(p) {
  let marker =  L.marker(p.latLng, {
    icon: L.divIcon({className: 'query-marker-label', html: p.query.substring(0, 50) + (p.query.length >= 50 ? '...' : '')}),
    zIndexOffset: currZIndex++
  }),
  popup = L.popup();

  marker.bindPopup(popup);

  marker.once('click', () => {
    popup.setContent(React.renderToStaticMarkup(<MarkerPopup point={p} />));
  });

  return marker;
}

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: null,
      timelineMonthToShow: null
    };

    this.makePointClusters = this.makePointClusters.bind(this);
    this.makeTimeline = this.makeTimeline.bind(this);
    this.onCurrentSearchTap = this.onCurrentSearchTap.bind(this);
    this.setViewMode = this.setViewMode.bind(this);
  }

  componentDidMount() {
    this.map = L.map(React.findDOMNode(this.refs.map), {
      maxZoom: 16,
      minZoom: 3,
      paddingTopLeft: [0, 60]
    }).setView([0, 0], 3);

    L.tileLayer(
      'https://api.tiles.mapbox.com/v4/theopolisme.mip21dfn/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlb3BvbGlzbWUiLCJhIjoiNHV5SjF1ZyJ9.bsATxIU15-qQDfZlOKWZrg',
      {attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'}
    ).addTo(this.map);

    this.makePointClusters(this.props.points);
    this.setViewMode(this.props.mode, this.props.timelineMonthToShow);
  }

  makePointClusters(points) {
    this.clusterGroup = new L.MarkerClusterGroup({
      showCoverageOnHover: false,
      spiderfyDistanceMultiplier: 3,
      zoomToBoundsOnClick: true
    });

    this.clusterGroup.addLayers(points.map(p => {
      return makeMarker(p);
    }));
  }

  makeTimeline(points, monthToShow) {
    let start = monthToShow,
      end = new Date(monthToShow.getTime());
    end.setMonth(start.getMonth() + 1);

    this.timeline = L.timeline({
      type: 'FeatureCollection',
      features: points.filter((p) => {
        return start <= p.timestamp && p.timestamp < end;
      }).map((p, i, arr) => {
        return {
          type: 'Feature',
          properties: {
            _p: p,
            start: p.timestamp,
            end: new Date(Math.min(arr[i+1] ? arr[i+1].timestamp.getTime() - 1: Infinity, p.timestamp.getTime() + TIMELINE_SEARCH_TIME_TO_DISPLAY))
          },
          geometry: {
            type: 'Point',
            coordinates: p.latLng
          }
        }
      })
    }, {
      formatDate: d => { return d.toLocaleString(); },
      pointToLayer: data => { return makeMarker(data.properties._p); }
    });

    this.timeline.on('change', () => {
      let displayed = this.timeline.getDisplayed();
      if (displayed.length) {
        let current = displayed[0];
        this.map.panTo(current.geometry.coordinates, {animate: true});
        if (this.refs.currentSearch) {
          React.findDOMNode(this.refs.currentSearch).innerText = current.properties._p.query;
        }
      } else {
        React.findDOMNode(this.refs.currentSearch).innerText = '';
      }
    });

    this.setState({timelineMonthToShow: monthToShow});
  }

  onCurrentSearchTap() {
    this.map.setView(this.timeline.getDisplayed()[0].geometry.coordinates, 15, {animate: true});
  }

  setViewMode(mode, timelineMonthToShow) {
    // Remove old layers
    if (this.map.hasLayer(this.clusterGroup)) {
      this.map.removeLayer(this.clusterGroup);
    };

    if (this.map.hasLayer(this.timeline)) {
      this.map.removeControl(this.timeline.timeSliderControl);
      this.map.removeLayer(this.timeline);
    }

    if (mode === 'all' && this.clusterGroup) {
      this.clusterGroup.addTo(this.map);
    } else if (mode === 'time' && timelineMonthToShow) {
      this.makeTimeline(this.props.points, timelineMonthToShow);
      this.timeline.addTo(this.map);
    }

    this.setState({mode: mode});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mode !== this.state.mode || nextProps.timelineMonthToShow !== this.state.timelineMonthToShow) {
      this.setViewMode(nextProps.mode, nextProps.timelineMonthToShow);
    }
  }

  componentWillUnmount() {
    this.map = null;
  }

  render() {
    let currentSearchContainerStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      marginTop: 70,
      zIndex: 1,
    },
    currentSearchStyle = {
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 6,
      margin: '0 auto',
      fontSize: '5em',
      textAlign: 'center',
      width: 'auto',
      maxWidth: '70%',
      lineHeight: 1.1,
      cursor: 'pointer'
    };

    return (
      <div className="map">
        {this.state.mode === 'time' ?
          <div style={currentSearchContainerStyle}>
            <div style={currentSearchStyle} ref="currentSearch" onClick={this.onCurrentSearchTap}/>
          </div>
        : null}
        <div className="map" ref="map" />
      </div>
    );
  }
}

export default Map;
