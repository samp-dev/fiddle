import { Socket } from 'socket.io';

import { IExtendedSocket } from './interfaces';

export default abstract class StdMessages {
  static sendToast(socket: Socket, message: string, icon: string, intent: string): boolean {
    return socket.emit('toast', { message, icon, intent });
  }

  static sendErrorMessage(socket: Socket, message: string): boolean {
    return this.sendToast(socket, message, 'error', 'danger');
  }

  static sendScriptExecutionState(socket: IExtendedSocket): boolean {
    return socket.emit('setScriptExecutionState', { 
      isProcessing: socket.isProcessing,
      isRunning: socket.isRunning
    });
  }
}
