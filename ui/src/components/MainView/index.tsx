import React, { Component } from 'react';

import DependenciesBar from '../DependenciesBar';
import DeveloperArea from '../DeveloperArea';

import './style.scss';

class MainView extends Component {
  render() {
    return (
      <div className={'row content'}>
        <DependenciesBar />
        <DeveloperArea />
      </div>
    );
  }
}

export default MainView;
