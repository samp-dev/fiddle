import React, { Component } from 'react';

import { Intent, IToastProps } from '@blueprintjs/core';

import ErrorDialog from './components/ErrorDialog';
import NavBar from './components/NavBar';
import MainView from './components/MainView';
import Footer from './components/Footer';

import socketClient from './socketClient';
import Toast from './toast';

import './App.scss';
import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

interface IState {
  errorDialogOpen: boolean,
  errorDialogMessage: string
}

class App extends Component<{}, IState> {
  state = {
    errorDialogOpen: false,
    errorDialogMessage: ''
  }

  componentDidMount(): void {
    socketClient.socket.on('connect_error', this.onConnectError.bind(this));
    socketClient.socket.on('disconnect', this.onDisconnect.bind(this));
    socketClient.socket.on('reconnect', this.onReconnect.bind(this));
    socketClient.socket.on('connect', this.onConnect.bind(this));
    
    socketClient.socket.on('toast', this.onToast.bind(this));
    socketClient.socket.on('showErrorDialog', this.onShowErrorDialog.bind(this));
  }

  onConnectError(): void {
    this.setState({
      errorDialogOpen: true,
      errorDialogMessage: 'The backend is not available. Reconnecting...'
    });
  }

  onDisconnect(): void {
    this.setState({
      errorDialogOpen: true,
      errorDialogMessage: 'The connection to the backend was lost. Reconnecting...'
    });
  }

  onReconnect(): void {
    this.setState({
      errorDialogOpen: false,
      errorDialogMessage: ''
    });

    Toast.show({
      icon: 'tick',
      intent: Intent.SUCCESS,
      message: 'The connection has been re-established.'
    });
  }

  onConnect(): void {
    socketClient.socket.emit('fiddleID', window.location.pathname.substr(1));
  }

  onToast(toastInfo: IToastProps): void {
    Toast.show(toastInfo);
  }

  onShowErrorDialog(errorDialogMessage: string): void {
    this.setState({
      errorDialogOpen: true,
      errorDialogMessage
    });
  }

  render() {
    return (
      <div className={'bp3-dark container'}>
        <ErrorDialog
          open={this.state.errorDialogOpen}
          message={this.state.errorDialogMessage}
        />
        <NavBar />
        <MainView />
        <Footer />
      </div>
    );
  }
}

export default App;
