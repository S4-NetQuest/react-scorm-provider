import React from 'react';
import { ScoContext } from './ScormProvider';

function withScorm() {

  return function(WrappedComponent) {

    const WithScorm = function(props) {
      return (
        <ScoContext.Consumer>
          {value => <WrappedComponent {...props} sco={value} />}
        </ScoContext.Consumer>
      )
    }

    return WithScorm;
  }
}

export default withScorm;