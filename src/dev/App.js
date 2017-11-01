import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import PathMaker from '../lib';

var base = PathMaker('http://www.simple.test/');

const Sample = {
  base,

  sub1: base.sub('/with/sub1'),
  sub2: base.sub('and/sub2/'),

};

var b1 = base();
var b2 = base('/a/sub-path/');
var b3 = base({and: 'params'});

var r1 = Sample.sub1();
var r2 = Sample.sub1({and: 'params', withValues: 'encoded and everything'});
var r3 = Sample.sub2();
var r4 = Sample.sub2({and: 'params', withValues: 'encoded and everything'});

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p>{b1}</p>
        <p>{b2}</p>
        <p>{b3}</p>
        <p>{r1}</p>
        <p>{r2}</p>
        <p>{r3}</p>
        <p>{r4}</p>
      </div>
    );
  }
}

export default App;
