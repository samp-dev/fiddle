import socketio, { Socket } from 'socket.io';
import adjectiveAdjectiveAnimal from 'adjective-adjective-animal';

import server from '../express';

const aaaRegex = /^(?=(.*[A-Z]){3,})(?=(.*[a-z]){3,})[^\W|_|\d]+$/;

interface ExtendedSocket extends Socket {
  fiddleID?: string
}

interface IInitialMsg {
  fiddle: string;
}

export default class SocketServer {
  constructor() {
    server.io.on('connect', (socket: Socket) => {
      socket.on('initialMsg', this.onInitialMsg.bind(this, socket));
    });
  }

  async onInitialMsg(socket: ExtendedSocket, data: IInitialMsg): Promise<any> {
    console.log(data);

    if (data.fiddle === undefined || (data.fiddle && !aaaRegex.test(data.fiddle)))
      return socket.emit('invalidRequest');

    if (data.fiddle === '') {
      // New fiddle
      socket.fiddleID = await adjectiveAdjectiveAnimal('pascal');

      console.log(socket.fiddleID);
    } else {
      // Existing fiddle
      socket.emit('setTitle');
      socket.emit('setDependencies');
      socket.emit('setContent');
      socket.emit('setContentLockState');
    }
  }
}
