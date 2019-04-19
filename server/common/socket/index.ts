import { Socket } from 'socket.io';
import adjectiveAdjectiveAnimal from 'adjective-adjective-animal';
import got from 'got';
import _ from 'lodash';

import { IExtendedSocket, IAvailableDependency } from './interfaces';
import { IBuildResponse, IDependency } from '../fiddle/interfaces';

import server from '../express';
import StdMessages from './StdMessages';
import Fiddle from '../fiddle';
import recaptcha from '../recaptcha';
import l from '../logger';

const aaaRegex = /^(?=(.*[A-Z]){3,})(?=(.*[a-z]){3,})[^\W|_|\d]+$/;

export default class SocketServer {
  bannedRepoUsers: string[] = [
    '{{authors}}', // {{authors}}/{project-name}}
    'Username' // Username/Project
  ];

  bannedNatives: string[] = [
    'HTTP',
    'HttpGet',
    'HttpGetThreaded',
    'Request', 
    'RequestJSON',
    'WebSocketClient',
    'JsonWebSocketClient',
  ];

  constructor() {
    server.io.on('connect', (socket: Socket): void => {
      socket.on('disconnect', this.onDisconnect.bind(this, socket));

      socket.on('fiddleID', this.onFiddleID.bind(this, socket));
      socket.on('dependencyList', this.onDependencyList.bind(this, socket));

      socket.on('setTitle', this.onSetTitle.bind(this, socket));
      socket.on('setDependencies', this.onSetDependencies.bind(this, socket));
      socket.on('setContent', this.onSetContent.bind(this, socket));

      socket.on('runScript', this.onRunScript.bind(this, socket));
      socket.on('stopScript', this.onStopScript.bind(this, socket));

      socket.on('share', this.onShare.bind(this, socket));
      socket.on('fork', this.onFork.bind(this, socket));
      socket.on('download', this.onDownload.bind(this, socket));

      this.sendStopScript = this.sendStopScript.bind(this);
    });
  }

  onDisconnect(socket: IExtendedSocket): void {
    if (socket.fiddleInstance && socket.fiddleInstance.process)
      socket.fiddleInstance.terminate();
  }

  async onFiddleID(socket: IExtendedSocket, fiddleID: string): Promise<any> {
    if (fiddleID === undefined || (fiddleID && !aaaRegex.test(fiddleID)))
      return socket.emit('invalidRequest');

    if (fiddleID === '') {
      // New fiddle
      socket.emit('setContentLockState', false); // If we're in compose mode, unlock the content

      socket.composing = true;
      socket.fiddleID = await adjectiveAdjectiveAnimal('pascal');
      // The socket may contain a title and dependencies already if the connection was lost before and the reset-process was faster than generating a fiddleID
      socket.title = socket.title || ''; 
      socket.dependencies = socket.dependencies || [];
      socket.content = socket.content || '#include <a_samp>\n\nmain()\n{\n    \n}\n';

      l.debug('[FIDDLE]', `New fiddleID: ${socket.fiddleID}`);
    } else {
      // Existing fiddle
      socket.emit('setContentLockState', true); // If we're not in compose mode, lock the content

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
      socket.emit('shared', socket.fiddleID);

      l.debug('[FIDDLE]', `Got fiddleID: ${fiddleID}`);
    }
  }

  async onDependencyList(socket: IExtendedSocket): Promise<void> {
    try {
      const sampctlResponse: got.Response<string> = await got('api.sampctl.com');
      const sampctlResponseArray: IDependency[] = JSON.parse(sampctlResponse.body);
      const filteredDependencies: IDependency[] = sampctlResponseArray.filter(dependency => !this.bannedRepoUsers.includes(dependency.user));

      const availableDependencies: IAvailableDependency[] = filteredDependencies
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
    if (dependencies.length > 5)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (You cannot add more than 5 dependencies)');

    for (const dependency of dependencies) {
      if (this.bannedRepoUsers.includes(dependency.user))
        return StdMessages.sendErrorMessage(socket, 'Invalid request. (Invalid / banned dependency found)');
    }

    socket.dependencies = dependencies;
  }

  onSetContent(socket: IExtendedSocket, content: string): any {
    if (Buffer.byteLength(content, 'utf8') > 25600)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Your fiddle cannot be bigger than 25 kB)');

    socket.content = content;
  }

  async onRunScript(socket: IExtendedSocket, captchaToken: string): Promise<any> {
    if (socket.isRunning || socket.isProcessing)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Your script is already running)');

