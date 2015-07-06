(function () {
  var React = require('react'),
    Router = require('react-router'),
    AppRoutes = require('./app-routes.jsx'),
    injectTapEventPlugin = require('react-tap-event-plugin');

  // Inject css
  var css = require('./app.css');

  // Needed for React Developer Tools
  window.React = React;

  // Needed for onTouchTap
  // Can go away when react 1.0 release
  // https://github.com/zilverline/react-tap-event-plugin
  injectTapEventPlugin();

  // Log analytics event if available
  function analytics(state, options={}) {
    if (!window.ga) {
      return console.log(`Would be logging pageview: ${state.path}`);
    }

    options.page = state.path;
    ga('send', 'pageview', options);
  }

  Router
    .create({
      routes: AppRoutes,
      scrollBehavior: Router.ScrollToTopBehavior
    })
    .run(function (Handler, state) {
      React.render(<Handler/>, document.getElementById('app'));
      analytics(state);
    });

})();
