import socketio from 'socket.io-client';

class SocketClient {
  public socket: SocketIOClient.Socket;

  constructor() {
    this.socket = socketio();
    this.socket.emit('initialMsg', 'test');
  }
}

export default new SocketClient();
