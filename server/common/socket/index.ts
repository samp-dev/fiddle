import socketio, { Socket } from 'socket.io';
import adjectiveAdjectiveAnimal from 'adjective-adjective-animal';
import got from 'got';

import server from '../express';

const aaaRegex = /^(?=(.*[A-Z]){3,})(?=(.*[a-z]){3,})[^\W|_|\d]+$/;

interface ExtendedSocket extends Socket {
  composing?: boolean,
  fiddleID?: string,
  title?: string,
  dependencies?: IDependency[],
  content?: string
}

interface IInitialMsg {
  fiddle: string
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

      socket.on('setTitle', this.onSetTitle.bind(this, socket));
      socket.on('setDependencies', this.onSetDependencies.bind(this, socket));
      socket.on('setContent', this.onSetContent.bind(this, socket));
    });
  }

  async onInitialMsg(socket: ExtendedSocket, data: IInitialMsg): Promise<any> {
    console.log(data);

    if (data.fiddle === undefined || (data.fiddle && !aaaRegex.test(data.fiddle)))
      return socket.emit('invalidRequest');

    if (data.fiddle === '') {
      // New fiddle
      socket.composing = true;
      socket.fiddleID = await adjectiveAdjectiveAnimal('pascal');
    } else {
      // Existing fiddle
      socket.composing = false;
      socket.fiddleID = data.fiddle;
      socket.title = ''; // TODO: Load
      socket.dependencies = null; // TODO: Load
      socket.content = ''; // TODO: Load

      socket.emit('setContentLockState', !socket.composing); // If we're not in compose mode, lock the content
      socket.emit('setTitle', socket.title);
      socket.emit('setDependencies', socket.dependencies);
      socket.emit('setContent', socket.content);
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

  onSetTitle(socket: ExtendedSocket, title: string): any {
    if (title.length > 100) {
      return socket.emit('toast', {
        message: 'Invalid request. (Title cannot be longer than 100 characters)',
        icon: 'error',
        intent: 'danger'
      });
    }

    socket.title = title;
  }

  onSetDependencies(socket: ExtendedSocket, dependencies: IDependency[]): any {
    if (dependencies.length > 10) {
      return socket.emit('toast', {
        message: 'Invalid request. (You cannot add more than 10 dependencies)',
        icon: 'error',
        intent: 'danger'
      });
    }

    socket.dependencies = dependencies;
  }

  onSetContent(socket: ExtendedSocket, content: string): any {
    if (Buffer.byteLength(content, 'utf8') > 25600) {
      return socket.emit('toast', {
        message: 'Invalid request. (Your fiddle cannot be bigger than 25 kB)',
        icon: 'error',
        intent: 'danger'
      });
    }

    socket.content = content;
  }
}
