import React from 'react';
import mui from 'material-ui';
import reactMixin from 'react-mixin';
import LocalStorageMixin from 'react-localstorage';
import { RouteHandler } from 'react-router';

require('json.date-extensions');
JSON.useDateParser();

let ThemeManager = new mui.Styles.ThemeManager();

@reactMixin.decorate(LocalStorageMixin)
class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      unifiedData: {
        points: [],
        locationless: 0
      }
    };

    this.setUnifiedData = this.setUnifiedData.bind(this);
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  }

  componentWillMount() {
    ThemeManager.setTheme(ThemeManager.types.DARK);
  }

  setUnifiedData(data) {
    this.setState({
      unifiedData: data
    });
  }

  render() {
    let outerContainerStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
    }

    return (
      <div style={outerContainerStyle}>
        <RouteHandler {...this.state} setUnifiedData={this.setUnifiedData} />
      </div>
    );
  }
}

Main.displayName = 'Main';

Main.contextTypes = {
  router: React.PropTypes.func
};

Main.childContextTypes = {
  muiTheme: React.PropTypes.object
};

export default Main;
