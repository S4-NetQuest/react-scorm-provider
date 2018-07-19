# React SCORM Provider

*Note: this project is still in initial development and NOT for production use. I saw no adequate stand-alone SCORM React components so I decided to create one but it is not currently complete. It will work at the most basic level but it is currently untested and very basic. (Although using the get and set methods should cover nearly all uses - you just have to provide your own implementations)*

---

A React component that manages a connection to the [SCORM API](https://scorm.com/scorm-explained/). It utilizes the great SCORM API wrapper from [pipwerks](https://github.com/pipwerks/scorm-api-wrapper). There are two major components of React SCORM Provider:

### ScormProvider Component

`<ScormProvider></ScormProvider>`

A wrapper component which should only be included ONCE in your React application component tree. It should be included as close to the root of your component tree as possible so that child components can take advantage of the withScorm Higher-Order-Component. The ScormProvider component automatically establishes a connection to the SCORM API and retrieves some initial data from the LMS via the SCORM API. Once the ScormProvider Component is included, any other component that is a child of the ScormProvider can access the SCORM-related properties and functions via the withScorm HOC described below.

### withScorm Higher-Order-Component

`withScorm()(YourComponent)`

This is a Higher-Order-Component that provides access to a number of properties and functions of the ScormProvider. Use this to enhance your components with SCORM goodness! All exposed properties and functions are passed to your enhanced component via the 'sco' prop that is added to your enhanced component.

Example:

```
import React from 'react';
import ScormProvider, { withScorm } from 'react-scorm-provider';

const Learner = (props) => {
  return (
    <p>Welcome, {props.sco.learnerName}!</p>
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
