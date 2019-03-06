import socketio, { Socket } from 'socket.io';

import server from '../express';

interface IInitialMsg {
  fiddle: string;
}

export default class SocketServer {
  constructor() {
    server.io.on('connect', (socket: Socket) => {
      socket.on('initialMsg', this.onInitialMsg.bind(this, socket));
    });
  }

  onInitialMsg(socket: Socket, data: IInitialMsg) {
    console.log(data);
  }
}
