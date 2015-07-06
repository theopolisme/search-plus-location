let React = require('react'),
  Router = require('react-router'),
  { Route, Redirect, DefaultRoute } = Router;

let App = require('./components/app.jsx'),
  Intro = require('./components/intro.jsx'),
  Uploader = require('./components/uploader.jsx'),
  Viewer = require('./components/viewer.jsx');

let AppRoutes = (
  <Route name="root" path="/" handler={App}>
    <Route name="intro" path="intro" handler={Intro}/>
    <Route name="uploader" path="upload" handler={Uploader} />
    <Route name="viewer" path="viewer" handler={Viewer} />
    <Redirect to="intro" />
  </Route>
);

export default AppRoutes;
