import socketio from 'socket.io-client';

class SocketClient {
  public socket: SocketIOClient.Socket;

  constructor() {
    this.socket = socketio();
  }
}

export default new SocketClient();
