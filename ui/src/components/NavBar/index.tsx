import React, { Component } from 'react';
import { Classes, Navbar, Alignment, EditableText, Button, Popover, Spinner, H5, Intent } from '@blueprintjs/core';

import socketClient from '../../socketClient';
import Toast from '../../toast';

import './style.scss';

import logoPath from '../../assets/images/pawnlogo.png';

interface IState extends IExecutionState {
  locked: boolean,
  title: string,
  isSharing: boolean,
  shareURL: string,
  isForking: boolean
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
    isRunning: false,
    isSharing: false,
    shareURL: '',
    isForking: false
  }

  constructor(props: any) {
    super(props);

    this.runScript = this.runScript.bind(this);
    this.stopScript = this.stopScript.bind(this);
    this.syncTitle = this.syncTitle.bind(this);
    this.shareFiddle = this.shareFiddle.bind(this);
    this.forkFiddle = this.forkFiddle.bind(this);

    socketClient.socket.on('reconnect', this.onReconnect.bind(this));
    socketClient.socket.on('setContentLockState', this.onSetContentLockState.bind(this));
    socketClient.socket.on('setTitle', this.onSetTitle.bind(this));
    socketClient.socket.on('setScriptExecutionState', this.onSetScriptExecutionState.bind(this));
    socketClient.socket.on('shared', this.onShared.bind(this));
    socketClient.socket.on('forked', this.onForked.bind(this));
  }

  private onReconnect(): void {
    // Reset the execution state when reconnecting -> the docker container is killed when disconnecting
    this.setState({
      isProcessing: false,
      isRunning: false
    });

    this.syncTitle();
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

  private onTitleChange(title: string): void {
    this.setState({ title });
  }

  private onTitleConfirm(value: string): void {
    this.syncTitle();
  }

  private onShared(shareURL: string): void {
    this.setState({
      shareURL
    });

    window.history.pushState('', '', `/${shareURL}`);
  }

  private onForked(previousTitle: string): void {
    window.history.pushState('', '', '/');
    this.setState({ isForking: false });
    Toast.show({ intent: Intent.SUCCESS, icon: 'tick', message: `Forked ${previousTitle} successfully.` });
  }

  private runScript(): void {
    if (!this.state.isProcessing || !this.state.isRunning) {
      socketClient.socket.emit('runScript');
    }
  }

  private stopScript(): void {
    if (this.state.isRunning) {
      socketClient.socket.emit('stopScript');
    }
  }

  private syncTitle(): void {
    if (!this.state.locked)
      socketClient.socket.emit('setTitle', this.state.title);
  }

  private renderPopoverContent(): JSX.Element {
    if (!this.state.isSharing && !this.state.locked) {
      return (
        <>
          <H5>Confirm share</H5>
          <p>Are you sure you want to publish / share this fiddle?<br />You can't edit it afterwards unless you fork it.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
            <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
              Cancel
            </Button>
            <Button intent={Intent.SUCCESS} onClick={this.shareFiddle}>
              Share
            </Button>
          </div>
        </>
      );
    } else if (this.state.isSharing && !this.state.locked) {
      return (
        <Spinner intent={'primary'} size={Spinner.SIZE_SMALL} />
      );
    } else {
      return (
        <>
          <H5>Your fiddle is now publicly available here:</H5>
          <code className={'bp3-code shareURL'}>https://{window.location.hostname}/{this.state.shareURL}</code>
        </>
      );
    }
  }

  private shareFiddle(): void {
    if (this.state.isSharing || this.state.locked)
      return;

    this.setState({ isSharing: true });
    socketClient.socket.emit('share');
  }

  private forkFiddle(): void {
    if (!this.state.locked || this.state.isForking)
      return;

    this.setState({ isForking: true, isSharing: false });
    socketClient.socket.emit('fork');
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
              onChange={this.onTitleChange.bind(this)}
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
              {this.renderPopoverContent()}
            </div>
          </Popover>
          <Button className={'bp3-minimal'}
            disabled={!this.state.locked} loading={this.state.isForking} onClick={this.forkFiddle} icon={'fork'} text={'Fork'} large />
          {!this.state.isRunning ? (
            <Button className={'bp3-minimal'} loading={this.state.isProcessing} onClick={this.runScript} icon={'play'} text={'Run'} large />
          ) : (
            <Button className={'bp3-minimal'} onClick={this.stopScript} icon={'stop'} text={'Stop'} large />
          )}
        </Navbar.Group>
      </Navbar>
    );
  }
}

export default NavBar;
