import socketio, { Socket } from 'socket.io';
import adjectiveAdjectiveAnimal from 'adjective-adjective-animal';
import got from 'got';

import server from '../express';

const aaaRegex = /^(?=(.*[A-Z]){3,})(?=(.*[a-z]){3,})[^\W|_|\d]+$/;

interface ExtendedSocket extends Socket {
  fiddleID?: string
}

interface IInitialMsg {
  fiddle: string;
}

interface IDependency {
  user: string,
  repo: string,
  classification: string,
  dependencies?: string[],
  resources?: Object[]
}

interface IAvailableDependency {
  label: string,
  value: IDependency
}

export default class SocketServer {
  constructor() {
    server.io.on('connect', (socket: Socket) => {
      socket.on('initialMsg', this.onInitialMsg.bind(this, socket));
      socket.on('dependencyList', this.onDependencyList.bind(this, socket));
    });
  }

  async onInitialMsg(socket: ExtendedSocket, data: IInitialMsg): Promise<any> {
    console.log(data);

    if (data.fiddle === undefined || (data.fiddle && !aaaRegex.test(data.fiddle)))
      return socket.emit('invalidRequest');

    if (data.fiddle === '') {
      // New fiddle
      socket.fiddleID = await adjectiveAdjectiveAnimal('pascal');
    } else {
      // Existing fiddle
      socket.emit('setTitle');
      socket.emit('setDependencies');
      socket.emit('setContent');
      socket.emit('setContentLockState');
    }
  }

  async onDependencyList(socket: ExtendedSocket): Promise<void> {
    try {
      const sampctlResponse = await got('api.sampctl.com');
      const sampctlResponseArray: IDependency[] = JSON.parse(sampctlResponse.body);

      const availableDependencies: IAvailableDependency[] = sampctlResponseArray
        .filter(dependency => /*dependency.classification === 'basic' ||*/ dependency.classification === 'full')
        .map(dependency => ({
          label: `${dependency.user}/${dependency.repo}`,
          value: dependency
        }));

      socket.emit('dependencyList', availableDependencies);
    } catch (exception) {
      socket.emit('toast', {
        message: 'An error occurred while retrieving the dependency list.',
        icon: 'error',
        intent: 'danger'
      });
    }
  }
}
