import { Socket } from 'socket.io';

import Fiddle from '../fiddle';
import { IDependency } from '../fiddle/interfaces';

export interface IExtendedSocket extends Socket {
  composing?: boolean;
  fiddleID?: string;
  title?: string;
  dependencies?: IDependency[];
  content?: string;
  isRunning?: boolean;
  isProcessing?: boolean;
  fiddleInstance?: Fiddle;
}

export interface IAvailableDependency {
  label: string;
  value: IDependency;
}
