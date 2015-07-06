import React from 'react';
import mui from 'material-ui';
import { Link } from 'react-router';
let RaisedButton = mui.RaisedButton;
let Dialog = mui.Dialog;

class Intro extends React.Component {

  render() {
    let containerStyle = {
      textAlign: 'center',
      maxWidth: 700,
      margin: '3%'
    };

    return (
      <div style={containerStyle}>
        <h1>Google Search+Location History</h1>
        <h2>You've been searching. You've been going places. And Google's been tracking it all.
        This tool aggregates your search history with your location history&mdash;view your searches overlaid
        on a map, play back through time, and more.</h2>
        <RaisedButton
          label="Map your history"
          primary={true}
          containerElement={this.props.unifiedData.points.length > 0 ? <Link to="viewer" /> : <Link to="uploader" />}
          linkButton={true} />
        <p>A project by <a href="https://theopatt.com">Theo Patt</a>. Made in 2015 in Memphis, Tennessee.</p>
      </div>
    );
  }
}

export default Intro;
