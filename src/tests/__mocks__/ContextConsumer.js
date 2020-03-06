import React from 'react';
import PropTypes from 'prop-types';
import { withScorm } from '../../lib/index';

const ContextConsumer = props => {
  return (
    <div>
      {JSON.stringify(props.sco)}
    </div>
  );
};

ContextConsumer.propTypes = {

};

export default withScorm()(ContextConsumer);