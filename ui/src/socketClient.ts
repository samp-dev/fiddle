import socketio from 'socket.io-client';

class SocketClient {
  public socket: SocketIOClient.Socket;

  constructor() {
    this.socket = socketio();
    setTimeout(() => console.log(this.socket.connected), 5000);
    this.socket.emit('initialMsg', 'test');
  }
}

export default new SocketClient();