    socket.isProcessing = true;
    socket.isRunning = false;
    StdMessages.sendScriptExecutionState(socket);

    try {
      await recaptcha.validate(captchaToken);
    } catch (ex) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Captcha challenge failed)');
    }

    socket.emit('clearConsole');

    if (!socket.fiddleInstance)
      socket.fiddleInstance = new Fiddle();
    
    await socket.fiddleInstance.setData(socket.fiddleID, socket.title, socket.dependencies, socket.content);
    
    if (!socket.fiddleInstance || !await socket.fiddleInstance.save()) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, 'An error occurred while trying to save your script.');
    }

    if (!socket.fiddleInstance || !await socket.fiddleInstance.ensure()) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, 'Could not ensure package dependencies. Make sure they are still up to date and available.');
    }

    if (!socket.fiddleInstance) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, 'Could not build your fiddle. (Are you trying to fork it while running?)');
    }
    
    const build: IBuildResponse = await socket.fiddleInstance.build();
    if (!build.success) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      socket.emit('appendConsole', build.error);
      return StdMessages.sendErrorMessage(socket, 'Your script has errors. Check the console output.');
    }

    const amxNatives: string[] = await socket.fiddleInstance.interpreteNatives();
    const usedBannedNatives: string[] = _.intersectionWith(this.bannedNatives, amxNatives);
    if (!socket.fiddleInstance || usedBannedNatives.length) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, `You are using the following disabled native function(s): ${usedBannedNatives.join(', ')}`);
    }

    if (!socket.fiddleInstance || !await socket.fiddleInstance.run()) {
      socket.isProcessing = false;
      socket.isRunning = false;
      StdMessages.sendScriptExecutionState(socket);
      return StdMessages.sendErrorMessage(socket, 'An error occurred while trying to execute the script.');
    }

    socket.isProcessing = false;
    socket.isRunning = true;
    StdMessages.sendScriptExecutionState(socket);

    socket.fiddleInstance.subscribeConsole(socket);
    socket.fiddleInstance.subscribeTerminate(socket, this.sendStopScript);
  }

  onStopScript(socket: IExtendedSocket): any {
    if (!socket.isRunning)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Your script is not running yet)');
    
    if (socket.fiddleInstance)
      socket.fiddleInstance.terminate(); // We just hope that the client was subscribed to the error / close event
  }

  async onShare(socket: IExtendedSocket, captchaToken: string): Promise<any> {
    try {
      await recaptcha.validate(captchaToken);
    } catch (ex) {
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (Captcha challenge failed)');
    }

    if (!socket.fiddleInstance)
      socket.fiddleInstance = new Fiddle();

    if (!socket.title || socket.title.trim() === '') // empty title
      socket.title = `${socket.fiddleID}.pwn`;
    
    await socket.fiddleInstance.setData(socket.fiddleID, socket.title, socket.dependencies, socket.content);
    
    if (!await socket.fiddleInstance.save(true))
      return StdMessages.sendErrorMessage(socket, 'An error happened while publishing you fiddle.');
    
    socket.composing = false;
    socket.emit('setContentLockState', !socket.composing);
    socket.emit('setTitle', socket.title);
    socket.emit('setDependencies', socket.dependencies);
    socket.emit('setContent', socket.content);
    socket.emit('shared', socket.fiddleID);
  }

  async onFork(socket: IExtendedSocket): Promise<any> {
    if (socket.composing)
      return StdMessages.sendErrorMessage(socket, 'Invalid request. (You are not viewing a fiddle.)');
    
    socket.fiddleInstance = null;

    const forkSuffix: string = ' - Fork';
    const previousTitle: string = socket.title;

    if ((previousTitle + forkSuffix).length <= 100)
      socket.title += forkSuffix;
    
    socket.fiddleID = await adjectiveAdjectiveAnimal('pascal');

    socket.composing = true;
    socket.emit('setContentLockState', !socket.composing);
    socket.emit('setTitle', socket.title);
    socket.emit('setDependencies', socket.dependencies);
    socket.emit('setContent', socket.content);
    socket.emit('forked', previousTitle);
  }

  async onDownload(socket: IExtendedSocket): Promise<any> {
    if (socket.fiddleInstance)
      return socket.emit('download', `/api/download/${socket.fiddleID}`);
    else
      return socket.emit('download', '');
  }

  sendStopScript(socket: IExtendedSocket): void {
    socket.isProcessing = false;
    socket.isRunning = false;
    StdMessages.sendScriptExecutionState(socket);
  }
}
