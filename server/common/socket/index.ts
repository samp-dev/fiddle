import socketio, { Socket } from 'socket.io';
import adjectiveAdjectiveAnimal from 'adjective-adjective-animal';
import got from 'got';

import { IExtendedSocket, IAvailableDependency } from './interfaces';
import { IBuildResponse, IDependency } from '../fiddle/interfaces';

import server from '../express';
import StdMessages from './StdMessages';
import Fiddle from '../fiddle';

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
    console.log(`[DEBUG]: Got fiddleID: ${fiddleID}`);

    if (fiddleID === undefined || (fiddleID && !aaaRegex.test(fiddleID)))
      return socket.emit('invalidRequest');

    if (fiddleID === '') {
      // New fiddle
      socket.composing = true;
      socket.fiddleID = await adjectiveAdjectiveAnimal('pascal');
      // The socket may contain a title and dependencies already if the connection was lost before and the reset-process was faster than generating a fiddleID
      socket.title = socket.title || ''; 
      socket.dependencies = socket.dependencies || [];
      
      console.log(`[DEBUG]: New fiddleID: ${socket.fiddleID}`);
    } else {
      // Existing fiddle
      socket.emit('setContentLockState', !socket.composing); // If we're not in compose mode, lock the content

      socket.fiddleInstance = new Fiddle();
      
      if (!await socket.fiddleInstance.setData(fiddleID))
        return socket.emit('showErrorDialog', 'There was an error loading your fiddle.');

      socket.composing = false;
      socket.fiddleID = fiddleID;
      socket.title = socket.fiddleInstance.title;
      socket.dependencies = socket.fiddleInstance.dependencies;
      socket.content = socket.fiddleInstance.content;

      if (!socket.title)
        return socket.emit('showErrorDialog', 'Fiddle not found.');
      
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

  async onRunScript(socket: IExtendedSocket): Promise<any> {
    if (socket.isRunning || socket.isProcessing)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Your script is already running)');

    socket.isProcessing = true;
    socket.isRunning = false;
    StdMessages.sendScriptExecutionState(socket);

    socket.emit('clearConsole');

    if (!socket.fiddleInstance) {
      socket.fiddleInstance = new Fiddle();
      await socket.fiddleInstance.setData(socket.fiddleID, socket.title, socket.dependencies, socket.content);
    }
    
    if (!await socket.fiddleInstance.save()) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, 'An error occurred while trying to save your script.');
    }

    if (!await socket.fiddleInstance.ensure()) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, 'Could not ensure package dependencies. Make sure they are still up to date and available.');
    }

    const build: IBuildResponse = await socket.fiddleInstance.build();
    if (!build.success) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      socket.emit('appendConsole', build.error.replace('\\n', '<br />'));
      return StdMessages.sendErrorMessage(socket, 'Your script has errors. Check the console output.');
    }
    
    if (!await socket.fiddleInstance.run()) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, 'An error occurred while trying to execute the script.');
    }

    socket.isProcessing = false;
    socket.isRunning = true;
    StdMessages.sendScriptExecutionState(socket);

    socket.fiddleInstance.subscribeConsole(socket);
  }
}
