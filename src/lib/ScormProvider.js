import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import { SCORM, debug } from 'pipwerks-scorm-api-wrapper';

function isNumOrString(item) {
  if (typeof item === 'number') return true;
  if (typeof item === 'string' && item.length > 0) return true;
  return false;
}

export const ScoContext = React.createContext({
  apiConnected: false,
  learnerName: '',
  location: '',
  completionStatus: 'unknown',
  objectives: [],
  suspendData: {},
  scormVersion: '',
  loadObjectives: () => {},
  getSuspendData: () => {},
  setSuspendData: () => {},
  clearSuspendData: () => {},
  setStatus: () => {},
  setScore: () => {},
  set: () => {},
  get: () => {}
});

class ScormProvider extends Component {
  constructor(props) {
    super(props);

    // this state will be passed in 'sco' to consumers
    this.state = {
      apiConnected: false,
      learnerName: '',
      completionStatus: 'unknown',
      objectives: [],
      suspendData: {},
      scormVersion: ''
    };

    autoBind(this);
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
      const location = version === '1.2' ? SCORM.get('cmi.core.lesson_location') : SCORM.get('cmi.location');
      const completionStatus = SCORM.status('get');
      this.setState({
        apiConnected: true,
        learnerName,
        location,
        completionStatus,
        scormVersion: version
      }, () => {
        this.loadObjectives();
        this.getSuspendData();
      });
    } else {
      // could not create the SCORM API connection
      if (this.props.debug) console.error("ScormProvider init error: could not create the SCORM API connection");
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
        location: '',
        completionStatus: 'unknown',
        suspendData: {},
        scormVersion: ''
      });
    } else {
      // could not close the SCORM API connection
      if (this.props.debug) console.error("ScormProvider error: could not close the API connection");
    }
  }

  setLocation(newLocation) {
    return new Promise((resolve, reject) => {
      if (!this.state.apiConnected) return reject('SCORM API not connected');

      if (this.props.version) SCORM.version = this.props.version;
      const locationPath = SCORM.version === '1.2' ? 'cmi.core.lesson_location' : 'cmi.location';
      
      SCORM.set(locationPath, newLocation);
      
      this.setState({
        location: newLocation
      }, () => {
        SCORM.save();
        return resolve(this.state.location);
      });
    });
  }

  loadObjectives() {
    return new Promise((resolve, reject) => {
      let objectives = [];

      const size = parseInt(SCORM.get('cmi.objectives._count'));
      if (!isNaN(size)) {
        for (let i = 0; i < size; i++) {
          const id = SCORM.get(`cmi.objectives.${i}.id`);
          const raw = parseInt(SCORM.get(`cmi.objectives.${i}.score.raw`));
          const min = parseInt(SCORM.get(`cmi.objectives.${i}.score.min`));
          const max = parseInt(SCORM.get(`cmi.objectives.${i}.score.max`));
          const status = this.state.scormVersion === '1.2' ?
            SCORM.get(`cmi.objectives.${i}.status`) :
            SCORM.get(`cmi.objectives.${i}.completion_status`);
          objectives.push({ id, score: { raw, min, max }, status });
        }
      }

      this.setState({
        objectives
      }, () => {
        return resolve(this.state.objectives);
      });
    });
  }

  setObjective(id, raw, min, max, status) {
    return new Promise((resolve, reject) => {
      let index = this.state.objectives.findIndex(objective => objective.id === id);
      let newObjective = false;
      if (index === -1) {
        index = parseInt(SCORM.get('cmi.objectives._count'));
        newObjective = true;
      }

      const promiseArr = [];
      if (typeof id === 'string') promiseArr.push(this.set(`cmi.objectives.${index}.id`, id, true));
      if (typeof raw === 'number') promiseArr.push(this.set(`cmi.objectives.${index}.score.raw`, raw, true));
      if (typeof min === 'number') promiseArr.push(this.set(`cmi.objectives.${index}.score.min`, min, true));
      if (typeof max === 'number') promiseArr.push(this.set(`cmi.objectives.${index}.score.max`, max, true));
      const statusField = this.state.scormVersion === '1.2' ? 'status' : 'completion_status';
      if (typeof status === 'string') promiseArr.push(this.set(`cmi.objectives.${index}.${statusField}`, status, true));

      Promise.all(promiseArr)
        .then(() => {
          SCORM.save();

          let newList = [...this.state.objectives];
          if (newObjective) {
            newList = [...newList, { id, score: { raw, min, max }, status }];
          } else {
            newList[index].score.raw = raw;
            newList[index].status = status;
          }

          this.setState({ objectives: newList });

          return resolve(newList);
        })
        .catch(err => {
          console.log(err);
          return reject('could not save the objective provided');
        });
    });
  }

  getSuspendData() {
    return new Promise((resolve, reject) => {

      if (!this.state.apiConnected) return reject('SCORM API not connected');

      const data = SCORM.get('cmi.suspend_data');
      const suspendData = data && data.length > 0 ? JSON.parse(data) : {};
      this.setState({
        suspendData
      }, () => {
        return resolve(this.state.suspendData);
      });

    });
  }

  setSuspendData(key, val) {
    return new Promise((resolve, reject) => {

      if (!this.state.apiConnected) return reject('SCORM API not connected');

      let currentData = {...this.state.suspendData} || {};
      if (isNumOrString(key)) currentData[key] = val;
      const success = SCORM.set('cmi.suspend_data', JSON.stringify(currentData));
      if (!success) return reject('could not set the suspend data provided');
      this.setState({
        suspendData: currentData
      }, () => {
        SCORM.save();
        return resolve(this.state.suspendData);
      });
    });
  }

  clearSuspendData() {
    return new Promise((resolve, reject) => {

      if (!this.state.apiConnected) return reject('SCORM API not connected');

      const success = SCORM.set('cmi.suspend_data', JSON.stringify({}));
      if (!success) return reject('could not clear suspend data');
      this.setState({
        suspendData: {}
      }, () => {
        SCORM.save();
        return resolve(this.state.suspendData);
      });
    });
  }

  setStatus(status, deferSaveCall) {
    return new Promise((resolve, reject) => {

      if (!this.state.apiConnected) return reject('SCORM API not connected');

      const validStatuses = ["passed", "completed", "failed", "incomplete", "browsed", "not attempted", "unknown"];
      if (!validStatuses.includes(status)) {
        if (this.props.debug) console.error("ScormProvider setStatus error: could not set the status provided");
        return reject('could not set the status provided');
      }

      const success = SCORM.status("set", status);
      if (!success) return reject('could not set the status provided');
      this.setState({
        completionStatus: status
      }, () => {
        if (!deferSaveCall) SCORM.save();
        return resolve(this.state.completionStatus);
      });

    });
  }

  setScore(scoreObj) {
    return new Promise((resolve, reject) => {

      if (!this.state.apiConnected) return reject('SCORM API not connected');

      const { value, min, max, status } = scoreObj;
      const coreStr = this.state.scormVersion === '1.2' ? '.core' : ''
      const promiseArr = [];
      if (typeof value === 'number') promiseArr.push(this.set(`cmi${coreStr}.score.raw`, value, true));
      if (typeof min === 'number') promiseArr.push(this.set(`cmi${coreStr}.score.min`, min, true));
      if (typeof max === 'number') promiseArr.push(this.set(`cmi${coreStr}.score.max`, max, true));
      if (typeof status === 'string') promiseArr.push(this.setStatus(status, true));

      Promise.all(promiseArr)
        .then(values => {
          SCORM.save();
          return resolve(values);
        })
        .catch(err => {
          return reject('could not save the score object provided');
        });

    });
  }

  set(param, val, deferSaveCall) {
    return new Promise((resolve, reject) => {

      if (!this.state.apiConnected) return reject('SCORM API not connected');

      const success = SCORM.set(param, val);
      if (!success) return reject(`could not set: { ${param}: ${val} }`);
      if (!deferSaveCall) SCORM.save();
      return resolve([param, val]);

    });
  }

  get(param) {
    if (!this.state.apiConnected) return;
    return SCORM.get(param);
  }

  render() {

    const val = {
      ...this.state,
      setLocation: this.setLocation,
      setObjective: this.setObjective,
      getSuspendData: this.getSuspendData,
      setSuspendData: this.setSuspendData,
      clearSuspendData: this.clearSuspendData,
      setStatus: this.setStatus,
      setScore: this.setScore,
      set: this.set,
      get: this.get
    }

    return (
      <ScoContext.Provider value={val}>
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