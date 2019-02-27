import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import NavBar from './components/NavBar';
import MainView from './components/MainView';
import Footer from './components/Footer';

import './App.scss';
import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

class App extends Component {
  render() {
    return (
      <div className={'bp3-dark container'}>
        <NavBar />
        <MainView />
        <Footer />
      </div>
    );
  }
}

export default App;
