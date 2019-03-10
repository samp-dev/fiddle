import React, { Component } from 'react';
import { Classes, Navbar, Alignment, EditableText, Button, Popover, Spinner, KeyCombo } from '@blueprintjs/core';

import socketClient from '../../socketClient';

import './style.scss';

import logoPath from '../../assets/images/pawnlogo.png';

interface IState extends IExecutionState {
  locked: boolean,
  title: string
}

interface IExecutionState {
  isProcessing: boolean,
  isRunning: boolean
}

class NavBar extends Component {
  state: IState = {
    locked: false,
    title: '',
    isProcessing: false,
    isRunning: false
  }

  constructor(props: any) {
    super(props);

    this.runScript = this.runScript.bind(this);
    this.stopScript = this.stopScript.bind(this);

    socketClient.socket.on('setContentLockState', this.onSetContentLockState.bind(this));
    socketClient.socket.on('setTitle', this.onSetTitle.bind(this));
    socketClient.socket.on('setScriptExecutionState', this.onSetScriptExecutionState.bind(this));
  }

  private onSetContentLockState(locked: boolean): void {
    this.setState({ locked });
  }

  private onSetTitle(title: string): void {
    this.setState({ title });
  }

  private onSetScriptExecutionState(executionState: IExecutionState): void {
    this.setState(executionState);
  }

  private onTitleConfirm(value: string): void {
    socketClient.socket.emit('setTitle', value);
  }

  private runScript(): void {
    if (!this.state.isProcessing || !this.state.isRunning) {
      socketClient.socket.emit('runScript');
    }
  }

  private stopScript(): void {
    if (this.state.isRunning) {

    }
  }

  render() {
    return (
      <Navbar className={'row navbar'}>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            <img src={logoPath} style={{ marginTop: '4px' }} alt={'PAWN Logo'} />
          </Navbar.Heading>
          <Navbar.Heading>
            <EditableText
              value={this.state.title}
              confirmOnEnterKey={true}
              onConfirm={this.onTitleConfirm.bind(this)}
              placeholder={'Click here to give your fiddle a meaningful title'}
              maxLength={100}
              disabled={this.state.locked}
            />
          </Navbar.Heading>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Popover>
              <Button className={'bp3-minimal'} disabled={this.state.locked} icon={'share'} text={'Share'} large />
              <div className={'sharePopover'}>
                <Spinner intent={'primary'} size={Spinner.SIZE_SMALL} />
                {/*<p>Your fiddle is now publicly available here:</p>
                <code className={'bp3-code shareURL'}>https://fiddle.sa-mp.dev/OddPortentBullfrog</code>*/}
              </div>
          </Popover>
          <Button className={'bp3-minimal'} disabled={!this.state.locked} icon={'fork'} text={'Fork'} large />
          { !this.state.isRunning ? (
            <Button className={'bp3-minimal'} loading={this.state.isProcessing} onClick={this.runScript} icon={'play'} text={'Run'} large />
          ) : (
            <Button className={'bp3-minimal'} onClick={this.stopScript} icon={'stop'} text={'Stop'} large />
          ) }
        </Navbar.Group>
      </Navbar>
    );
  }
}

export default NavBar;
