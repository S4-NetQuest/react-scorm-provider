import React from 'react';
import ScormProvider from '../../lib/index';
import Learner from './Learner';
import ApiStatus from './ApiStatus';
import logo from '../img/rsp-logo.png';
import s4logo from '../img/s4-logo.png';

const App = () => {
  return (
    <ScormProvider>
      <div id="main-content-container" className="container">
        <section className="header">
          <div className="row">
            <div className="three columns logo">
              <img src={logo} alt="React Scorm Provider Logo" className="u-max-full-width"/>
            </div>
            <div className="nine columns">
              <h1>React SCORM Provider</h1>
              <div className="sponsor-info">
                <p>Presented by:</p>
                <a href="https://s4netquest.com">
                  <img src={s4logo} alt="S4 NetQuest Logo"/>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <h2>What is this?</h2>
          <p>
            React-scorm-provider (RSP) is a set of React Components that simplify the inclusion of the <a href="https://scorm.com/scorm-explained/" target="__blank" rel="noreferrer noopener">SCORM API</a> into your React projects. It utilizes the great SCORM API wrapper from <a href="https://github.com/pipwerks/scorm-api-wrapper" target="__blank" rel="noreferrer noopener">pipwerks</a>. Use RSP to easily add SCORM capabilities to your learning modules, resources, games, or any web content you are creating with React.
          </p>
          <p>
            Keep in mind that this project does not include any kind of packaging or bundling for SCORM. It simply enables SCORM API calls inside your React code. For SCORM packaging your React app build, check out <a href="https://github.com/lmihaidaniel/simple-scorm-packager" target="__blank" rel="noreferrer noopener">simple-scorm-packager</a>. RSP in its current form is meant for single SCO packages and relatively simple communications to the LMS, however it can easily be extended and modified to work for more complex projects.
          </p>
          <p>
            There are two major components of RSP, <code>ScormProvider</code> and <code>withScorm</code>.
          </p>
        </section>

        <section className="section">
          <h2>The Components:</h2>

          <h3>ScormProvider</h3>
          <p>
            <code>{'<ScormProvider></ScormProvider>'}</code>
          </p>
          <p>
            A wrapper component which should only be included ONCE in your React application component tree. It should be included as close to the root of your component tree as possible so that child components can take advantage of the <code>withScorm</code> Higher-Order Component. The <code>ScormProvider</code> component automatically establishes a connection to the SCORM API and retrieves some initial data from the LMS via the SCORM API. Once the <code>ScormProvider</code> Component is included, any other component that is a child of the <code>ScormProvider</code> can access the SCORM-related properties and functions via the <code>withScorm</code> Higher-Order Component described below.
          </p>

          <h5>Configuration</h5>
          <p>The <code>ScormProvider</code> Component accepts two optional configuration props:</p>
          <ul>
            <li>
              <strong>version:</strong> (String) (Optional) Specify the SCORM API version, accepts "1.2" or "2004". This is completely optional and probably not needed, as the included pipwerks SCORM API wrapper will automatically attempt to connect to any SCORM API it can find. The version found will the be stored to the ScormProvider Component.
            </li>
            <li>
              <strong>debug:</strong> (Boolean) (Optional) (Default: true) Specify if the SCORM API should be in debug mode and emit messages to the console.
            </li>
          </ul>

          <p>Putting it together:</p>
          <pre><code style={{ whiteSpace: 'pre-wrap'}}>{`
// adding a ScormProvider

import React from 'react';
import ScormProvider from 'react-scorm-provider';

const App = () => {
  return (
    <ScormProvider version="1.2" debug={process.env.NODE_ENV !== 'production'}>
      <h1>Hello SCORM world!</h1>
      <p>
        Although I can't yet access any props or methods from the ScormProvider (because I haven't yet included 'withScorm()'), a connection to the SCORM API will be made, initial values retrieved from the LMS via that API and stored in the ScormProvider Component for use with 'withScorm()'.
      </p>
    </ScormProvider>
  );
};

export default App;`}
          </code></pre>

          <h3>withScorm Higher Order Component</h3>
          <p><code>const YourEnhancedComponent = withScorm()(YourComponent)</code></p>
          <p>
            This Higher-Order Component provides access to a number of properties and functions of the <code>ScormProvider</code>. Use this to enhance your components with SCORM goodness! All exposed properties and functions are passed to your enhanced component via the 'sco' prop that is added to your component.
          </p>
          <p>The 'sco' prop object contains the following properties:</p>
          <pre>
            <code style={{ whiteSpace: 'pre-wrap'}}>{`
{
  // status of the connection to the SCORM API
  apiConnected: Bool,

  // cmi.core.student_name (SCORM 1.2) || cmi.learner_name (SCORM 2004)
  learnerName: String,

  // indication of course status
  completionStatus: String,

  // cmi.suspend_data parsed as an object (all suspend_data must be a JSON.stringify'd object for the suspend_data to work properly with RSP)
  suspendData: Object,

  // SCORM API version that is connected ('1.2' or '2004')
  scormVersion: String,

  // calling this function will update props.sco.suspendData with the current suspend_data from the LMS
  getSuspendData: Function () returns a Promise,

  // this function takes the required key and value arguments and merges them into the suspendData Object, overwriting the value if the key already exists. It then stringifies the object and saves it to the LMS as suspend_data
  setSuspendData: Function (key, val) returns a Promise,

  // resets the suspend_data to an empty object, clearing any existing key:value pairs
  clearSuspendData: Function () returns a Promise,

  // sends an updated course status to the LMS, accepts one of: "passed", "completed", "failed", "incomplete", "browsed", "not attempted"
  setStatus: Function (string) returns a Promise,

  // sends a score to the LMS via an object argument -- { value: Number - score (required), min: Number - min score (optional), max: Number - max score (optional), status: String - same as setStatus method (optional) }
  setScore: Function ({ value, min, max, status }) returns a Promise,

  // sets a SCORM value, ex: props.sco.set('cmi.score.scaled', 100)
  set: Function (string, val) returns a Promise,

  // gets a SCORM value from the LMS, ex: props.sco.get('cmi.score.scaled')
  get: Function (string) returns the LMS value
}
            `}</code>
          </pre>

          <p>
            All you have to do to provide the <code>sco</code> prop object to a component is wrap the component with <code>withScorm</code>. In order for <code>withScorm</code> to work, the component it is enhancing must be a child of <code>ScormProvider</code>.
          </p>

          <p>Example:</p>
          <pre>
            <code style={{ whiteSpace: 'pre-wrap'}}>{`
// enhancing a component and adding the sco object to its props

import React from 'react';
import { withScorm } from 'react-scorm-provider';

const StandardFunctionalComponent = (props) => {
  return (
    <div>
      <p>Welcome, {props.sco.learnerName}!</p>
      <p>Your course status is currently: {props.sco.completionStatus}</p>
      <p>Click the button below to complete the course!</p>
      <button onClick={() => props.sco.setStatus('completed')}>Mark me complete!</button>
    </div>
  );
};

const EnhancedComponent = withScorm()(StandardFunctionalComponent);

export default EnhancedComponent;
            `}</code>
          </pre>


        </section>

        <section className="section">
          <h2>Full Example Code:</h2>
          <pre>
            <code style={{ whiteSpace: 'pre-wrap'}}>{`
import React from 'react';
import ScormProvider, { withScorm } from 'react-scorm-provider';

const Learner = (props) => {
  return (
    <div>
      <p>Welcome, {props.sco.learnerName}!</p>
      <p>Your course status is currently: {props.sco.completionStatus}</p>
      <p>Click the button below to complete the course!</p>
      <button onClick={() => props.sco.setStatus('completed')}>Mark me complete!</button>
    </div>
  )
}

const ScoLearner = withScorm()(Learner);


const App = () => {
  return (
    <ScormProvider>
      <h1>We've got a connection just by including ScormProvider!</h1>
      <p>I'm a child with no access to the ScormProvider's props. But the ScoLearner component is enhanced with withScorm()!</p>
      <ScoLearner />
    </ScormProvider>
  );
};

export default App;
            `}</code>
          </pre>
        </section>

        <section className="section">
          <h2>Working Demonstration</h2>
          <p>
            This demo website has RSP integrated. However, this is a website, not a SCORM package. Therefore this example is somewhat limited. A mock SCORM API has been included on this page to respond to API calls. Keep in mind the React components provided by this RSP do nothing to properly prepare and package your application as a SCORM compliant LMS package.
          </p>
          <p>
            Check out the sections below to see some very basic values retrieved from the API, and some buttons that can set values. Our preference is to use suspend_data as a key:value store so there are specific methods for serializing/deserializing objects to suspend_data. See the <a href="https://github.com/S4-NetQuest/react-scorm-provider" target="__blank" rel="noreferrer noopener">documentation</a> for more information.
          </p>
        </section>
        <Learner />
        <ApiStatus />
      </div>
    </ScormProvider>
  );
};

export default App;