import React, { Component } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import sanitizeHtml from 'sanitize-html-react';

import socketClient from '../../socketClient';

import './style.scss';

interface IState {
  consoleOutput: string
}

class Console extends Component<{}, IState> {
  state: IState = {
    consoleOutput: ''
  }
  
  constructor(props: any) {
    super(props);

    this.clearConsole = this.clearConsole.bind(this);

    socketClient.socket.on('reconnect', this.onReconnect.bind(this));
    socketClient.socket.on('clearConsole', this.onClearConsole.bind(this));
    socketClient.socket.on('appendConsole', this.onAppendConsole.bind(this));
  }

  private clearConsole() {
    this.setState({
      consoleOutput: ''
    });
  }

  private onReconnect() {
    this.clearConsole();
  }

  private onClearConsole() {
    this.clearConsole();
  }

  private onAppendConsole(output: string) {
    this.setState({
      consoleOutput: this.state.consoleOutput + output
    });
  }

  render() {
    return (
      <Scrollbars>
        <div
          className={'console-output'}
          dangerouslySetInnerHTML={{__html: sanitizeHtml(this.state.consoleOutput)}}>
        </div>
      </Scrollbars>
    );
  }
}

export default Console;
