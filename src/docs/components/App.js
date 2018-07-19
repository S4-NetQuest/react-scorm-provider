import React from 'react';
import ScormProvider from '../../lib/index';
import Learner from './Learner';
import ApiStatus from './ApiStatus';
import logo from '../img/rsp-logo.png';

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
            </div>
          </div>
        </section>
        <section className="section">
          <h2>What is this?</h2>
          <p>placeholder text: explain SCORM, SCORM API wrappers, and basic React Component and HOC</p>
          <h2>The Components:</h2>
          <h3>ScormProvider</h3>
          <p>ScormProvider documentation</p>
          <h3>withScorm Higher Order Component</h3>
          <p>withScorm documentation</p>
        </section>
        <section className="section">
          <h2>Example</h2>
          <p>
            This is a website, not a SCORM package. Therefore this example is somewhat limited. A fake SCORM API has
            been included on this page to respond to API calls. Keep in mind the React components provided by this
            package do nothing to properly prepare and package your application as a SCORM compliant LMS package.
          </p>
          <p>
            Check out the sections below to see some very basic values retrieved from the API, and some buttons that can
            set values. My personal preference is to use suspend_data as a key:value store so there are specific methods
            for serializing/deserializing objects to suspend_data.
          </p>
        </section>
        <Learner />
        <ApiStatus />
      </div>
    </ScormProvider>
  );
};

export default App;