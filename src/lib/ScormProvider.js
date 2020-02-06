import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import { SCORM, debug } from 'pipwerks-scorm-api-wrapper';

export const ScoContext = React.createContext({
  apiConnected: false,
  learnerName: '',
  completionStatus: 'incomplete',
  suspendData: {},
  scormVersion: '',
  getSuspendData: () => {},
  setSuspendData: () => {},
  setStatus: () => {},
  set: () => {},
  get: () => {}
});

class ScormProvider extends Component {
  constructor(props) {
    super(props);

    autoBind(this);

    // define state, including methods to be passed to context consumers
    // this entire state will be passed as 'sco' to consumers
    this.state = {
      apiConnected: false,
      learnerName: '',
      completionStatus: 'incomplete',
      suspendData: {},
      scormVersion: '',
      getSuspendData: this.getSuspendData,
      setSuspendData: this.setSuspendData,
      setStatus: this.setStatus,
      set: this.set,
      get: this.get
    };
  }

  componentDidMount() {
    this.createScormAPIConnection();
    window.addEventListener("beforeunload", this.closeScormAPIConnection);
  }

  componentWillUnmount() {
    this.closeScormAPIConnection();
    window.removeEventListener("beforeunload", this.closeScormAPIConnection);
  }

  createScormAPIConnection() {
    if (this.state.apiConnected) return;

    if (this.props.version) SCORM.version = this.props.version;
    if (typeof this.props.debug === "boolean") debug.isActive = this.props.debug;
    const scorm = SCORM.init();
    if (scorm) {
      const version = SCORM.version;
      const learnerName = version === '1.2' ? SCORM.get('cmi.core.student_name') : SCORM.get('cmi.learner_name');
      const completionStatus = SCORM.status('get');
      this.setState({
        apiConnected: true,
        learnerName: learnerName,
        completionStatus: completionStatus,
        scormVersion: version
      }, () => {
        this.getSuspendData();
      });
    } else {
      // could not create the SCORM API connection
      console.error("ScormProvider init error: could not create the SCORM API connection");
    }
  }

  closeScormAPIConnection() {
    if (!this.state.apiConnected) return;

    this.setSuspendData();
    SCORM.status('set', this.state.completionStatus);
    SCORM.save();
    const success = SCORM.quit();
    if (success) {
      this.setState({
        apiConnected: false,
        learnerName: '',
        completionStatus: 'incomplete',
        suspendData: {},
        scormVersion: ''
      });
    } else {
      // could not close the SCORM API connection
      console.error("ScormProvider error: could not close the API connection");
    }
  }

  getSuspendData() {
    if (!this.state.apiConnected) return;

    const data = SCORM.get('cmi.suspend_data');
    const suspendData = data && data.length > 0 ? JSON.parse(data) : {};
    this.setState({
      suspendData
    });
  }

  setSuspendData(key, val) {
    if (!this.state.apiConnected) return;

    let currentData = {...this.state.suspendData} || {};
    if (key && val) currentData[key] = val;
    let success = SCORM.set('cmi.suspend_data', JSON.stringify(currentData));
    if (success) {
      this.setState({
        suspendData: currentData
      }, () => {
        SCORM.save();
      });
    } else {
      // error setting suspend data
      console.error("ScormProvider setStatus error: could not set the suspend data provided");
    }
  }

  setStatus(status) {
    if (!this.state.apiConnected) return;

    const validStatuses = ["passed", "completed", "failed", "incomplete", "browsed", "not attempted", "unknown"];
    if (validStatuses.includes(status)) {
      let success = SCORM.status("set", status);
      if (success) {
        this.setState({
          completionStatus: status
        }, () => {
          SCORM.save();
        });
      } else {
        // error setting status
        console.error("ScormProvider setStatus error: could not set the status provided");
      }
    }
  }

  set(param, val) {
    if (!this.state.apiConnected) return;

    let success = SCORM.set(param, val);
    if (success) {
      SCORM.save();
    } else {
      // error setting value
      console.error("ScormProvider set error: could not set:", param, val);
    }
  }

  get(param) {
    if (!this.state.apiConnected) return;
    return SCORM.get(param);
  }

  render() {
    return (
      <ScoContext.Provider value={this.state}>
        {this.props.children}
      </ScoContext.Provider>
    );
  }
}

ScormProvider.propTypes = {
  version: PropTypes.oneOf(['1.2', '2004']),
  debug: PropTypes.bool,
}

export default ScormProvider;