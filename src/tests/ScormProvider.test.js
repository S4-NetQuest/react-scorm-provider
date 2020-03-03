import React from 'react';
import { mockScorm, clearScorm } from './helpers';
import { shallow, mount, render } from 'enzyme';
import { waitForState } from 'enzyme-async-helpers';
import ScormProvider from '../lib/ScormProvider';

afterEach(() => {
  jest.resetModules();
});

describe('SCORM v1.2', () => {
  beforeEach(() => {
    return mockScorm(global, '1.2');
  });

  afterEach(() => {
    return clearScorm(global);
  });

  it('renders the <ScormProvider/> component', () => {
    const wrapper = shallow(<ScormProvider debug={false}></ScormProvider>);
    expect(wrapper.isEmptyRender()).toEqual(false);
    expect(wrapper.instance()).toBeInstanceOf(ScormProvider);
    wrapper.unmount();
  });

  it('connects to the SCORM API', async () => {
    const wrapper = shallow(<ScormProvider debug={false}></ScormProvider>);
    wrapper.update();
    await waitForState(wrapper, state => state.apiConnected === true);
    expect(wrapper.state('apiConnected')).toEqual(true);
    expect(wrapper.state('scormVersion')).toEqual('1.2');
    wrapper.unmount();
  });

});

describe('SCORM v2004', () => {
  beforeEach(() => {
    return mockScorm(global, '2004');
  });

  afterEach(() => {
    return clearScorm(global);
  });

  it('renders the <ScormProvider/> component', () => {
    const wrapper = shallow(<ScormProvider version="2004" debug={false}></ScormProvider>);
    expect(wrapper.isEmptyRender()).toEqual(false);
    expect(wrapper.instance()).toBeInstanceOf(ScormProvider);
    wrapper.unmount();
  });

  it('connects to the SCORM API', async () => {
    const wrapper = shallow(<ScormProvider debug={false}></ScormProvider>);
    wrapper.update();
    await waitForState(wrapper, state => state.apiConnected === true);
    expect(wrapper.state('apiConnected')).toEqual(true);
    expect(wrapper.state('scormVersion')).toEqual('2004');
    wrapper.unmount();
  });

});