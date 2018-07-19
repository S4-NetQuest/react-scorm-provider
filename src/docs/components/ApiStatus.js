import React, { Component } from 'react';
import { withScorm } from '../../lib/index';

class ApiStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      val: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onKeyChange = this.onKeyChange.bind(this);
    this.onValChange = this.onValChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.sco.setSuspendData(this.state.key, this.state.val);
    this.setState({
      key: '',
      val: ''
    });
  }

  onKeyChange(e) {
    this.setState({
      key: e.target.value
    });
  }

  onValChange(e) {
    this.setState({
      val: e.target.value
    });
  }

  render() {
    const { setStatus, apiConnected, completionStatus, scormVersion, suspendData } = this.props.sco;

    return (
      <section className="section">
        <h3>SCORM information and status</h3>
        <p>SCORM version: {scormVersion}</p>
        <p>{apiConnected ? "api connected" : "api not connected"}</p>
        <p>completion status: {completionStatus}</p>
        <p>suspend_data:</p>
        { Object.keys(suspendData).length > 0 ? (
            <table className="u-full-width">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                { Object.keys(suspendData).map((key) => {
                  return (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{suspendData[key]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
          : <p>no suspend data present</p>
        }
        <hr/>
        <p>Send a new status to the API:</p>
        <button className="button" onClick={() => setStatus("passed")}>passed</button>
        <button className="button" onClick={() => setStatus("completed")}>completed</button>
        <button className="button" onClick={() => setStatus("failed")}>failed</button>
        <button className="button" onClick={() => setStatus("incomplete")}>incomplete</button>
        <button className="button" onClick={() => setStatus("browsed")}>browsed</button>
        <button className="button" onClick={() => setStatus("not attempted")}>not attempted</button>
        <hr/>
        <p>Add new suspend_data</p>
        <form onSubmit={this.handleSubmit}>
          <div className="row">
            <div className="six columns">
              <input className="u-full-width" type="text" value={this.state.key} placeholder="Enter a Key" onChange={this.onKeyChange} />
            </div>
            <div className="six columns">
              <input className="u-full-width" type="text" value={this.state.val} placeholder="Enter a Value" onChange={this.onValChange} />
            </div>
          </div>
          <div className="row">
            <button type="submit" className="button-primary">Submit New key:value pair</button>
          </div>
        </form>
      </section>
    );
  }
}

export default withScorm()(ApiStatus);