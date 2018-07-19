import React from 'react';
import { withScorm } from '../../lib/index';

const Learner = ({ sco }) => {
  return (
    <section className="section">
        <h3>Learner Information Retreived from the faked API:</h3>
        <p>student_name: {sco.learnerName}</p>
    </section>
)
};

export default withScorm()(Learner);