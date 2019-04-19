import React, { Component, RefObject } from 'react';
import { Button, Intent } from '@blueprintjs/core';
import Scrollbars, { positionValues } from 'react-custom-scrollbars';
import sanitizeHtml from 'sanitize-html-react';
import HTMLReactParser from 'html-react-parser';

import socketClient from '../../socketClient';
import Toast from '../../toast';

import './style.scss';

interface IState {
  consoleOutput: string;
  scrollbarsContainer: RefObject<Scrollbars>;
  scrollLocked: boolean;
}

class Console extends Component<{}, IState> {
  state: IState = {
    consoleOutput: '',
    scrollbarsContainer: React.createRef(),
    scrollLocked: true
  }

  constructor(props: any) {
    super(props);

    this.clearConsole = this.clearConsole.bind(this);

    socketClient.socket.on('reconnect', this.onReconnect.bind(this));
    socketClient.socket.on('clearConsole', this.onClearConsole.bind(this));
    socketClient.socket.on('appendConsole', this.onAppendConsole.bind(this));
    socketClient.socket.on('download', this.onDownload.bind(this));
  }

  private clearConsole(): void {
    this.setState({
      consoleOutput: ''
    });
  }

  private download(): void {
    socketClient.socket.emit('download');
  }

  private onReconnect(): void {
    this.clearConsole();
  }

  private onClearConsole(): void {
    this.clearConsole();
  }

  private onAppendConsole(output: string): void {
    this.setState({
      consoleOutput: this.state.consoleOutput + output
    });
  }

  private onDownload(apiCall: string): any {
    if (!apiCall.length)
      return Toast.show({ intent: Intent.DANGER, icon: 'cross', message: 'You must have either shared your fiddle or ran it at least once.' });
    
    const { protocol, hostname, port }: Location = window.location;
    const optPort: string = port !== '' ? ':' + port : '';
    const url: string = `${protocol}//${hostname}${optPort}${apiCall}`;
    window.location.href = url;
  }

  onScrollbarContainerUpdate(): void {
    const scrollbars: Scrollbars | null = this.state.scrollbarsContainer.current;

    if (scrollbars && this.state.scrollLocked)
      scrollbars.scrollToBottom();
  }

  onScrollbarContainerScroll(): void {
    const scrollbars: Scrollbars | null = this.state.scrollbarsContainer.current;

    if (scrollbars) {
      const scrollbarValues: positionValues = scrollbars.getValues();
      this.setState({
        // TODO: Check if the script is running to improve "stickyness" (using global redux state / global state based on react hooks?)
        scrollLocked: (scrollbarValues.scrollTop && scrollbarValues.top >= 0.997) as boolean
      });
    }
  }

  render() {
    return (
      <>
        <Scrollbars
          ref={this.state.scrollbarsContainer}
          onUpdate={this.onScrollbarContainerUpdate.bind(this)}
          onScroll={this.onScrollbarContainerScroll.bind(this)}
        >
          <div className={'console-output'}>
            {HTMLReactParser(sanitizeHtml(this.state.consoleOutput))}
          </div>
        </Scrollbars>
        <Button icon={'download'} className={'download'} onClick={this.download.bind(this)} />
      </>
    );
  }
}

export default Console;
