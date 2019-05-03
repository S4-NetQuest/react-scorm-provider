# React SCORM Provider

### Overview

React-scorm-provider (RSP) is a set of React Components that simplify the inclusion of the [SCORM API](https://scorm.com/scorm-explained/) into your React projects. It utilizes the great SCORM API wrapper from [pipwerks](https://github.com/pipwerks/scorm-api-wrapper). Use RSP to easily add SCORM capabilities to your learning modules, resources, games, or *any* web content you are creating with React.

Keep in mind that this project does not include any kind of packaging or bundling for SCORM. It simply enables SCORM API calls inside your React code.

There are two major components of RSP, `ScormProvider` and `withScorm`.

[View the live demo](https://jayv30.github.io/react-scorm-provider)

---

### ScormProvider Component

`<ScormProvider></ScormProvider>`

A wrapper component which should only be included ONCE in your React application component tree. It should be included as close to the root of your component tree as possible so that child components can take advantage of the `withScorm` Higher-Order Component. The `ScormProvider` component automatically establishes a connection to the SCORM API and retrieves some initial data from the LMS via the SCORM API. Once the `ScormProvider` Component is included, any other component that is a child of the `ScormProvider` can access the SCORM-related properties and functions via the `withScorm` Higher-Order Component described below.

Note that the `ScormProvider` component itself does not pass props to any of its children. In order to access properties and methods of the `ScormProvider` component and make calls to the SCORM API, you *must* use the provided `withScorm` Higher-Order Component.

#### Configuration
The ScormProvider Component accepts two optional configuration props:
* **version:** (String) (Optional) Specify the SCORM API version, accepts "1.2" or "2004". This is completely optional and probably not needed, as the included pipwerks SCORM API wrapper will automatically attempt to connect to any SCORM API it can find. The version found will the be stored to the ScormProvider Component.
* **debug:** (Boolean) (Optional) (Default: true) Specify if the SCORM API should be in debug mode and emit messages to the console.

Putting it together:
```
// adding a ScormProvider

import React from 'react';
import ScormProvider from 'react-scorm-provider';

const App = () => {
  return (
    <ScormProvider version="1.2" debug={process.env.NODE_ENV !== 'production'}>
      <h1>Hello SCORM world!</h1>
      <p>
        Although I can't yet access any props or methods from the ScormProvider (because I haven't yet included 'withScorm()'), a connection to the SCORM API will be made, initial values retrieved from the LMS via that API, and stored in the ScormProvider Component for use with 'withScorm()'.
      </p>
    </ScormProvider>
  );
};

export default App;
```

---

### withScorm Higher-Order Component

`const YourEnhancedComponent = withScorm()(YourComponent)`

This Higher-Order Component provides access to a number of properties and functions of the `ScormProvider`. Use this to enhance your components with SCORM goodness! All exposed properties and functions are passed to your enhanced component via the 'sco' prop that is added to your component.

The 'sco' prop object contains the following properties:
```
// props.sco
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
  getSuspendData: Function (),

  // this function takes the required key and value arguments and merges them into the suspendData Object, overwriting the value if the key already exists. It then stringifies the object and saves it to the LMS as suspend_data
  setSuspendData: Function (key, val),

  // sends an updated course status to the LMS, accpets one of: "passed", "completed", "failed", "incomplete", "browsed", "not attempted"
  setStatus: Function (string),

  // sets a SCORM value, ex: props.sco.set('cmi.score.scaled', 100)
  set: Function (string, val),

  // gets a SCORM value from the LMS, ex: props.sco.get('cmi.score.scaled')
  get: Function (string)
}
```

All you have to do to provide the `sco` prop object to a component is wrap the component with `withScorm`. In order for `withScorm` to work, the component it is enhancing must be a child of `ScormProvider`.

Example:
```
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
```

---

### Full Example

```
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
```
