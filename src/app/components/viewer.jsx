import React from 'react';
import reactMixin from 'react-mixin';
import LocalStorageMixin from 'react-localstorage';
import { Toolbar, ToolbarGroup, ToolbarTitle, ToolbarSeparator, FlatButton, DropDownMenu } from 'material-ui';
import { Link } from 'react-router';
import Map from './map.jsx';
import MonthYearSelect from './month-year-select.jsx';

@reactMixin.decorate(LocalStorageMixin)
class Viewer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modeIndex: 0,
      timelineMonthToShow: null
    }

    this._onRestart = this._onRestart.bind(this);
    this._onDropDownSelect = this._onDropDownSelect.bind(this);
    this._onTimelineMonthSelect = this._onTimelineMonthSelect.bind(this);
  }

  _onRestart() {
    this.props.setUnifiedData({points: [], locationless: 0});
    this.context.router.transitionTo('intro');
  }

  _onDropDownSelect(e, selectedIndex, menuItem) {
    this.setState({modeIndex: selectedIndex});
  }

  _onTimelineMonthSelect(date) {
    this.setState({timelineMonthToShow: date});
  }

  render() {
    let points = this.props.unifiedData.points;

    if (points.length === 0) {
      return (
        <div style={{maxWidth: 700, margin: '3%', textAlign: 'center'}}>
          <div style={{marginBottom: 5}}>No data loaded.</div>
          <FlatButton secondary={true} label="Restart" onTouchTap={this._onRestart} />
        </div>
      );
    }

    let modeOptions = [
      { payload: 'all', text: 'All queries (clustered)' },
      { payload: 'time', text: 'Time playback' }
    ];

    let containerStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      position: 'absolute',
      top: 0,
      left: 0,
      color: '#fff'
    },
    toolbarStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'rgb(69, 69, 69)',
      zIndex: 999
    },
    subtitleStyle = {
      fontSize: '0.7em',
      color: 'gray'
    };

    return (<div style={containerStyle}>
      <Toolbar style={toolbarStyle}>
        <ToolbarGroup key={0} float="left">
          <ToolbarTitle text={<span>{"Search+Location Visualizer"} <span style={subtitleStyle}>Fork me on <a href="https://github.com/theopolisme/search-plus-location" target="_blank">GitHub</a></span></span>} style={{color: '#fff'}}/>
          
        </ToolbarGroup>
        <ToolbarGroup key={1} float="right">
          <DropDownMenu menuItems={modeOptions} underlineStyle={{borderTop: 'none'}} selectedIndex={this.state.modeIndex} onChange={this._onDropDownSelect}/>
          {modeOptions[this.state.modeIndex].payload === 'time' ?
            <MonthYearSelect
              min={points[0].timestamp}
              max={points[points.length - 1].timestamp}
              selected={this.state.timelineMonthToShow}
              onChange={this._onTimelineMonthSelect}/>
          : null}
          <FlatButton secondary={true} label="Restart" onTouchTap={this._onRestart} />
        </ToolbarGroup>
      </Toolbar>
      <Map points={points} mode={modeOptions[this.state.modeIndex].payload}
        timelineMonthToShow={this.state.timelineMonthToShow}/>
    </div>);
  }
}

Viewer.displayName = 'Viewer';

Viewer.contextTypes = {
  router: React.PropTypes.func
};

export default Viewer;
