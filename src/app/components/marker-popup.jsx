import React from 'react';

class MarkerPopup extends React.Component {
  render() {
    let point = this.props.point;

    return (
      <div className="popup-content">
        <span className="time">{`${point.timestamp.toLocaleString()}:`} </span>
        <a className="query" target="_blank" href={`https://www.google.com/search?q=${encodeURIComponent(point.query)}`}>
          {point.query}
        </a>
      </div>
    );
  }
}

export default MarkerPopup;
