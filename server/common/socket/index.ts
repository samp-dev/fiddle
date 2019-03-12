import socketio, { Socket } from 'socket.io';
import adjectiveAdjectiveAnimal from 'adjective-adjective-animal';
import got from 'got';

import { IExtendedSocket, IDependency, IAvailableDependency } from './interfaces';

import server from '../express';
import StdMessages from './StdMessages';

const aaaRegex = /^(?=(.*[A-Z]){3,})(?=(.*[a-z]){3,})[^\W|_|\d]+$/;

export default class SocketServer {
  constructor() {
    server.io.on('connect', (socket: Socket) => {
      socket.on('fiddleID', this.onFiddleID.bind(this, socket));
      socket.on('dependencyList', this.onDependencyList.bind(this, socket));

      socket.on('setTitle', this.onSetTitle.bind(this, socket));
      socket.on('setDependencies', this.onSetDependencies.bind(this, socket));
      socket.on('setContent', this.onSetContent.bind(this, socket));

      socket.on('runScript', this.onRunScript.bind(this, socket));
    });
  }

  async onFiddleID(socket: IExtendedSocket, fiddleID: string): Promise<any> {
    console.log(fiddleID);

    if (fiddleID === undefined || (fiddleID && !aaaRegex.test(fiddleID)))
      return socket.emit('invalidRequest');

    if (fiddleID === '') {
      // New fiddle
      socket.composing = true;
      socket.fiddleID = await adjectiveAdjectiveAnimal('pascal');
    } else {
      // Existing fiddle
      socket.composing = false;
      socket.fiddleID = fiddleID;
      socket.title = ''; // TODO: Load
      socket.dependencies = []; // TODO: Load
      socket.content = ''; // TODO: Load

      socket.emit('setContentLockState', !socket.composing); // If we're not in compose mode, lock the content
      socket.emit('setTitle', socket.title);
      socket.emit('setDependencies', socket.dependencies);
      socket.emit('setContent', socket.content);
    }
  }

  async onDependencyList(socket: IExtendedSocket): Promise<void> {
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
      StdMessages.sendErrorMessage(socket, 'An error occurred while retrieving the dependency list.');
    }
  }

  onSetTitle(socket: IExtendedSocket, title: string): any {
    if (title.length > 100)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Title cannot be longer than 100 characters)');

    socket.title = title;
  }

  onSetDependencies(socket: IExtendedSocket, dependencies: IDependency[]): any {
    if (dependencies.length > 10)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (You cannot add more than 10 dependencies)');

    socket.dependencies = dependencies;
  }

  onSetContent(socket: IExtendedSocket, content: string): any {
    if (Buffer.byteLength(content, 'utf8') > 25600)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Your fiddle cannot be bigger than 25 kB)');

    socket.content = content;
  }

  onRunScript(socket: IExtendedSocket): any {
    if (socket.isRunning || socket.isProcessing)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Your script is already running)');

    socket.isProcessing = true;
    socket.isRunning = false;
    StdMessages.sendScriptExecutionState(socket);

    
  }
}
