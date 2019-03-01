import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import ContainerDimensions from 'react-container-dimensions';

import Editor from '../Editor';
import Console from '../Console';

import './style.scss';

class DeveloperArea extends Component {
  render() {
    return (
      <div className={'developer-area'}>
        <SplitPane split={'vertical'} defaultSize={'50%'}>
          <ContainerDimensions>
            <Editor />
          </ContainerDimensions>
          <Console />
        </SplitPane>
      </div>
    );
  }
}

export default DeveloperArea;
