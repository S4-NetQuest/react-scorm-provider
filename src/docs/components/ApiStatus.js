import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { withScorm } from '../../lib/index';

class ApiStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      val: '',
      score: {
        value: 0,
        min: 0,
        max: 100,
        status: "0"
      }
    }

    autoBind(this);
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

  onScoreChange(e) {
    let field = e.target.name;
    let score = { ...this.state.score }
    score[field] = field === 'status' ? e.target.value : Number(e.target.value);
    this.setState({
      score
    });
  }

  handleScoreSubmit(e) {
    e.preventDefault();
    if (this.state.score.status === "0") return;
    this.props.sco.setScore(this.state.score)
      .then(res => {
        alert(`Successfully set the score: ${JSON.stringify(res)}`);
      })
      .catch(err => {
        alert('Something went wrong... score not set.');
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
        <hr/>
        <p>Send a score to the API</p>
        <form onSubmit={this.handleScoreSubmit}>
          <div className="row">
            <div className="three columns">
              <label htmlFor="value">Score</label>
              <input type="number" className="u-full-width" name="value" value={this.state.score.value} placeholder="Enter a Score" onChange={this.onScoreChange} />
            </div>
            <div className="three columns">
              <label htmlFor="min">Min Score</label>
              <input type="number" className="u-full-width" name="min" value={this.state.score.min} placeholder="Enter a Min Score" onChange={this.onScoreChange} />
            </div>
            <div className="three columns">
              <label htmlFor="max">Max Score</label>
              <input type="number" className="u-full-width" name="max" value={this.state.score.max} placeholder="Enter a Max Score" onChange={this.onScoreChange} />
            </div>
            <div className="three columns">
              <label htmlFor="status">Status</label>
              <select className="u-full-width" name="status" value={this.state.score.status} onChange={this.onScoreChange}>
                <option disabled value="0">-- select status --</option>
                <option value="passed">Passed</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="incomplete">Incomplete</option>
                <option value="browsed">Browsed</option>
                <option value="not attempted">Not Attempted</option>
              </select>
            </div>
          </div>
          <div className="row">
            <button type="submit" className="button-primary" disabled={this.state.score.status === "0"}>Submit Score</button>
          </div>
        </form>
      </section>
    );
  }
}

export default withScorm()(ApiStatus);