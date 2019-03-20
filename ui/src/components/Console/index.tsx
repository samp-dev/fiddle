import React, { Component, RefObject } from 'react';
import Scrollbars, { positionValues } from 'react-custom-scrollbars';
import sanitizeHtml from 'sanitize-html-react';
import HTMLReactParser from 'html-react-parser';

import socketClient from '../../socketClient';

import './style.scss';

interface IState {
  consoleOutput: string,
  scrollbarsContainer: RefObject<Scrollbars>,
  scrollLocked: boolean
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
  }

  private clearConsole(): void {
    this.setState({
      consoleOutput: ''
    });
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
      <Scrollbars
        ref={this.state.scrollbarsContainer}
        onUpdate={this.onScrollbarContainerUpdate.bind(this)}
        onScroll={this.onScrollbarContainerScroll.bind(this)}
      >
        <div className={'console-output'}>
          {HTMLReactParser(sanitizeHtml(this.state.consoleOutput))}
        </div>
      </Scrollbars>
    );
  }
}

export default Console;
