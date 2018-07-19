import React from 'react';
import { ScoContext } from './ScormProvider';

function withScorm() {

  return function(WrappedComponent) {

    return function(props) {

      return (
        <ScoContext.Consumer>
          {value => <WrappedComponent {...props} sco={value} />}
        </ScoContext.Consumer>
      )
    }
  }
}

export default withScorm;