import React, { Component } from 'react';

import ErrorDialog from './components/ErrorDialog';
import NavBar from './components/NavBar';
import MainView from './components/MainView';
import Footer from './components/Footer';

import socketClient from './socketClient';

import './App.scss';
import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

interface IState {
  errorDialogOpen: boolean,
  errorDialogMessage: string
}

interface IInitialMsg {
  
}

class App extends Component<{}, IState> {
  state = {
    errorDialogOpen: false,
    errorDialogMessage: ''
  }

  componentDidMount(): void {
    if (!socketClient.socket.connected) {
      console.log(socketClient.socket.connected);
      return this.setState({
        errorDialogOpen: true,
        errorDialogMessage: 'The backend is not available.'
      });
    }

    const initialMsg: IInitialMsg = {
      
    };

    socketClient.socket.emit('initialMsg', initialMsg);
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
