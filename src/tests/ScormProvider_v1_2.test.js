import React from 'react';
import { mockScorm, clearScorm } from './helpers';
import { shallow, mount, render } from 'enzyme';
import { waitForState, waitForProps } from 'enzyme-async-helpers';
import ScormProvider from '../lib/index';
import ContextConsumer from './__mocks__/ContextConsumer';

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

  it('updates initial state on connection to the SCORM API', async () => {
    const wrapper = shallow(<ScormProvider debug={false}></ScormProvider>);
    wrapper.update();
    await waitForState(wrapper, state => state.apiConnected === true);
    expect(wrapper.state('apiConnected')).toEqual(true);
    expect(wrapper.state('scormVersion')).toEqual('1.2');
    expect(wrapper.state('learnerName')).toEqual('Student, Joe');
    expect(wrapper.state('completionStatus')).toEqual('incomplete'); // 'unknown' and 'not attempted' statuses get set to 'incomplete' by pipwerks
    expect(wrapper.state('suspendData')).toMatchObject({});
    wrapper.unmount();
  });

  it('provides a sco prop to consumers', () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    const consumer = wrapper.find(ContextConsumer).childAt(0);
    const sco = consumer.prop('sco');
    expect(consumer.isEmptyRender()).toEqual(false);
    expect(typeof sco).toBe('object');
    expect(typeof sco.apiConnected).toBe('boolean');
    expect(typeof sco.scormVersion).toBe('string');
    expect(typeof sco.learnerName).toBe('string');
    expect(typeof sco.completionStatus).toBe('string');
    expect(typeof sco.suspendData).toBe('object');
    expect(typeof sco.getSuspendData).toBe('function');
    expect(typeof sco.setSuspendData).toBe('function');
    expect(typeof sco.clearSuspendData).toBe('function');
    expect(typeof sco.setStatus).toBe('function');
    expect(typeof sco.get).toBe('function');
    expect(typeof sco.set).toBe('function');
    wrapper.unmount();
  });

  it('allows consumer to set suspendData', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    const sco = consumer.prop('sco');
    const d = await sco.setSuspendData("foo", "bar");
    expect(d).toMatchObject({ foo: 'bar' });

    wrapper.update();
    consumer = wrapper.find(ContextConsumer).childAt(0);
    expect(consumer.prop('sco').suspendData.foo).toEqual("bar");
    wrapper.unmount();
  });

  it('updates suspendData when getSuspendData method is called', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    const d = await sco.getSuspendData();
    expect(d).toMatchObject({ foo: 'bar' });

    wrapper.update();
    consumer = wrapper.find(ContextConsumer).childAt(0);
    expect(consumer.prop('sco').suspendData.foo).toEqual("bar");
    sco = consumer.prop('sco');
    const f = await sco.setSuspendData('baz', 'bat');
    expect(f).toMatchObject({ foo: 'bar', baz: 'bat' });

    wrapper.update();
    consumer = wrapper.find(ContextConsumer).childAt(0);
    expect(consumer.prop('sco').suspendData).toMatchObject({ foo: 'bar', baz: 'bat' });
    wrapper.unmount();
  });

  it('clears suspendData when clearSuspendData method is called', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    expect(sco.suspendData).toMatchObject({ foo: 'bar', baz: 'bat' });
    const d = await sco.clearSuspendData();
    expect(d).toMatchObject({});

    wrapper.update();
    consumer = wrapper.find(ContextConsumer).childAt(0);
    expect(consumer.prop('sco').suspendData).toMatchObject({});
    wrapper.unmount();
  });

  it('updates completion status when setStatus method is called', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    expect(sco.completionStatus).toEqual('incomplete');
    const s = await sco.setStatus('completed');
    expect(s).toEqual('completed');

    wrapper.update();
    consumer = wrapper.find(ContextConsumer).childAt(0);
    expect(consumer.prop('sco').completionStatus).toEqual('completed');
    wrapper.unmount();
  });

  it('rejects invalid status when setStatus method is called', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    expect(sco.completionStatus).toEqual('completed');
    const s = await sco.setStatus('a crazy status').catch(e => e);
    expect(s).toEqual('could not set the status provided');

    wrapper.update();
    consumer = wrapper.find(ContextConsumer).childAt(0);
    expect(consumer.prop('sco').completionStatus).toEqual('completed');
    wrapper.unmount();
  });

  it('allows retrieval of any valid SCORM data model key with the get method', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    const v = await sco.get('cmi.core.student_id');
    expect(v).toEqual('000001');
    wrapper.unmount();
  });

  it('returns an empty string if the get method param is not part of the SCORM data model', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    const v = await sco.get('invalid_key');
    expect(v).toEqual('');
    wrapper.unmount();
  });

  it('allows valid writable SCORM data model values to be set with the set method', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    const v = await sco.set('cmi.comments', 'this is a great lesson');
    expect(v).toEqual(expect.arrayContaining(['cmi.comments', 'this is a great lesson']));
    wrapper.unmount();
  });

  it('rejects invalid or read-only SCORM data model keys sent with the set method', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    const v = await sco.set('cmi.core.student_name', 'I should not be able to set this read-only field').catch(e => e);
    expect(v).toEqual("could not set: { cmi.core.student_name: I should not be able to set this read-only field }");
    wrapper.unmount();
  });

  it('allows score information to be sent with the setScore method', async () => {
    const wrapper = mount(<ScormProvider debug={false}><ContextConsumer /></ScormProvider>);
    let consumer = wrapper.find(ContextConsumer).childAt(0);
    let sco = consumer.prop('sco');
    // initial values should be empty
    let iS = sco.get('cmi.core.score.raw');
    expect(iS).toEqual('');
    let iMin = sco.get('cmi.core.score.min');
    expect(iMin).toEqual('');
    let iMax = sco.get('cmi.core.score.max');
    expect(iMax).toEqual('');

    // set values
    let vals = await sco.setScore({ value: 80, min: 0, max: 100 });
    expect(vals).toContainEqual(['cmi.core.score.raw', 80]);
    expect(vals).toContainEqual(['cmi.core.score.min', 0]);
    expect(vals).toContainEqual(['cmi.core.score.max', 100]);

    // check they have been stored
    wrapper.update();
    consumer = wrapper.find(ContextConsumer).childAt(0);
    sco = consumer.prop('sco');
    // values should be set
    let s = sco.get('cmi.core.score.raw');
    expect(Number(s)).toEqual(80);
    let min = sco.get('cmi.core.score.min');
    expect(Number(min)).toEqual(0);
    let max = sco.get('cmi.core.score.max');
    expect(Number(max)).toEqual(100);

    wrapper.unmount();
  });

});