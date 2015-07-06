import React from 'react';
import Dropzone from 'react-dropzone';
import mui from 'material-ui';
import SearchParser from '../logic/parser/search';
import LocationParser from '../logic/parser/location';
import Unifier from '../logic/unifier';

let { AutoPrefix } = mui.Styles,
  { LinearProgress, FlatButton } = mui;

class Uploader extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      upload: {
        search: false,
        location: false
      },  
      isUploading: false,
      statusMessage: '',
      hasError: false
    };

    this.reset = this.reset.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.doUpload = this.doUpload.bind(this);
  }

  reset() {
    this.setState({
      upload: {
        search: false,
        location: false
      },  
      isUploading: false,
      statusMessage: '',
      hasError: false
    })
  }

  onDrop(type, files) {
    this.state.upload[type] = files;
    this.setState(this.state);

    if (this.state.upload.search && this.state.upload.location) {
      this.setState({
        isUploading: true
      });

      this.doUpload().catch(e => {
        this.setState({
          isUploading: true,
          statusMessage: `Error loading data: ${e.message ? e.message : e}`,
          hasError: true
        });
      });
    }
  }

  doUpload() {
    let u = this;

    function upload (code, parser) {
      return new Promise(function (resolve, reject) {
        let files = u.state.upload[code];

        if (files.length !== 1) {
          return reject('A single file must be uploaded.');
        }

        if (u.state.hasError) {return;}
        u.setState({statusMessage: 'Loading file...'});

        let reader = new FileReader();

        reader.onload = function (ev) {
          u.setState({statusMessage: 'Parsing chunks...'});
          parser.parse(ev.target.result)
            .then(resolve)
            .catch(reject);
        };

        if (code === 'search') {
          reader.readAsArrayBuffer(files[0]);
        } else {
          reader.readAsText(files[0]);
        }
      });
    }

    return Promise.all([
      upload('search', SearchParser),
      upload('location', LocationParser)
    ]).then(results => {
      u.setState({statusMessage: 'Linking locations and search queries (this may take a moment)...'});
      return Unifier.unify.apply(null, results)
    }).then((d) => {
      u.props.setUnifiedData(d);
      u.context.router.transitionTo('viewer');
    });
  }

  render() {
    let u = this,
      containerStyle = {
        maxWidth: 700,
        width: this.state.isUploading ? 500 : null,
        margin: '3%'
      },
      dropzoneStyle = {
        width: '100%',
        border: '3px solid white',
        padding: 5,
        marginBottom: 15,
        cursor: 'pointer',
        textAlign: 'center',
        [AutoPrefix.single('userSelect')]: 'none'
      },
      statusStyle = {
        padding: '10px 0',
        lineHeight: 1
      };

    function makeDropzone(code, name) {
      return (
        <Dropzone style={dropzoneStyle} className={u.state.upload[code] ? 'dropzone active' : null} multiple={false} onDrop={u.onDrop.bind(u, code)}>
          {u.state.upload[code] ? `${name} selected. Ready to process.` : `Drop the ${name} file here, or click to select.`}
        </Dropzone>
      );
    }

    return (
      <div style={containerStyle}>
        <h1>Load your data.</h1>
        {
          this.state.isUploading
        ?
          <div>
            <LinearProgress mode={this.state.hasError ? 'determinate' : 'indeterminate'} value={100} />
            <div>
              <div style={statusStyle}>{this.state.statusMessage}</div>
              {this.state.hasError && <FlatButton label="Restart" onTouchTap={this.reset} />}
            </div>
          </div>
        :
          <div>
            <p><em>Note: All processing takes place directly on your computer. None of your search or location history is uploaded to
            any external servers (besides Google's, that is)...</em></p>
            <p>In order to run the visualization, <strong>there are two separate files you must download:</strong></p>
            <ol>
              <li><strong>Location History</strong>: Log in to <a href="https://www.google.com/settings/takeout">Google Takeout</a> and deselect everything except Location History by clicking
              "Select none" and then reselecting "Location History". Click "Next" and then "Create archive". Once the archive has been created, the "Download" button will become clickable&mdash;
              click and a ZIP file will be downloaded to your computer. Unzip the file and navigate to the "Location History" directory, then drag "LocationHistory.json" onto the first box below.</li>
              <li><strong>Search History</strong>: Log in to your <a href="https://history.google.com/history/">Google Web &amp; App Activity</a>, click the three vertical dots in the upper
              righthand corner, select "Download searches", and then press "Create archive". A file will be saved to your Google Drive, and you'll receive an email with a link when it's
              done. Download the file using the button in the Google Drive toolbar, and drag and drop the downloaded ZIP file onto the second box below.</li>
            </ol>
            {makeDropzone('location', 'LocationHistory.json')}
            {makeDropzone('search', 'Searches.zip')}
            <p>When both files have been selected, the visualization will begin automatically.</p>
          </div>
        }
      </div>
    );
  }
}

Uploader.contextTypes = {
  router: React.PropTypes.func
};

export default Uploader;
