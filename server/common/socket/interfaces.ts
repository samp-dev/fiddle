import { Socket } from 'socket.io';
import Fiddle from '../fiddle';

export interface IExtendedSocket extends Socket {
  composing?: boolean,
  fiddleID?: string,
  title?: string,
  dependencies?: IDependency[],
  content?: string,
  isRunning?: boolean,
  isProcessing?: boolean,
  fiddleInstance?: Fiddle
}

export interface IDependency {
  user: string,
  repo: string,
  classification: string,
  dependencies?: string[],
  resources?: Object[]
}

export interface IAvailableDependency {
  label: string,
  value: IDependency
}
